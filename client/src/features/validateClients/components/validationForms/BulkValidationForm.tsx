// client\src\features\validateClients\components\validationForms\BulkValidationForm.tsx

import { FunctionComponent, useRef } from "react";
import { Upload, FileText, X, Loader2, Download } from "lucide-react";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/hooks/use-toast";

import { useValidationStore } from "../../stores/validateClients.store";
import { useValidateClient } from "../../hooks/useValidateClient";
import type { BulkResult } from "../../types/validateClients.types";
import { hasPermission } from "@/shared/lib/permissions";
import { apiRequest } from "@/shared/lib/queryClient";

interface BulkValidationFormProps { }

const BulkValidationForm: FunctionComponent<BulkValidationFormProps> = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  //! ---- Zustand Store ----
  // valores
  const selectedFile = useValidationStore(s => s.selectedFile);

  // setters
  const setSelectedFile = useValidationStore(s => s.setSelectedFile);
  const setBulkResults = useValidationStore(s => s.setBulkResults);
  const setResults = useValidationStore(s => s.setResults);
  const setSearchContext = useValidationStore(s => s.setSearchContext);

  //! ---- React Query ----
  const { bulkMutation } = useValidateClient();

  //! ---- Handlers ----
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      toast({
        title: "Formato inválido",
        description: "Solo se permiten archivos .xlsx",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setResults(null);
    setBulkResults(null);
    
    if (!selectedFile) {
      toast({
        title: "Archivo requerido",
        description: "Debe seleccionar un archivo Excel.",
        variant: "destructive",
      });
      return;
    }

    bulkMutation.mutate(selectedFile, {
      onSuccess: (data: BulkResult[]) => {
        setBulkResults(data);
        setResults(null);
        setSearchContext({
          type: "bulk",
          value: selectedFile.name,
        });

        toast({
          title: "Validación completada",
          description: `Se procesaron ${data.length} registros.`,
        });
      },
      onError: (err: any) => {
        toast({
          title: "Error al validar archivo",
          description:
            err?.message ||
            "No se pudo procesar el archivo. Intente nuevamente.",
          variant: "destructive",
        });
      },
    });
  };

  const downloadTemplate = async () => {
    try {
      const res = await apiRequest(
        "GET",
        "/api/laft/validate/bulk/template"
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "plantilla_validacion_listas.xlsx";

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      toast({
        title: "Error descargando plantilla",
        description: err?.message || "No se pudo descargar la plantilla",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleBulkSubmit}
      className="space-y-5"
      data-testid="form-validate-bulk"
    >
      <div className="space-y-4">
        {/* INPUT FILE */}
        <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
            Archivo Excel (.xlsx)
          </Label>

          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-red-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            data-testid="dropzone-excel"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-file-excel"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center space-x-3">
                <FileText className="w-8 h-8 text-red-500" />

                <div className="text-left">
                  <p
                    className="text-sm font-semibold text-gray-900 dark:text-white"
                    data-testid="text-filename"
                  >
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current)
                      fileInputRef.current.value = "";
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  data-testid="button-remove-file"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Haga clic para seleccionar un archivo Excel
                </p>
                <p className="text-xs text-gray-400">
                  Formato: .xlsx con columnas: N° Documento, Primer Nombre,
                  Segundo Nombre, Primer Apellido, Segundo Apellido, Razón
                  Social
                </p>
              </>
            )}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Formato esperado del archivo:</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-7 px-3"
                onClick={downloadTemplate}
              >
                Descargar Plantilla
              </Button>
          </div>
        </div>
      </div>

      {/* BOTÓN VALIDAR */}
      <Button
        type="submit"
        disabled={bulkMutation.isPending || !selectedFile || !hasPermission("validacion-masiva-R")}
        className="w-full h-10 bg-red-600 hover:bg-red-700 text-white"
        data-testid="button-validate-bulk"
      >
        {bulkMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        Validar Archivo
      </Button>
    </div>
    </form >
  );
};

export default BulkValidationForm;