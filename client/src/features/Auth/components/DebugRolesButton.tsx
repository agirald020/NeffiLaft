// features/Auth/components/DebugRolesButton.tsx

import { getKeycloak } from "@/shared/lib/keycloak";
import { usePermissions } from "../permissions/use-permissions";

export function DebugRolesButton() {
  const { can } = usePermissions();

  const handleClick = () => {
    const keycloak = getKeycloak();
    const tokenParsed = keycloak.tokenParsed as any;

    const realmRoles = tokenParsed?.realm_access?.roles || [];
    const resourceRoles =
      tokenParsed?.resource_access?.[keycloak.clientId || ""]?.roles || [];

    console.log("========== USER DEBUG ==========");
    console.log("Username:", tokenParsed?.preferred_username);
    console.log("Realm Roles:", realmRoles);
    console.log("Client Roles:", resourceRoles);

    console.log("---- Parsed Permissions ----");

    const modules = realmRoles
      .filter((r: string) => r.includes("_"))
      .map((r: string) => {
        const [module, actionString] = r.split("_");
        return {
          module,
          actions: actionString.split(""),
        };
      });

    console.table(modules);

    console.log("---- Permission Checks ----");
    console.log("Can VALIDAR_LISTAS Read:", can("VALIDAR_LISTAS", "R"));
    console.log("Can VALIDAR_LISTAS Create:", can("VALIDAR_LISTAS", "C"));
    console.log("Can VALIDAR_LISTAS Update:", can("VALIDAR_LISTAS", "U"));
    console.log("Can VALIDAR_LISTAS Delete:", can("VALIDAR_LISTAS", "D"));

    console.log("================================");
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "8px 12px",
        background: "#111",
        color: "#fff",
        borderRadius: "6px",
        fontSize: "14px",
      }}
    >
      Debug Roles & Permissions
    </button>
  );
}