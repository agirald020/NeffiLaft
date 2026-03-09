// client/src/features/validateClients/components/validationResults/IndividualResults.tsx

import React, { FunctionComponent, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  FileDown,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { useValidationStore } from "../../stores/validateClients.store";
import type { RestrictiveListMatch } from "../../types/validateClients.types";
import { hasPermission } from "@/shared/lib/permissions";
import { useValidateClient } from "../../hooks/useValidateClient";
import { ValidateClientDTO } from "../../types/validateClientDTO";

interface IndividualResultsProps { }

const IndividualResults: FunctionComponent<IndividualResultsProps> = () => {
  const { toast } = useToast();
  const { pdfMutation } = useValidateClient();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // select only the needed bits from the store (avoids full-store re-renders)
  const results = useValidationStore(s => s.results);
  const searchContext = useValidationStore(s => s.searchContext);
  const documentNumber = useValidationStore(s => s.documentNumber);
  const firstName = useValidationStore(s => s.firstName);
  const secondName = useValidationStore(s => s.secondName);
  const firstLastName = useValidationStore(s => s.firstLastName);
  const secondLastName = useValidationStore(s => s.secondLastName);

  // early return if nothing to show
  if (!results) return null;

  const getMatchLabel = (prioridad: number | undefined) => {
    // convención simple: prioridad === 1 -> Exacto; else Parcial
    if (prioridad === 1) return "bg-red-600 text-white";
    return "bg-orange-500 text-white";
  };

  const permiteVincular = (flag?: string | null) => {
    if (!flag) return false;
    const s = String(flag).toUpperCase().trim();
    return s === "S" || s === "Y" || s === "1" || s === "T" || s === "TRUE";
  };

  // same table you had originally, adapted to the RestrictiveListMatch type
  const renderResultsTable = (matches: RestrictiveListMatch[]) => (
    <div className="overflow-x-auto">
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
              Fuente
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Coincidencia
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Permite Vinculación
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {matches.map((match) => {
            // fallback logic para mostrar nombre/documento
            const displayName = match.sdnName?.trim() || match.nombre || "—";
            const documentId = match.identificacion || String(match.entNum) || "—";
            const listName = match.descriTipoLista || match.nombre || `Lista ${match.codigoLista}`;
            const listSource = match.tipo || match.tipoLista || "—";
            const matchLabel = match.prioridadValidacion;
            const permite = permiteVincular(match.permiteIdentificacion);

            return (
              <tr
                key={match.entNum ?? `${match.codigoLista}-${match.identificacion ?? "no-id"}`}
                className="hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
                data-testid={`row-result-${match.entNum ?? match.codigoLista}`}
              >
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

                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {listName}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {listSource}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getMatchLabel(matchLabel)}`}
                  >
                    {matchLabel === 1 ? "Exacto" : `Prioridad ${matchLabel ?? "—"}`}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${permite ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
                    data-testid={`vinculacion-${match.entNum ?? match.codigoLista}`}
                  >
                    {permite ? "SÍ" : "NO"}
                  </span>
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
    setDownloadingPdf(true);
    if (!results || results.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay resultados para generar el informe.",
        variant: "destructive",
      });
      return;
    }

    pdfMutation.mutate(results, {
      onSuccess: (blob) => {

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `informe_validacion_${documentNumber || "listas"}.pdf`;
        link.click();

        URL.revokeObjectURL(url);
        setDownloadingPdf(false);
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err?.message || "No se pudo generar el informe PDF.",
          variant: "destructive",
        });
        setDownloadingPdf(false);
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
          {results.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              ALERTA
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || !hasPermission("validar-en-listas-reportes")}
            className="text-xs"
            data-testid="button-download-pdf"
          >
            {downloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
            )}
            Descargar Informe PDF
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="p-12 text-center" data-testid="status-no-results">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sin reportes</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            El documento <span className="font-semibold">{searchContext?.value}</span> no presenta coincidencias en las listas restrictivas consultadas.
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