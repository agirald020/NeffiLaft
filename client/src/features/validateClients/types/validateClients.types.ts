// client\src\features\validateClients\types\validateClients.types.ts
export interface RestrictiveListMatch {
	id: string;
	documentType: string;
	documentNumber: string;
	fullName: string;
	listName: string;
	listSource: string;
	matchType: string;
	matchScore: number;
}

export interface BulkResult {
	queryDocumentNumber: string;
	queryFullName: string;
	matchCount: number;
	matches: RestrictiveListMatch[];
}

/**
 * DTO usado para validar individualmente.
 * documentNumber o fullName deben enviarse (al menos uno).
 * Incluimos campos opcionales que pueden ayudar al backend
 * a construir/normalizar el nombre si es necesario.
 */
export interface ValidateDto {
  documentNumber?: string;
  fullName?: string;
  personType?: "natural" | "juridica";
  firstName?: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  businessName?: string;
}
