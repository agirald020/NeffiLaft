import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Upload,
  FileSpreadsheet,
  UserSearch,
  IdCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import type { ThirdPartyResult } from "@shared/schema";

export default function ValidationPage() {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<"name" | "cedula">("name");
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<ThirdPartyResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (data: { searchType: string; searchValue: string }) => {
      const res = await apiRequest("POST", "/api/third-party/search", data);
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data.results || []);
      setHasSearched(true);
      toast({
        title: "Búsqueda completada",
        description: data.message || "Consulta realizada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error en la búsqueda",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/third-party/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al subir archivo");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Archivo procesado",
        description: data.message || "Archivo subido exitosamente",
      });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      toast({
        title: "Campo requerido",
        description: "Ingresa un valor para buscar",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate({ searchType, searchValue: searchValue.trim() });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "found":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Encontrado</Badge>;
      case "not_found":
        return <Badge variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1" />No encontrado</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
          Validación de Terceros
        </h1>
        <p className="text-muted-foreground mt-1">
          Consulta y valida terceros en listas restrictivas propias
        </p>
      </div>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList data-testid="tabs-validation-mode">
          <TabsTrigger value="individual" data-testid="tab-individual" className="gap-2">
            <UserSearch className="w-4 h-4" />
            Consulta Individual
          </TabsTrigger>
          <TabsTrigger value="bulk" data-testid="tab-bulk" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Carga Masiva
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buscar Tercero</CardTitle>
              <CardDescription>
                Ingresa el nombre o número de cédula del tercero a validar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={searchType === "name" ? "default" : "outline"}
                      size="default"
                      onClick={() => setSearchType("name")}
                      data-testid="button-search-by-name"
                      className="gap-2"
                    >
                      <UserSearch className="w-4 h-4" />
                      Nombre
                    </Button>
                    <Button
                      type="button"
                      variant={searchType === "cedula" ? "default" : "outline"}
                      size="default"
                      onClick={() => setSearchType("cedula")}
                      data-testid="button-search-by-cedula"
                      className="gap-2"
                    >
                      <IdCard className="w-4 h-4" />
                      Cédula
                    </Button>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="searchValue" className="sr-only">
                        {searchType === "name" ? "Nombre" : "Cédula"}
                      </Label>
                      <Input
                        id="searchValue"
                        placeholder={
                          searchType === "name"
                            ? "Ingrese el nombre completo..."
                            : "Ingrese el número de cédula..."
                        }
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        data-testid="input-search-value"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={searchMutation.isPending}
                      data-testid="button-search"
                      className="gap-2"
                    >
                      {searchMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Buscar
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {hasSearched && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Resultados
                  <Badge variant="secondary" className="ml-2">
                    {results.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium" data-testid="text-no-results">
                      No se encontraron coincidencias en listas restrictivas
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      La validación en listas está pendiente de implementación
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo Doc.</TableHead>
                          <TableHead>Número</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Lista</TableHead>
                          <TableHead className="text-center">Coincidencia</TableHead>
                          <TableHead className="text-center">Estado</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result) => (
                          <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                            <TableCell>{result.documentType}</TableCell>
                            <TableCell className="font-mono">{result.documentNumber}</TableCell>
                            <TableCell className="font-medium">{result.fullName}</TableCell>
                            <TableCell>{result.listName}</TableCell>
                            <TableCell className="text-center">
                              {result.matchPercentage}%
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(result.status)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {result.checkedAt}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Carga Masiva de Terceros</CardTitle>
              <CardDescription>
                Sube un archivo Excel (.xlsx) con el listado de terceros a validar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-md p-8 text-center transition-colors border-muted">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Selecciona un archivo Excel</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Formatos permitidos: .xlsx, .xls (máx. 10MB)
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="max-w-xs"
                    data-testid="input-file-upload"
                  />
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium" data-testid="text-file-name">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                      data-testid="button-remove-file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      data-testid="button-upload"
                      className="gap-2"
                    >
                      {uploadMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Procesar
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-md bg-muted/30 p-4">
                <h4 className="text-sm font-medium mb-2">Formato esperado del archivo</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Tipo Documento</TableHead>
                        <TableHead className="text-xs">Número Documento</TableHead>
                        <TableHead className="text-xs">Nombre Completo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs text-muted-foreground">CC</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">1234567890</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Juan Pérez García</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs text-muted-foreground">NIT</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">900123456-1</TableCell>
                        <TableCell className="text-xs text-muted-foreground">Empresa ABC S.A.S</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
