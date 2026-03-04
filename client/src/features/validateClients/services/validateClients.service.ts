//Llamadas http
import { apiRequest } from "@/shared/lib/queryClient";
import { ValidateClientDTO } from "../types/validateClientDTO";

export const validateIndividual = async (data: ValidateClientDTO) => {
	const res = await apiRequest("POST", "/api/laft/validate", data);
	return res.json();
};

export const validateBulk = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);

	const res = await apiRequest("POST", "/api/laft/bulk", {
		body: formData,
		credentials: "include",
	});
  
	return res.json();
};