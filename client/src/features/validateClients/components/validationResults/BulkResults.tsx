// client/src/features/validateClients/components/validationResults/BulkResults.tsx

import React, { FunctionComponent, useCallback, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileDown, FileText, Loader2 } from "lucide-react";
import { useValidationStore } from "../../stores/validateClients.store";
import type { RestrictiveListMatch } from "../../types/validateClients.types";
import { useValidateClient } from "../../hooks/useValidateClient";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { hasPermission } from "@/shared/lib/permissions";

const BulkResults: FunctionComponent = () => {
  const bulkResults = useValidationStore((s) => s.bulkResults);
  const { excelMutation } = useValidateClient();
  const { toast } = useToast();

  if (!bulkResults || bulkResults.length === 0) return null;

  const stats = useMemo(() => {
    const total = bulkResults.length;
    const withMatches = bulkResults.filter((r) => r.matchCount > 0).length;
    const clean = total - withMatches;
    return { total, withMatches, clean };
  }, [bulkResults]);

  const getMatchLabel = (prioridad: number | undefined) => {
    if (prioridad === 1) return "bg-red-600 text-white";
    return "bg-orange-500 text-white";
  };

  const permiteVincular = (flag?: string | null) => {
    if (!flag) return false;
    const s = String(flag).toUpperCase().trim();
    return s === "S" || s === "Y" || s === "1" || s === "T" || s === "TRUE";
  };

  const handleDownloadExcel = () => {
    if (!bulkResults || bulkResults.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay resultados para generar el informe.",
        variant: "destructive",
      });
      return;
    }

    excelMutation.mutate(bulkResults, {
      onSuccess: (blob) => {

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `validacion_masiva_listas_restrictivas.xlsx`;
        link.click();

        URL.revokeObjectURL(url);
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err?.message || "No se pudo generar el archivo Excel.",
          variant: "destructive",
        });
      },
    });
  };

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
            const displayName = match.sdnName?.trim() || match.nombre || "—";
            const documentId =
              match.identificacion || String(match.entNum) || "—";
            const listName =
            match.nombre ||
            match.descriTipoLista ||
              `Lista ${match.codigoLista}`;
            const listSource = match.tipo || match.tipoLista || "—";
            const matchLabel = match.prioridadValidacion;
            const permite = permiteVincular(match.permiteIdentificacion);

            return (
              <tr
                key={
                  match.entNum ??
                  `${match.codigoLista}-${match.identificacion ?? "no-id"}`
                }
                className="hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
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
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getMatchLabel(
                      matchLabel
                    )}`}
                  >
                    {matchLabel === 1
                      ? "Exacto"
                      : `Prioridad ${matchLabel ?? "—"}`}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${permite
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-red-100 text-red-800 border-red-200"
                      }`}
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

  return (
    <div className="space-y-4">
      {/* estadísticas */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Resultados de Validación Masiva
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadExcel}
            disabled={excelMutation.isPending || !hasPermission("validar-en-listas-reportes")}
            className="text-xs"
          >
            {excelMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
            )}
            Descargar Excel
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-gray-500">Registros procesados</p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {stats.withMatches}
            </p>
            <p className="text-xs text-gray-500">Con coincidencias</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.clean}
            </p>
            <p className="text-xs text-gray-500">Sin coincidencias</p>
          </div>
        </div>
      </div>

      {bulkResults.map((result, idx) => (
        <div
          key={idx}
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border overflow-hidden ${result.matchCount > 0
              ? "border-red-200 dark:border-red-900"
              : "border-gray-200 dark:border-gray-800"
            }`}
        >
          <div
            className={`px-6 py-3 flex items-center justify-between ${result.matchCount > 0
                ? "bg-red-50 dark:bg-red-950/30"
                : "bg-green-50 dark:bg-green-950/30"
              }`}
          >
            <div className="flex items-center space-x-3">
              {result.matchCount > 0 ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}

              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {result.queryDocumentNumber || result.queryFullName || "—"}
              </p>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${result.matchCount > 0
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                }`}
            >
              {result.matchCount > 0
                ? `${result.matchCount} coincidencia(s)`
                : "Limpio"}
            </span>
          </div>

          {result.matchCount > 0 && renderResultsTable(result.matches)}
        </div>
      ))}
    </div>
  );
};

export default BulkResults;