import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ClipboardList, FileText, DollarSign, X, Save, Loader2 } from "lucide-react";
import type { Contract } from "@shared/schema";

const contractSchema = z.object({
  purpose: z.string().min(1, "El objeto del contrato es requerido"),
  obligations: z.string().min(1, "Las obligaciones del contrato son requeridas"),
  remuneration: z.string().min(1, "La remuneración del contrato es requerida"),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  trustId: string;
  contract: Contract | null | undefined;
}

export default function ContractForm({ trustId, contract }: ContractFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      purpose: "",
      obligations: "",
      remuneration: "",
    },
  });

  useEffect(() => {
    if (contract) {
      form.reset({
        purpose: contract.purpose || "",
        obligations: contract.obligations || "",
        remuneration: contract.remuneration || "",
      });
    }
  }, [contract, form]);

  const saveContractMutation = useMutation({
    mutationFn: async (data: ContractFormData) => {
      const response = await apiRequest("POST", `/api/trusts/${trustId}/contract`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contrato guardado",
        description: "La información del contrato se ha guardado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trusts", trustId, "contract"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la información del contrato. Inténtelo de nuevo.",
        variant: "destructive",
      });
    },
  });


  const onSubmit = (data: ContractFormData) => {
    saveContractMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl">
      <div className="pb-6 border-b border-gray-200/60 mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 flex items-center space-x-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <span>Información del Contrato</span>
        </h3>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Complete los detalles del contrato del fideicomiso
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Objeto del Contrato <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="input-modern focus-modern min-h-[120px] resize-none"
                    placeholder="Describa el objeto del contrato del fideicomiso..."
                    rows={4}
                    {...field}
                    data-testid="textarea-purpose"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="obligations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span>Obligaciones del Contrato <span className="text-red-500">*</span></span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="input-modern focus-modern min-h-[120px] resize-none"
                    placeholder="Describa todas las obligaciones del contrato..."
                    rows={5}
                    {...field}
                    data-testid="textarea-obligations"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remuneration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>Remuneración del Contrato <span className="text-red-500">*</span></span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="input-modern focus-modern min-h-[120px] resize-none"
                    placeholder="Describa la remuneración del contrato (tipo, valor, condiciones, etc.)..."
                    rows={5}
                    {...field}
                    data-testid="textarea-remuneration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/60">
            <Button
              type="button"
              variant="outline"
              className="px-6 py-3 border-gray-300 hover:bg-gray-50 transition-modern"
              onClick={() => form.reset()}
              data-testid="button-cancel"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-gradient-primary px-8 py-3 font-semibold shadow-modern"
              disabled={saveContractMutation.isPending}
              data-testid="button-save-contract"
            >
              {saveContractMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Información
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
