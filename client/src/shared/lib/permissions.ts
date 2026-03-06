import { getKeycloak } from "@/shared/lib/keycloak";

//todo: traerlo de un param del env
export const KEYCLOAK_CLIENT = "neffiLaft-app";

export function hasPermission(permission: string): boolean {
  const token = getKeycloak().tokenParsed as any;

  const roles =
    token?.resource_access?.[KEYCLOAK_CLIENT]?.roles || [];

  return roles.includes(permission);
}