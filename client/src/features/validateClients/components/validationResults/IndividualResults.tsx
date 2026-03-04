// client\src\features\validateClients\components\validationResults\IndividualResults.tsx
import React, { FunctionComponent, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  FileDown,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import { getAuthHeader } from "@/shared/lib/keycloak";
import { useValidationStore } from "../../stores/validateClients.store";
import type { RestrictiveListMatch } from "../../types/validateClients.types";

interface IndividualResultsProps { }

const IndividualResults: FunctionComponent<IndividualResultsProps> = () => {
  const { toast } = useToast();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // select only the needed bits from the store (avoids full-store re-renders)
  const results = useValidationStore(s => s.results);
const searchContext = useValidationStore(s => s.searchContext);
const documentNumber = useValidationStore(s => s.documentNumber);
const personType = useValidationStore(s => s.personType);
const firstName = useValidationStore(s => s.firstName);
const secondName = useValidationStore(s => s.secondName);
const firstLastName = useValidationStore(s => s.firstLastName);
const secondLastName = useValidationStore(s => s.secondLastName);
const companyName = useValidationStore(s => s.companyName);
const businessName = useValidationStore(s => s.businessName);

  // early return if nothing to show
  if (!results) return null;

  const getMatchLabel = (type: string) => {
    if (type === "Exacto") return "bg-red-600 text-white";
    return "bg-orange-500 text-white";
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
          {matches.map((match) => (
            <tr
              key={match.id}
              className="hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
              data-testid={`row-result-${match.id}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {match.documentType}
                    </p>
                    <p className="text-xs text-gray-500">{match.documentNumber}</p>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {match.fullName}
                </p>
              </td>

              <td className="px-6 py-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {match.listName}
                </p>
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {match.listSource}
                </span>
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getMatchLabel(
                    match.matchType
                  )}`}
                >
                  {match.matchType}
                </span>
              </td>

              <td className="px-6 py-4">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-red-100 text-red-800 border-red-200"
                  data-testid={`vinculacion-${match.id}`}
                >
                  NO
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // download PDF same behavior as before
  const handleDownloadPdf = useCallback(async () => {
    if (!results) return;
    setDownloadingPdf(true);

    try {
      const body: Record<string, string> = {
        documentNumber: (documentNumber || "").trim(),
        personType,
      };

      if (personType === "natural") {
        if ((firstName || "").trim()) body.firstName = firstName.trim();
        if ((secondName || "").trim()) body.secondName = secondName.trim();
        if ((firstLastName || "").trim()) body.firstLastName = firstLastName.trim();
        if ((secondLastName || "").trim()) body.secondLastName = secondLastName.trim();
      } else {
        if ((companyName || "").trim()) body.businessName = companyName.trim();
        if ((businessName || "").trim()) body.businessName = businessName.trim();
      }

      const res = await fetch("/api/laft/validate/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(text || "Error generando PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `informe_validacion_${(documentNumber || "listas").trim() || "listas"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "No se pudo generar el informe PDF.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPdf(false);
    }
  }, [
    results,
    documentNumber,
    personType,
    firstName,
    secondName,
    firstLastName,
    secondLastName,
    companyName,
    businessName,
    toast,
  ]);

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
            disabled={downloadingPdf}
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