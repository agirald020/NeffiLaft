//Llamadas http
import { apiRequest } from "@/shared/lib/queryClient";
import { ValidateClientDTO } from "../types/validateClientDTO";
import { BulkResult, RestrictiveListMatch } from "../types/validateClients.types";

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

export const downloadValidationExcel = async (data: BulkResult[]) => {
	const clientIp = await getClientIp();
	const dataWithIp = data.map(result => ({
		...result,
		userIp: clientIp
	}));
	const res = await apiRequest("POST", "/api/laft/validate/report/excel", dataWithIp);
	return res.blob();
};

// Cache para la IP del cliente
let cachedClientIp: string | null = null;

export const getClientIp = async (): Promise<string> => {
	// Retorna del caché si ya lo tenemos
	if (cachedClientIp) {
		return cachedClientIp;
	}

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

		const response = await fetch("https://api.ipify.org?format=json", {
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: { ip: string } = await response.json();
		cachedClientIp = data.ip;
		return data.ip;
	} catch (error) {
		console.warn("Error fetching client IP:", error);
		// Retorna un valor por defecto en caso de error
		return "0.0.0.0";
	}
};


