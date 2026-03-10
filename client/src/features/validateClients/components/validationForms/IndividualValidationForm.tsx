// client\src\features\validateClients\components\validationForms\IndividualValidationForm.tsx
import React, { FunctionComponent } from "react";
import { Building2, UserRound, Loader2, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { useValidateClient } from "../../hooks/useValidateClient";
import { useValidationStore } from "../../stores/validateClients.store";
import type { ValidateDto, RestrictiveListMatch } from "../../types/validateClients.types";
import { ValidateClientDTO } from "../../types/validateClientDTO";
import { hasPermission } from "@/shared/lib/permissions";

interface IndividualValidationFormProps { }


const IndividualValidationForm: FunctionComponent<IndividualValidationFormProps> = () => {
  // !hooks
  const { toast } = useToast();
  const { individualMutation } = useValidateClient();

  //! selector desde zustand: selecciona sólo lo necesario para evitar re-renders globales
  // valores
  const companyName = useValidationStore(s => s.companyName);
  const firstName = useValidationStore(s => s.firstName);
  const secondName = useValidationStore(s => s.secondName);
  const firstLastName = useValidationStore(s => s.firstLastName);
  const secondLastName = useValidationStore(s => s.secondLastName);
  const documentNumber = useValidationStore(s => s.documentNumber);
  const personType = useValidationStore(s => s.personType);

  // setters
  const setDocumentNumber = useValidationStore(s => s.setDocumentNumber);
  const setPersonType = useValidationStore(s => s.setPersonType);
  const setCompanyName = useValidationStore(s => s.setCompanyName);
  const setFirstName = useValidationStore(s => s.setFirstName);
  const setSecondName = useValidationStore(s => s.setSecondName);
  const setFirstLastName = useValidationStore(s => s.setFirstLastName);
  const setSecondLastName = useValidationStore(s => s.setSecondLastName);

  const setResults = useValidationStore(s => s.setResults);
  const setBulkResults = useValidationStore(s => s.setBulkResults);
  const setSearchContext = useValidationStore(s => s.setSearchContext);

  const clearNaturalFields = () => {
    setFirstName("");
    setSecondName("");
    setFirstLastName("");
    setSecondLastName("");
  };

  const clearJuridicalFields = () => {
    setCompanyName("");
  };

  //! helpers locales
  const buildFullName = () => {
    if (personType === "juridica") return companyName.trim();
    return [firstName, secondName, firstLastName, secondLastName]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  };

  const sanitizeWord = (value: string) => value.replace(/\s/g, "");

  const showResultToast = (count: number) => {
    if (count > 0) {
      toast({
        title: "Coincidencias encontradas",
        description: `Se encontraron ${count} coincidencia(s) en listas restrictivas.`,
        variant: "destructive",
      });
    } else {
      toast({ title: "Sin coincidencias", description: "No se encontraron resultados en listas restrictivas." });
    }
  };

  const showErrorToast = (message?: string) => {
    toast({ title: "Error", description: message || "No se pudo realizar la validación. Intente nuevamente.", variant: "destructive" });
  };

  // mapper a lo que pide el backend
  const mapToBackendDto = (): ValidateClientDTO => {
    const doc = documentNumber.trim();

    return {
      p_IDENTIFICACION: doc,
      p_NOMBRE_1: personType === "juridica" ? companyName.trim() : firstName.trim(),
      p_NOMBRE_2: personType === "juridica" ? undefined : secondName.trim(),
      p_APELLIDO_1: personType === "juridica" ? undefined : firstLastName.trim(),
      p_APELLIDO_2: personType === "juridica" ? undefined : secondLastName.trim(),
    };

  };

  const handleNaturalPerson = () => {
    setPersonType("natural");
    clearJuridicalFields();
  };

  const handleJuridicalPerson = () => {
    setPersonType("juridica");
    clearNaturalFields();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setResults(null);
    setBulkResults(null);
    const doc = documentNumber.trim();
    const fullName = buildFullName().trim();

    if (personType === "natural") {
      const hasName = firstName.trim() || secondName.trim();
      const hasLastName = firstLastName.trim() || secondLastName.trim();

      if (!doc && (!hasName || !hasLastName)) {
        toast({
          title: "Datos insuficientes",
          description: "Debe ingresar al menos un nombre y un apellido o el número de documento.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!documentNumber.trim() && !buildFullName().trim()) {
      toast({
        title: "Campo requerido",
        description: "Debe ingresar número de documento o nombres para realizar la búsqueda.",
        variant: "destructive",
      });
      return;
    }

    // Conservamos ValidateDto interno si lo usas en otras partes del frontend.
    const payloadFrontend: ValidateDto = {};
    if (doc) payloadFrontend.documentNumber = doc;
    if (fullName) payloadFrontend.fullName = fullName;
    payloadFrontend.personType = personType;
    if (personType === "natural") {
      if (firstName.trim()) payloadFrontend.firstName = firstName.trim();
      if (secondName.trim()) payloadFrontend.secondName = secondName.trim();
      if (firstLastName.trim()) payloadFrontend.firstLastName = firstLastName.trim();
      if (secondLastName.trim()) payloadFrontend.secondLastName = secondLastName.trim();
    } else {
      if (companyName.trim()) payloadFrontend.businessName = companyName.trim();
    }

    // Mapeamos AL DTO del backend justo antes de enviar
    const backendDto = mapToBackendDto();

    individualMutation.mutate(backendDto, {
      onSuccess: (data: RestrictiveListMatch[]) => {
        // actualizamos store para que otros componentes consuman
        setResults(data);
        setBulkResults(null);
        setSearchContext({ type: "individual", value: documentNumber });
        showResultToast(data.length);
      },
      onError: (err: any) => {
        showErrorToast(err?.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-validate">
      {/* tipo persona */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Persona</Label>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleNaturalPerson}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${personType === "natural"
              ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
              : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
              }`}
            data-testid="button-person-natural"
          >
            <UserRound className="w-5 h-5" />
            <span className="text-sm font-medium">Persona Natural</span>
          </button>
          <button
            type="button"
            onClick={handleJuridicalPerson}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${personType === "juridica"
              ? "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
              : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
              }`}
            data-testid="button-person-juridica"
          >
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">Persona Jurídica</span>
          </button>
        </div>
      </div>

      {/* identificación */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Identificación</p>
        <div className="space-y-2">
          <Label htmlFor="documentNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Número de Documento
          </Label>
          <Input
            id="documentNumber"
            type="text"
            inputMode="numeric"
            placeholder="Ej: 1023456789"
            value={documentNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // elimina todo lo que no sea número
              setDocumentNumber(value);
            }}
            className="h-10"
            data-testid="input-document-number"
          />
        </div>
      </div>

      {/* datos personales / empresa */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {personType === "juridica" ? "Datos de la Empresa" : "Datos Personales"}
        </p>

        {personType === "juridica" ? (
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Razón Social
            </Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Ej: INVERSIONES EL DORADO S.A.S."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-10"
              data-testid="input-company-name"
            />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primer Nombre
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ej: CARLOS"
                  value={firstName}
                    onChange={(e) => setFirstName(sanitizeWord(e.target.value))}
                  className="h-10"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Segundo Nombre
                </Label>
                <Input
                  id="secondName"
                  type="text"
                  placeholder="Ej: ANDRÉS"
                  value={secondName}
                    onChange={(e) => setSecondName(sanitizeWord(e.target.value))}
                  className="h-10"
                  data-testid="input-second-name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstLastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primer Apellido
                </Label>
                <Input
                  id="firstLastName"
                  type="text"
                  placeholder="Ej: MARTÍNEZ"
                  value={firstLastName}
                  onChange={(e) => setFirstLastName(sanitizeWord(e.target.value))}
                  className="h-10"
                  data-testid="input-first-lastname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondLastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Segundo Apellido
                </Label>
                <Input
                  id="secondLastName"
                  type="text"
                  placeholder="Ej: LÓPEZ"
                  value={secondLastName}
                  onChange={(e) => setSecondLastName(sanitizeWord(e.target.value))}
                  className="h-10"
                  data-testid="input-second-lastname"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTÓN VALIDAR */}
      <Button
        type="submit"
        disabled={individualMutation.isPending || !hasPermission("validacion-individual-R")}
        className="w-full h-11 bg-red-600 hover:bg-red-700 text-white text-base"
        data-testid="button-validate"
      >
        {individualMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Search className="w-4 h-4 mr-2" />
        )}
        Validar en Listas Restrictivas
      </Button>
    </form>
  );
};

export default IndividualValidationForm;