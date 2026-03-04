import { getUserPermissions } from "./permission.utils";
import type { PermissionAction } from "./permission.types";

export function usePermissions() {
	const permissions = getUserPermissions();

	function can(module: string, action: PermissionAction) {
		const found = permissions.find((p) => p.module === module);
		if (!found) return false;

		return found.actions.includes(action);
	}

	return { can };
}
