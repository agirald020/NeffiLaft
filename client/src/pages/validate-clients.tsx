import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Search, AlertTriangle, CheckCircle2, Loader2, FileText, Upload, X, Building2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface BulkResult {
  queryDocumentType: string;
  queryDocumentNumber: string;
  queryFullName: string;
  matchCount: number;
  matches: RestrictiveListMatch[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [personType, setPersonType] = useState<"natural" | "juridica">("natural");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [firstLastName, setFirstLastName] = useState("");
  const [secondLastName, setSecondLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [results, setResults] = useState<RestrictiveListMatch[] | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchContext, setSearchContext] = useState<{ type: string; value: string } | null>(null);

  const buildFullName = () => {
    if (personType === "juridica") return companyName.trim();
    return [firstName, secondName, firstLastName, secondLastName]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  };

  const validateMutation = useMutation({
    mutationFn: async () => {
      const fullName = buildFullName();
      const res = await apiRequest("POST", "/api/laft/validate", {
        documentType,
        documentNumber: documentNumber.trim(),
        fullName: fullName || undefined,
      });
      return res.json() as Promise<RestrictiveListMatch[]>;
    },
    onSuccess: (data) => {
      setResults(data);
      setBulkResults(null);
      setSearchContext({ type: "individual", value: `${documentType} ${documentNumber}` });
      showResultToast(data.length);
    },
    onError: () => showErrorToast(),
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/laft/validate/bulk", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json() as Promise<BulkResult[]>;
    },
    onSuccess: (data) => {
      setBulkResults(data);
      setResults(null);
      setSearchContext(null);
      const totalMatches = data.reduce((sum, r) => sum + r.matchCount, 0);
      const withMatches = data.filter((r) => r.matchCount > 0).length;
      toast({
        title: "Validación masiva completada",
        description: `${data.length} registro(s) procesados. ${withMatches} con coincidencias (${totalMatches} total).`,
        variant: withMatches > 0 ? "destructive" : "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo procesar el archivo. Verifique que sea un archivo Excel (.xlsx) válido.",
        variant: "destructive",
      });
    },
  });

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

  const showErrorToast = () => {
    toast({ title: "Error", description: "No se pudo realizar la validación. Intente nuevamente.", variant: "destructive" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentNumber.trim()) {
      toast({ title: "Campo requerido", description: "Ingrese el número de documento.", variant: "destructive" });
      return;
    }
    validateMutation.mutate();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: "Archivo requerido", description: "Seleccione un archivo Excel (.xlsx).", variant: "destructive" });
      return;
    }
    bulkMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx")) {
        toast({ title: "Formato inválido", description: "Solo se aceptan archivos Excel (.xlsx).", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
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

  const renderResultsTable = (matches: RestrictiveListMatch[]) => (
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
          {matches.map((match) => (
            <tr key={match.id} className="hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors" data-testid={`row-result-${match.id}`}>
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
                <p className="text-sm font-medium text-gray-900 dark:text-white">{match.fullName}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{match.listName}</p>
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
  );

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
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="individual" className="flex items-center space-x-2" data-testid="tab-individual">
              <Search className="w-4 h-4" />
              <span>Validación Individual</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center space-x-2" data-testid="tab-bulk">
              <Upload className="w-4 h-4" />
              <span>Carga Masiva</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-validate">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Persona</Label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setPersonType("natural")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      personType === "natural"
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
                    onClick={() => setPersonType("juridica")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      personType === "juridica"
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

              <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Identificación</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="documentType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Documento <span className="text-red-500">*</span>
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
                      Número de Documento <span className="text-red-500">*</span>
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
                </div>
              </div>

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
                          onChange={(e) => setFirstName(e.target.value)}
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
                          onChange={(e) => setSecondName(e.target.value)}
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
                          onChange={(e) => setFirstLastName(e.target.value)}
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
                          onChange={(e) => setSecondLastName(e.target.value)}
                          className="h-10"
                          data-testid="input-second-lastname"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={validateMutation.isPending}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white text-base"
                data-testid="button-validate"
              >
                {validateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Validar en Listas Restrictivas
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit} className="space-y-5" data-testid="form-validate-bulk">
              <div className="space-y-4">
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
                          <p className="text-sm font-semibold text-gray-900 dark:text-white" data-testid="text-filename">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
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
                          Formato: .xlsx con columnas: Tipo Documento, Número Documento, Nombre
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Formato esperado del archivo:</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-1 px-2 text-gray-500 font-medium">Columna A</th>
                          <th className="text-left py-1 px-2 text-gray-500 font-medium">Columna B</th>
                          <th className="text-left py-1 px-2 text-gray-500 font-medium">Columna C</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-700/50 font-semibold text-gray-700 dark:text-gray-300">
                          <td className="py-1 px-2">Tipo Documento</td>
                          <td className="py-1 px-2">Número Documento</td>
                          <td className="py-1 px-2">Nombre</td>
                        </tr>
                        <tr className="text-gray-500">
                          <td className="py-1 px-2">CC</td>
                          <td className="py-1 px-2">1023456789</td>
                          <td className="py-1 px-2">CARLOS MARTÍNEZ</td>
                        </tr>
                        <tr className="text-gray-500">
                          <td className="py-1 px-2">NIT</td>
                          <td className="py-1 px-2">900123456</td>
                          <td className="py-1 px-2">INVERSIONES EL DORADO</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={bulkMutation.isPending || !selectedFile}
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
            </form>
          </TabsContent>
        </Tabs>
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
                El documento <span className="font-semibold">{searchContext?.value}</span> no presenta coincidencias en las listas restrictivas consultadas.
              </p>
            </div>
          ) : (
            renderResultsTable(results)
          )}
        </div>
      )}

      {bulkResults !== null && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4" data-testid="text-bulk-title">
              Resultados de Validación Masiva
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-bulk-total">{bulkResults.length}</p>
                <p className="text-xs text-gray-500">Registros procesados</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-600" data-testid="text-bulk-with-matches">
                  {bulkResults.filter((r) => r.matchCount > 0).length}
                </p>
                <p className="text-xs text-gray-500">Con coincidencias</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600" data-testid="text-bulk-clean">
                  {bulkResults.filter((r) => r.matchCount === 0).length}
                </p>
                <p className="text-xs text-gray-500">Sin coincidencias</p>
              </div>
            </div>
          </div>

          {bulkResults.map((result, idx) => (
            <div
              key={idx}
              className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border overflow-hidden ${
                result.matchCount > 0
                  ? "border-red-200 dark:border-red-900"
                  : "border-gray-200 dark:border-gray-800"
              }`}
              data-testid={`bulk-result-${idx}`}
            >
              <div className={`px-6 py-3 flex items-center justify-between ${
                result.matchCount > 0 ? "bg-red-50 dark:bg-red-950/30" : "bg-green-50 dark:bg-green-950/30"
              }`}>
                <div className="flex items-center space-x-3">
                  {result.matchCount > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {result.queryDocumentType && result.queryDocumentNumber
                        ? `${result.queryDocumentType} ${result.queryDocumentNumber}`
                        : result.queryFullName || "—"}
                      {result.queryFullName && result.queryDocumentNumber && (
                        <span className="text-gray-400 font-normal"> — {result.queryFullName}</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  result.matchCount > 0
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {result.matchCount > 0 ? `${result.matchCount} coincidencia(s)` : "Limpio"}
                </span>
              </div>

              {result.matchCount > 0 && renderResultsTable(result.matches)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
