//Llamadas http
import { apiRequest } from "@/shared/lib/queryClient";
import { ValidateClientDTO } from "../types/validateClientDTO";
import { RestrictiveListMatch } from "../types/validateClients.types";

export const validateIndividual = async (data: ValidateClientDTO) => {
	const res = await apiRequest("POST", "/api/laft/validate", data);
	return res.json();
};

export const validateBulk = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);

	const res = await apiRequest("POST", "/api/laft/validate/bulk", formData);
  
	return res.json();
};

export const downloadValidationPdf = async (data: RestrictiveListMatch[]) => {
	const res = await apiRequest("POST", "/api/laft/validate/report/pdf", data);
	return res.blob();
};

export const downloadValidationExcel = async (data: RestrictiveListMatch[]) => {
	const res = await apiRequest("POST", "/api/laft/validate/report/excel", data);
	return res.blob();
};