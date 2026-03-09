import { useMutation } from "@tanstack/react-query";
import { downloadValidationExcel, downloadValidationPdf, validateBulk, validateIndividual } from "../services/validateClients.service";

export const useValidateClient = () => {
	const individualMutation = useMutation({
		mutationFn: validateIndividual,
	});

	const bulkMutation = useMutation({
		mutationFn: validateBulk,
	});

	const pdfMutation = useMutation({
		mutationFn: downloadValidationPdf,
	});

	const excelMutation = useMutation({
		mutationFn: downloadValidationExcel,
	});

	return {
		individualMutation,
		bulkMutation,
		pdfMutation,
		excelMutation,
	};
};
