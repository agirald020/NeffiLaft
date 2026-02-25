import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TrustSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TrustSearch({ value, onChange }: TrustSearchProps) {
  return (
    <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-800 dark:text-white mb-3">
            Buscar por nombre o código
          </label>
          <div className="relative">
            <Input
              type="text"
              className="input-modern pl-12 pr-4 py-4 text-lg placeholder:text-gray-400 focus-modern shadow-sm"
              placeholder="Ingrese nombre o código del fideicomiso..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              data-testid="input-search"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-red-500" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                Enter
              </kbd>
            </div>
          </div>
        </div>
        <div className="flex items-end">
          <Button 
            className="btn-gradient-primary px-8 py-4 text-base font-semibold rounded-xl shadow-modern flex items-center space-x-3 min-w-[140px] justify-center"
            data-testid="button-search"
          >
            <Search className="h-5 w-5" />
            <span>Buscar</span>
          </Button>
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">Sugerencias:</span>
        {["FID-2024", "Inmobiliario", "Activo", "Vigente"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onChange(suggestion)}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
