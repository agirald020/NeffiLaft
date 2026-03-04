import Keycloak from "keycloak-js";

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  bypassActive: boolean;
}

let _instance: Keycloak | null = null;

export async function fetchKeycloakConfig(): Promise<KeycloakConfig> {
  const res = await fetch("/api/auth/keycloak-config");
  if (!res.ok) throw new Error("No se pudo obtener la configuración de Keycloak");
  return res.json();
}

export function initKeycloakInstance(config: KeycloakConfig): Keycloak {
  _instance = new Keycloak({
    url: config.url,
    realm: config.realm,
    clientId: config.clientId,
  });
  return _instance;
}

export function getKeycloak(): Keycloak {
  if (!_instance) throw new Error("Keycloak no inicializado");
  return _instance;
}

export function getAuthHeader(): Record<string, string> {
  const token = _instance?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
