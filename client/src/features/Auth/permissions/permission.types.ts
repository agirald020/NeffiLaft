export type PermissionAction = "C" | "R" | "U" | "D";

export interface ModulePermission {
	module: string;
	actions: PermissionAction[];
}