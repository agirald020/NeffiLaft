// client\src\features\validateClients\ValidateClientsPage.tsx
import { ShieldCheck, Search, Upload, } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import BulkValidationForm from "./components/validationForms/BulkValidationForm";
import IndividualValidationForm from "./components/validationForms/IndividualValidationForm";
import IndividualResults from "./components/validationResults/IndividualResults";
import BulkResults from "./components/validationResults/BulkResults";
import { useValidationStore } from "./stores/validateClients.store";

export default function ValidateClientsPage() {

  //! zustand
  const results = useValidationStore(s => s.results);
  const bulkResults = useValidationStore(s => s.bulkResults);
  // Render principal (idéntico a tu original, sólo cambiamos binding de mutaciones)
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* header */}
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

      {/* caja principal con tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">

            <TabsTrigger
              value="individual"
              data-testid="tab-individual"
              className="
                flex items-center justify-center space-x-2
                px-3 py-1.5 text-sm rounded-md transition-all
                text-gray-600 dark:text-gray-300
                data-[state=active]:bg-white
                dark:data-[state=active]:bg-gray-900
                data-[state=active]:text-red-600
                data-[state=active]:shadow-sm
              "
            >
              <Search className="w-4 h-4" />
              <span>Validación Individual</span>
            </TabsTrigger>

            <TabsTrigger
              value="bulk"
              data-testid="tab-bulk"
              className="
                flex items-center justify-center space-x-2
                px-3 py-1.5 text-sm rounded-md transition-all
                
                text-gray-600 dark:text-gray-300
                
                data-[state=active]:bg-white
                dark:data-[state=active]:bg-gray-900
                data-[state=active]:text-red-600
                data-[state=active]:shadow-sm
              "
            >
              <Upload className="w-4 h-4" />
              <span>Carga Masiva</span>
            </TabsTrigger>

          </TabsList>

          <TabsContent value="individual">
            <IndividualValidationForm />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkValidationForm />
          </TabsContent>
        </Tabs>
      </div>

      {/* resultados individual */}
      {results !== null && <IndividualResults />}
      {/* resultados en masivo */}
      {bulkResults !== null && <BulkResults />}
    </div>
  );
}   