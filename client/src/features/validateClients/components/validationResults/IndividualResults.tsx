// client/src/features/validateClients/components/validationResults/IndividualResults.tsx

import React, { FunctionComponent, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  FileDown,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { useValidationStore } from "../../stores/validateClients.store";
import type { BulkResult, RestrictiveListMatch } from "../../types/validateClients.types";
import { useValidateClient } from "../../hooks/useValidateClient";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { AppButton } from "@/shared/components/AppButton";

interface IndividualResultsProps { }

const IndividualResults: FunctionComponent<IndividualResultsProps> = () => {
  const { toast } = useToast();
  const { pdfMutation, excelMutation } = useValidateClient();
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  // select only the needed bits from the store (avoids full-store re-renders)
  const results = useValidationStore(s => s.results);
  const searchContext = useValidationStore(s => s.searchContext);

  // early return if nothing to show
  if (!results) return null;

  const searchLabel = () => {
    if (!searchContext) return "los datos consultados";

    const { documentNumber, fullName } = searchContext;

    if (documentNumber && fullName) {
      return `el documento ${documentNumber} y el nombre "${fullName}"`;
    }

    if (documentNumber) {
      return `el documento ${documentNumber}`;
    }

    if (fullName) {
      return `el nombre "${fullName}"`;
    }

    return "los datos consultados";
  };

  // same table you had originally, adapted to the RestrictiveListMatch type
  const renderResultsTable = (matches: RestrictiveListMatch[]) => (
    <div className="overflow-x-auto overflow-y-visible">
      <table className="w-full" data-testid="table-results">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nombres
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Lista
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Coincidencia
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Comentarios
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {matches.map((match) => {
            const displayName = match.sdnName?.trim() || match.nombre || "—";
            const documentId = match.identificacion || String(match.entNum) || "—";
            const listName = match.nombre || match.descriTipoLista || `Lista ${match.codigoLista}`;
            const descriTipoLista = match.descriTipoLista?.toUpperCase() || "";
            const tipoLista = match.tipoLista?.toUpperCase();
            const coincidencia = match.tipo ?? "—";
            const comentario = match.comentarios2 || "—";

            return (
              <tr
                key={match.entNum ?? `${match.codigoLista}-${match.identificacion ?? "no-id"}`}
                className="hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
              >
                {/* DOCUMENTO */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.tipoDocumento ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500">{documentId}</p>
                    </div>
                  </div>
                </td>

                {/* NOMBRE */}
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                </td>

                {/* LISTA */}
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {listName}
                  </p>
                </td>

                {/* COINCIDENCIA */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {coincidencia}
                    </span>

                    <span
                      className={`mt-1 inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold border ${tipoLista === "RES"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-orange-100 text-orange-700 border-orange-200"
                        }`}
                    >
                      {descriTipoLista}
                    </span>
                  </div>
                </td>
                {/* COMENTARIO */}
                <td className="px-6 py-4 max-w-xs">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 cursor-help">
                        {comentario}
                      </p>
                    </TooltipTrigger>

                    <TooltipContent side="top" align="start">
                      {comentario}
                    </TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // download PDF same behavior as before
  const handleDownloadPdf = () => {
    setDownloadingExcel(true);
    let data: RestrictiveListMatch[] = []
    if (!results || results.length === 0) {
      data = [{
        identificacion: searchContext?.documentNumber,
        sdnName: searchContext?.fullName,
        tipoDocumento: searchContext?.documentType,
        codigoLista: 0,
        entNum: 0,
        nombre: "",
        prioridadValidacion: 0
      }]
    }
    console.log("results", results)
    console.log("data", data)
    pdfMutation.mutate((results && results.length > 0) ? results : data, {
      onSuccess: (blob) => {

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `informe_validacion_${results?.[0]?.identificacion || "listas"}.pdf`;
        link.click();

        URL.revokeObjectURL(url);
        setDownloadingExcel(false);
      },
      onError: (err: any) => {
        setDownloadingExcel(false);
        toast({
          title: "Error",
          description: err?.message || "No se pudo generar el informe PDF.",
          variant: "destructive",
        });
      },
    });
  };

  const handleDownloadExcel = () => {
    setDownloadingExcel(true);

    const payload: BulkResult[] = [
      {
        queryDocumentNumber: searchContext?.documentNumber ?? "",
        queryFullName: searchContext?.fullName ?? "",
        matchCount: results?.length ?? 0,
        matches: results ?? [],
        userIp: "" // se llena en el propio service antes de enviarlo al backend, no es necesario que el componente se preocupe por esto
      },
    ];

    excelMutation.mutate(payload, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `informe_validacion_${searchContext?.documentNumber || "listas"}.xlsx`;
        link.click();

        URL.revokeObjectURL(url);
        setDownloadingExcel(false);
      },
      onError: (err: any) => {
        setDownloadingExcel(false);
        toast({
          title: "Error",
          description: err?.message || "No se pudo generar el informe Excel.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {results.length > 0 ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-results-title">
              Resultados de Validación
            </h2>
            <p className="text-sm text-gray-500" data-testid="text-results-count">
              {results.length > 0 ? `${results.length} coincidencia(s) encontrada(s)` : "Sin coincidencias en listas restrictivas"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {results.length > 0 && (() => {
            const tieneAlgunaRestriccion = results.some(match => match.permiteIdentificacion === "NO");
            return (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${tieneAlgunaRestriccion
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }`}
                data-testid="vinculacion-permitida"
              >
                Permite Vinculación: {tieneAlgunaRestriccion ? "NO" : "SÍ"}
              </span>
            );
          })()}
          <AppButton
            permKey="laft:BtnDescargarPdfListaIndividual"
            noPermBehavior="disable"
            variant="outline"
            size="sm"
            onClick={handleDownloadExcel}
            extraDisabled={downloadingExcel}
            className="text-xs"
            data-testid="button-download-excel"
          >
            {downloadingExcel ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
            )}
            Descargar Informe excel
          </AppButton>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="p-12 text-center" data-testid="status-no-results">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sin reportes</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            No se encontraron coincidencias para {searchLabel()} en las listas restrictivas consultadas.
          </p>
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border bg-green-100 text-green-800 border-green-200" data-testid="vinculacion-permitida">
            Permite Vinculación: SÍ
          </span>
        </div>
      ) : (
        renderResultsTable(results)
      )}
    </div>
  );
};

export default IndividualResults;