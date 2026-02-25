import { ReactNode, useEffect, useState } from "react";
import { AuthContext } from "@/hooks/use-auth";
import type { AuthContextType, User } from "@/hooks/use-auth";
import {
  fetchKeycloakConfig,
  initKeycloakInstance,
  getAuthHeader,
} from "@/lib/keycloak";
import type Keycloak from "keycloak-js";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [keycloakInstance, setKeycloakInstance] = useState<Keycloak | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  async function initAuth() {
    try {
      // Fetch config from server (has the correct realm, url, clientId)
      const config = await fetchKeycloakConfig();

      // Bypass mode: server already returns user without token
      if (config.bypassActive) {
        const res = await fetch("/api/auth/user", { credentials: "include" });
        if (res.ok) setUser(await res.json());
        setIsLoading(false);
        return;
      }

      // Keycloak mode: initialize with server-provided config
      const kc = initKeycloakInstance(config);
      setKeycloakInstance(kc);

      const authenticated = await kc.init({
        onLoad: "check-sso",
        checkLoginIframe: false,
        pkceMethod: "S256",
      });

      if (authenticated) {
        const res = await fetch("/api/auth/user", {
          headers: getAuthHeader(),
          credentials: "include",
        });
        if (res.ok) setUser(await res.json());

        // Auto-refresh token before expiry
        setInterval(async () => {
          try { await kc.updateToken(60); } catch { kc.login(); }
        }, 30000);
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }

  const login = () => {
    if (keycloakInstance) {
      keycloakInstance.login({ redirectUri: window.location.origin + "/" });
    }
  };

  const logout = async () => {
    if (keycloakInstance) {
      keycloakInstance.logout({ redirectUri: window.location.origin + "/" });
    } else {
      setUser(null);
      window.location.href = "/";
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
