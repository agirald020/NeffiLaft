// client\src\features\validateClients\store\validateClients.store.ts
import { create } from "zustand";
import { BulkResult, RestrictiveListMatch } from "../types/validateClients.types";

type PersonType = "natural" | "juridica";

interface ValidationState {
	// ----- Individual -----
	documentNumber: string;
	personType: PersonType;
	firstName: string;
	secondName: string;
	firstLastName: string;
	secondLastName: string;
	companyName: string;
  businessName: string;

	results: RestrictiveListMatch[] | null;

	// ----- Bulk -----
	selectedFile: File | null;
	bulkResults: BulkResult[] | null;

	// ----- UI -----
	searchContext: { type: string; value: string } | null;

	// ----- Actions -----
	setDocumentNumber: (value: string) => void;
	setPersonType: (type: PersonType) => void;
	setFirstName: (value: string) => void;
	setSecondName: (value: string) => void;
	setFirstLastName: (value: string) => void;
	setSecondLastName: (value: string) => void;
	setCompanyName: (value: string) => void;
  setBusinessName: (value: string) => void;

	setResults: (data: RestrictiveListMatch[] | null) => void;

	setSelectedFile: (file: File | null) => void;
	setBulkResults: (data: BulkResult[] | null) => void;

	setSearchContext: (ctx: { type: string; value: string } | null) => void;

	resetIndividual: () => void;
	resetBulk: () => void;
	resetAll: () => void;
}

export const useValidationStore = create<ValidationState>((set) => ({
	// ----- Initial State -----
	documentNumber: "",
	personType: "natural",
	firstName: "",
	secondName: "",
	firstLastName: "",
	secondLastName: "",
	companyName: "",
  businessName: "",
	results: null,

	selectedFile: null,
	bulkResults: null,

	searchContext: null,

	// ----- Setters -----
	setDocumentNumber: (value) => set({ documentNumber: value }),
	setPersonType: (type) => set({ personType: type }),
	setFirstName: (value) => set({ firstName: value }),
	setSecondName: (value) => set({ secondName: value }),
	setFirstLastName: (value) => set({ firstLastName: value }),
	setSecondLastName: (value) => set({ secondLastName: value }),
	setCompanyName: (value) => set({ companyName: value }),
  setBusinessName: (value) => set({ businessName: value }),

	setResults: (data) => set({ results: data }),

	setSelectedFile: (file) => set({ selectedFile: file }),
	setBulkResults: (data) => set({ bulkResults: data }),

	setSearchContext: (ctx) => set({ searchContext: ctx }),

	// ----- Resetters -----
	resetIndividual: () =>
		set({
			documentNumber: "",
			firstName: "",
			secondName: "",
			firstLastName: "",
			secondLastName: "",
			companyName: "",
      businessName: "",
			results: null,
			searchContext: null,
		}),

	resetBulk: () =>
		set({
			selectedFile: null,
			bulkResults: null,
		}),

	resetAll: () =>
		set({
			documentNumber: "",
			personType: "natural",
			firstName: "",
			secondName: "",
			firstLastName: "",
			secondLastName: "",
			companyName: "",
      businessName: "",
			results: null,
			selectedFile: null,
			bulkResults: null,
			searchContext: null,
		}),
}));
