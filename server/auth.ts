import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { log } from "./index";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "https://keycloak.example.com";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "neffitrust";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "neffilaft";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || "";
const DEV_BYPASS = process.env.NODE_ENV !== "production";

function getBaseUrl(req: Request): string {
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:5000";
  return `${protocol}://${host}`;
}

function getKeycloakUrls() {
  const base = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
  return {
    authorization: `${base}/protocol/openid-connect/auth`,
    token: `${base}/protocol/openid-connect/token`,
    userinfo: `${base}/protocol/openid-connect/userinfo`,
    logout: `${base}/protocol/openid-connect/logout`,
    jwks: `${base}/protocol/openid-connect/certs`,
  };
}

declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    user?: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
    };
  }
}

const DEV_USER = {
  id: "dev-user-001",
  username: "dev.user",
  email: "dev@neffilaft.local",
  firstName: "Usuario",
  lastName: "Desarrollo",
  roles: ["admin", "user"],
};

export function setupAuth(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "neffilaft-session-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.get("/api/auth/login", (req: Request, res: Response) => {
    if (DEV_BYPASS) {
      req.session.user = DEV_USER;
      log(`[DEV BYPASS] User logged in: ${DEV_USER.username}`, "auth");
      return res.redirect("/");
    }

    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/api/auth/callback`;
    const urls = getKeycloakUrls();

    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email",
      state: Math.random().toString(36).substring(2),
    });

    res.redirect(`${urls.authorization}?${params.toString()}`);
  });

  app.get("/api/auth/callback", async (req: Request, res: Response) => {
    if (DEV_BYPASS) {
      req.session.user = DEV_USER;
      return res.redirect("/");
    }

    const { code } = req.query;

    if (!code) {
      return res.redirect("/?error=no_code");
    }

    try {
      const baseUrl = getBaseUrl(req);
      const redirectUri = `${baseUrl}/api/auth/callback`;
      const urls = getKeycloakUrls();

      const tokenResponse = await fetch(urls.token, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: KEYCLOAK_CLIENT_ID,
          client_secret: KEYCLOAK_CLIENT_SECRET,
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        log(`Token exchange failed: ${errorText}`, "auth");
        return res.redirect("/?error=token_exchange_failed");
      }

      const tokens = await tokenResponse.json();

      const userinfoResponse = await fetch(urls.userinfo, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userinfoResponse.ok) {
        log("Failed to fetch user info", "auth");
        return res.redirect("/?error=userinfo_failed");
      }

      const userinfo = await userinfoResponse.json();

      let roles: string[] = [];
      try {
        const tokenPayload = JSON.parse(
          Buffer.from(tokens.access_token.split(".")[1], "base64").toString()
        );
        roles = tokenPayload.realm_access?.roles || [];
        const clientRoles = tokenPayload.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
        roles = [...roles, ...clientRoles];
      } catch (e) {
        log("Failed to parse token roles", "auth");
      }

      req.session.accessToken = tokens.access_token;
      req.session.refreshToken = tokens.refresh_token;
      req.session.idToken = tokens.id_token;
      req.session.user = {
        id: userinfo.sub,
        username: userinfo.preferred_username || userinfo.sub,
        email: userinfo.email || "",
        firstName: userinfo.given_name || "",
        lastName: userinfo.family_name || "",
        roles,
      };

      log(`User logged in: ${req.session.user.username}`, "auth");
      res.redirect("/");
    } catch (error: any) {
      log(`Auth callback error: ${error.message}`, "auth");
      res.redirect("/?error=auth_failed");
    }
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.session.user) {
      return res.json({
        isAuthenticated: true,
        user: req.session.user,
      });
    }

    if (DEV_BYPASS) {
      req.session.user = DEV_USER;
      return res.json({
        isAuthenticated: true,
        user: DEV_USER,
      });
    }

    res.json({
      isAuthenticated: false,
      user: null,
    });
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const idToken = req.session.idToken;
    const urls = getKeycloakUrls();

    req.session.destroy((err) => {
      if (err) {
        log(`Logout session destroy error: ${err.message}`, "auth");
      }
    });

    if (DEV_BYPASS || !idToken) {
      return res.json({ logoutUrl: "/" });
    }

    const baseUrl = getBaseUrl(req);
    const logoutUrl = new URL(urls.logout);
    logoutUrl.searchParams.set("id_token_hint", idToken);
    logoutUrl.searchParams.set("post_logout_redirect_uri", baseUrl);

    res.json({ logoutUrl: logoutUrl.toString() });
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    return next();
  }

  if (DEV_BYPASS) {
    req.session.user = DEV_USER;
    return next();
  }

  res.status(401).json({ message: "No autenticado" });
}
