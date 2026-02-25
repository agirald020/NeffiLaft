import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || "http://localhost:8080";
const IS_DEV = process.env.NODE_ENV === "development";
const AUTH_BYPASS = process.env.AUTH_BYPASS === "true";

const DEV_USER = {
  id: "dev-user",
  username: "dev@bypass",
  email: "dev@bypass.local",
  name: "Usuario de Desarrollo",
  roles: ["admin", "user"],
};

const app = express();

app.use((req, _res, next) => {
  if (req.path.startsWith("/api")) {
    log(`→ [Spring Boot] ${req.method} ${req.path}`);
  }
  next();
});

// Expose Keycloak config to the frontend (no secrets here, only public info)
app.get("/api/auth/keycloak-config", (_req: Request, res: Response) => {
  res.json({
    url: process.env.KEYCLOAK_URL || "http://localhost:8080",
    realm: process.env.KEYCLOAK_REALM || "Ideea",
    clientId: process.env.KEYCLOAK_CLIENT_ID || "neffi-trust-dev",
    bypassActive: AUTH_BYPASS,
  });
});

// Auth bypass: respond with dev user without hitting Spring Boot
if (AUTH_BYPASS) {
  log("⚠️  AUTH_BYPASS=true — respondiendo con usuario de desarrollo");
  app.get("/api/auth/user", (_req: Request, res: Response) => {
    res.json(DEV_USER);
  });
}

// Proxy all /api requests to Spring Boot (pathRewrite restores the /api prefix
// that Express strips when mounting on "/api")
app.use(
  "/api",
  createProxyMiddleware({
    target: SPRING_BOOT_URL,
    changeOrigin: true,
    pathRewrite: { "^/": "/api/" },
    on: {
      error: (err, _req, res: any) => {
        console.error("❌ Spring Boot no disponible:", err.message);
        res.status(503).json({
          error: "Backend Spring Boot no disponible",
          message: "Asegúrese de que el workflow 'Spring Boot Backend' esté corriendo en el puerto 8080.",
        });
      },
    },
  })
);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

(async () => {
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5010", 10);
  const listenOptions: any = { port, host: "0.0.0.0" };
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }
  server.listen(listenOptions, () => {
    log(`Frontend en puerto ${port} → API en Spring Boot ${SPRING_BOOT_URL}`);
  });
})();
