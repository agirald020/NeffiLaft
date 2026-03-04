import { useMutation } from "@tanstack/react-query";
import { validateBulk, validateIndividual } from "../services/validateClients.service";

export const useValidateClient = () => {
	const individualMutation = useMutation({
		mutationFn: validateIndividual,
	});

	const bulkMutation = useMutation({
		mutationFn: validateBulk,
	});

	return {
		individualMutation,
		bulkMutation,
	};
};
