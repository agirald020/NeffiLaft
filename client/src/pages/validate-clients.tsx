import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Search, AlertTriangle, CheckCircle2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RestrictiveListMatch {
  id: string;
  documentType: string;
  documentNumber: string;
  fullName: string;
  listName: string;
  listSource: string;
  matchType: string;
  matchScore: number;
}

const documentTypes = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PP", label: "Pasaporte" },
  { value: "TI", label: "Tarjeta de Identidad" },
];

export default function ValidateClients() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [results, setResults] = useState<RestrictiveListMatch[] | null>(null);

  const validateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/laft/validate", {
        documentType,
        documentNumber: documentNumber.trim(),
      });
      return res.json() as Promise<RestrictiveListMatch[]>;
    },
    onSuccess: (data) => {
      setResults(data);
      if (data.length > 0) {
        toast({
          title: "Coincidencias encontradas",
          description: `Se encontraron ${data.length} coincidencia(s) en listas restrictivas.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sin coincidencias",
          description: "No se encontraron resultados en listas restrictivas.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo realizar la validación. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber.trim()) {
      toast({
        title: "Campo requerido",
        description: "Ingrese el número de documento.",
        variant: "destructive",
      });
      return;
    }
    validateMutation.mutate();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 80) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getMatchLabel = (type: string) => {
    if (type === "Exacto") return "bg-red-600 text-white";
    return "bg-orange-500 text-white";
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Validar Clientes en Listas Restrictivas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Consulte si un tercero se encuentra reportado en listas restrictivas nacionales e internacionales
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-validate-client">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de Documento
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="documentType" data-testid="select-document-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value} data-testid={`option-doc-type-${dt.value}`}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Número de Documento
              </Label>
              <Input
                id="documentNumber"
                type="text"
                placeholder="Ej: 1023456789"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="h-10"
                data-testid="input-document-number"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={validateMutation.isPending}
                className="w-full h-10 bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-validate"
              >
                {validateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Validar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {results !== null && (
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
                  {results.length > 0
                    ? `${results.length} coincidencia(s) encontrada(s)`
                    : "Sin coincidencias en listas restrictivas"}
                </p>
              </div>
            </div>
            {results.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                ALERTA
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center" data-testid="status-no-results">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sin reportes</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                El documento <span className="font-semibold">{documentType} {documentNumber}</span> no presenta coincidencias en las listas restrictivas consultadas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-results">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombres</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lista</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fuente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Coincidencia</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {results.map((match) => (
                    <tr
                      key={match.id}
                      className="hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
                      data-testid={`row-result-${match.id}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{match.documentType}</p>
                            <p className="text-xs text-gray-500">{match.documentNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-name-${match.id}`}>
                          {match.fullName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300" data-testid={`text-list-${match.id}`}>
                          {match.listName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {match.listSource}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getMatchLabel(match.matchType)}`}>
                          {match.matchType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreBadge(match.matchScore)}`}>
                          {match.matchScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
