// client\src\features\validateClients\types\validateClients.types.ts
export interface RestrictiveListMatch {
  // Identificadores / metadatos
  codigoLista: number;            // código de la lista (proviene del backend)
  entNum: number;                 // id/numero de entidad (usar como key único)
  nombre: string;                 // nombre (puede ser nombre de la lista o registro)
  sdnName?: string | null;        // nombre alterno (ej. nombre normalizado en SDN)
  tipo?: string | null;           // posible origen/tipo de la lista
  tipoLista?: string | null;      // código tipo lista
  descriTipoLista?: string | null;// descripción tipo de lista

  // campos de validación / coincidencia
  prioridadValidacion: number;    // 1 = exacto (por convención), >1 = menor prioridad
  permiteIdentificacion?: string | null; // 'S'/'N' u 'Y'/'N' o valores similares
  permiteHomonimia?: string | null;      // S/N
  tipoDocumento?: string | number | null; // tipo de documento (si aplica)
  identificacion?: string | null;        // número de documento relacionado
  entNumSec?: number | null;             // otro id si lo devuelve backend

  // info de auditoría
  usuario?: string | null;
  fechaActualizacion?: string | null | Date;

  // campos libres / textos
  comentarios?: string | null;
  comentarios2?: string | null;

  // campos misceláneos
  descri?: string | null;
  // Si el backend tiene otros campos, agrégalos (con ? para mantener compatibilidad)
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
