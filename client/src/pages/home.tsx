import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TrustSearch from "@/components/trust-search";
import TrustList from "@/components/trust-list";
import type { Trust } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trusts = [], isLoading } = useQuery<Trust[]>({
    queryKey: ["/api/trusts", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await fetch(`/api/trusts?${params}`);
      if (!response.ok) {
        throw new Error("Error fetching trusts");
      }
      return response.json();
    },
  });

  return (
    <div>
      <div className="relative bg-gradient-to-br from-red-50 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-950">
        <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50 [background-image:radial-gradient(circle,rgba(220,38,38,0.06)_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-red-600 via-red-700 to-gray-900 bg-clip-text text-transparent">
              Consulta de Fideicomisos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Gestiona y consulta información completa de fideicomisos con herramientas avanzadas de búsqueda y análisis
            </p>
          </div>
          
          <TrustSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            data-testid="trust-search"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-modern">
          <div className="px-8 py-6 border-b border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Resultados de Búsqueda
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 flex items-center" data-testid="results-count">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-secondary text-white mr-3">
                    {trusts.length}
                  </span>
                  fideicomisos encontrados
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sistema actualizado</span>
              </div>
            </div>
          </div>
          
          <TrustList 
            trusts={trusts} 
            isLoading={isLoading}
            data-testid="trust-list"
          />
        </div>
      </div>
    </div>
  );
}
