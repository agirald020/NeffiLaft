import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Trust } from "@shared/schema";

interface TrustListProps {
  trusts: Trust[];
  isLoading: boolean;
}

export default function TrustList({ trusts, isLoading }: TrustListProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gradient-surface rounded-xl p-6 animate-shimmer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (trusts.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-muted rounded-full flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No se encontraron fideicomisos
        </h3>
        <p className="text-gray-500 dark:text-gray-400" data-testid="empty-state">
          No hay fideicomisos que coincidan con su búsqueda. Intente ajustar los criterios.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">Activo</Badge>;
      case 'en proceso':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm">En Proceso</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm">Inactivo</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-6">
      {trusts.map((trust, index) => (
        <Link key={trust.id} href={`/trust/${trust.id}`}>
          <div 
            className="transition-modern bg-gradient-surface hover:shadow-modern-lg cursor-pointer rounded-2xl p-6 border border-gray-200/60 dark:border-gray-700/60 hover:border-red-300 dark:hover:border-red-600 group"
            data-testid={`trust-item-${trust.id}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-bold text-xl">
                    {trust.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-1" data-testid={`trust-name-${trust.id}`}>
                      {trust.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {trust.code}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(trust.status)}
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Código</span>
                    <p className="font-semibold text-gray-900 dark:text-white" data-testid={`trust-code-${trust.id}`}>
                      {trust.code}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Fecha Constitución</span>
                    <p className="font-semibold text-gray-900 dark:text-white" data-testid={`trust-date-${trust.id}`}>
                      {new Date(trust.constitutionDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
