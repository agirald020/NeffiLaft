import { z } from "zod";

export const thirdPartySearchSchema = z.object({
  searchType: z.enum(["name", "cedula"]),
  searchValue: z.string().min(1, "El valor de búsqueda es requerido"),
});

export type ThirdPartySearch = z.infer<typeof thirdPartySearchSchema>;

export interface ThirdPartyResult {
  id: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
  listName: string;
  matchPercentage: number;
  status: "found" | "not_found" | "pending";
  checkedAt: string;
}

export interface ExcelUploadResult {
  totalRecords: number;
  processedRecords: number;
  errors: string[];
  status: "completed" | "processing" | "error";
}

export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: KeycloakUser | null;
}

export type InsertUser = { username: string; password: string };
export type User = { id: string; username: string; password: string };
