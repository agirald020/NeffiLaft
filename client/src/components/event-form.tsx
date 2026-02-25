import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Event } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

const eventSchema = z.object({
  type: z.string().min(1, "El tipo de evento es requerido"),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  participants: z.string().optional(),
  status: z.string().default("programado"),
  includeInReport: z.boolean().default(true),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  trustId: string;
  event?: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventForm({ trustId, event, isOpen, onClose }: EventFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState<Array<{name: string, url: string}>>([]);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: event?.type || "",
      title: event?.title || "",
      description: event?.description || "",
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : "",
      participants: event?.participants || "",
      status: event?.status || "programado",
      includeInReport: event?.includeInReport ?? true,
    },
  });

  useEffect(() => {
    if (event && Array.isArray(event.attachments)) {
      setAttachments(event.attachments);
    } else {
      setAttachments([]);
    }
  }, [event]);

  const saveEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = {
        ...data,
        attachments: attachments,
      };

      if (event) {
        const response = await apiRequest("PUT", `/api/events/${event.id}`, eventData);
        return response.json();
      } else {
        const response = await apiRequest("POST", `/api/trusts/${trustId}/events`, eventData);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: event ? "Evento actualizado" : "Evento creado",
        description: `El evento se ha ${event ? "actualizado" : "creado"} correctamente.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trusts", trustId, "events"] });
      onClose();
      form.reset();
      if (!event) {
        setAttachments([]);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo ${event ? "actualizar" : "crear"} el evento. Inténtelo de nuevo.`,
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", { method: "POST" });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const newAttachments = result.successful.map(file => ({
        name: file.name || "Archivo sin nombre",
        url: file.uploadURL || "",
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
      
      toast({
        title: "Archivo subido",
        description: "El archivo se ha subido correctamente.",
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EventFormData) => {
    saveEventMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="pb-6 border-b border-gray-200/60 dark:border-gray-700/60">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-gray-800 bg-clip-text text-transparent" data-testid="dialog-title">
            {event ? "Editar Evento" : "Registrar Nuevo Evento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tipo de Evento <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-modern focus-modern" data-testid="select-event-type">
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="actuacion_procesal">Actuación Procesal</SelectItem>
                        <SelectItem value="agenda">Agenda</SelectItem>
                        <SelectItem value="bienes">Bienes</SelectItem>
                        <SelectItem value="cartera">Cartera</SelectItem>
                        <SelectItem value="cartera_comisiones">Cartera Comisiones Fiduciaria</SelectItem>
                        <SelectItem value="comite">Comité</SelectItem>
                        <SelectItem value="diligencias_judiciales">Diligencias Judiciales</SelectItem>
                        <SelectItem value="documento_fisico">Documento Físico</SelectItem>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="informe_constructor">Informe Constructor</SelectItem>
                        <SelectItem value="informe_interventor">Informe Interventor</SelectItem>
                        <SelectItem value="llamada">Llamada</SelectItem>
                        <SelectItem value="modificacion_contractual">Modificación Contractual</SelectItem>
                        <SelectItem value="proceso_juridico">Proceso Jurídico</SelectItem>
                        <SelectItem value="providencias_judiciales">Providencias Judiciales</SelectItem>
                        <SelectItem value="reunion_formal">Reunión Formal</SelectItem>
                        <SelectItem value="reunion_informal">Reunión Informal</SelectItem>
                        <SelectItem value="servicio_cliente">Servicio al Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="input-modern focus-modern" data-testid="select-event-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="programado">Programado</SelectItem>
                        <SelectItem value="realizado">Realizado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="reprogramado">Reprogramado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Título del Evento <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-modern focus-modern"
                      placeholder="Ingrese el título del evento..."
                      {...field}
                      data-testid="input-event-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="input-modern focus-modern"
                      type="date"
                      {...field}
                      data-testid="input-event-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descripción <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-modern focus-modern min-h-[120px] resize-none"
                      rows={4}
                      placeholder="Describa los objetivos y agenda del evento..."
                      {...field}
                      data-testid="textarea-event-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participantes</FormLabel>
                  <FormControl>
                    <Textarea
                      className="input-modern focus-modern min-h-[80px] resize-none"
                      rows={2}
                      placeholder="Liste los participantes del evento..."
                      {...field}
                      data-testid="textarea-participants"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includeInReport"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-4 space-y-0 bg-gradient-to-r from-red-50/80 to-gray-50/80 dark:from-red-900/20 dark:to-gray-900/20 rounded-xl border border-red-200/60 dark:border-red-700/60 p-6 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-include-in-report"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Incluir en Informe de Rendición
                    </FormLabel>
                    <p className="text-xs text-gray-600/80 dark:text-gray-300/80">
                      Marque esta opción si el evento debe aparecer en los informes de rendición de cuentas del fideicomiso
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div>
              <label className="block text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Evidencia Fotográfica y Documentos
              </label>
              <p className="text-xs text-gray-600/70 dark:text-gray-300/70 mb-4">
                Agregue fotografías, documentos y otros archivos relacionados al evento
              </p>
              
              {attachments.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl overflow-hidden border-2 border-gray-200/60 dark:border-gray-700/60 hover:border-red-400 dark:hover:border-red-500 transition-all duration-200 shadow-sm">
                          {attachment.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img 
                              src={attachment.url} 
                              alt={attachment.name}
                              className="w-full h-full object-cover"
                              data-testid={`image-${index}`}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-gray-100/50 to-gray-200/50 dark:from-gray-800/30 dark:to-gray-700/30">
                              <Paperclip className="h-8 w-8 text-red-500 dark:text-red-400 mb-2" />
                              <span className="text-xs text-center text-gray-700 dark:text-gray-300 break-words font-medium">
                                {attachment.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(index)}
                          data-testid={`button-remove-attachment-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-filter backdrop-blur-sm text-white text-xs p-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <span className="block truncate" data-testid={`attachment-name-${index}`}>
                            {attachment.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ObjectUploader
                maxNumberOfFiles={10}
                maxFileSize={20971520}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="w-full border-2 border-dashed border-red-300/60 dark:border-red-600/60 rounded-2xl p-8 hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 bg-gradient-to-br from-red-50/30 to-gray-50/30 dark:from-red-900/10 dark:to-gray-900/10 hover:from-red-100/50 hover:to-gray-100/50 dark:hover:from-red-900/20 dark:hover:to-gray-900/20 shadow-sm hover:shadow-md"
              >
                <div className="text-center" data-testid="upload-area">
                  <Upload className="mx-auto h-10 w-10 text-red-500 dark:text-red-400 mb-3" />
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Agregar Evidencia Fotográfica o Documentos
                  </p>
                  <p className="text-xs text-gray-600/70 dark:text-gray-300/70">
                    Imágenes: JPG, PNG, GIF, WEBP - Documentos: PDF, DOC, DOCX, XLS, XLSX
                  </p>
                  <p className="text-xs text-gray-600/70 dark:text-gray-300/70 mt-1">
                    Máx. 20MB por archivo - Hasta 10 archivos
                  </p>
                </div>
              </ObjectUploader>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/60 dark:border-gray-700/60">
              <Button
                type="button"
                variant="outline"
                className="px-6 py-3 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                onClick={onClose}
                data-testid="button-cancel-event"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="btn-gradient-primary px-8 py-3 font-semibold shadow-modern"
                disabled={saveEventMutation.isPending}
                data-testid="button-save-event"
              >
                {saveEventMutation.isPending 
                  ? "Guardando..." 
                  : event ? "Actualizar Evento" : "Registrar Evento"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
