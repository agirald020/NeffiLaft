import { getKeycloak } from "@/shared/lib/keycloak";
import type { ModulePermission, PermissionAction } from "./permission.types";

const VALID_ACTIONS: PermissionAction[] = ["C", "R", "U", "D"];

export function getUserPermissions(): ModulePermission[] {
	const keycloak = getKeycloak();
	const token = keycloak.tokenParsed as any;

	const roles: string[] = token?.realm_access?.roles || [];

	return roles
		.filter((role) => role.includes("_"))
		.map((role) => {
			const [module, actionString] = role.split("_");

			const actions: PermissionAction[] = actionString
				.split("")
				.filter((char): char is PermissionAction => VALID_ACTIONS.includes(char as PermissionAction));

			return {
				module,
				actions,
			};
		});
}
