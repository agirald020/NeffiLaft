import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, Clock, MapPin, Paperclip, Edit, Plus, Users, Handshake, CalendarCheck,
  FileText, Briefcase, Package, DollarSign, Gavel, Mail, Phone,
  Building2, ClipboardList, MessageSquare, UserCheck, Scale,
  AlertCircle, PenTool, CalendarDays, MessageCircle, Headphones, FileBarChart, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import EventForm from "./event-form";
import EvidenceGallery from "./evidence-gallery";
import type { EventWithUser } from "@shared/schema";

interface EventListProps {
  trustId: string;
  events: EventWithUser[];
}

export default function EventList({ trustId, events }: EventListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithUser | undefined>();
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      toast({
        title: "Evento eliminado",
        description: "El evento se ha eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trusts", trustId, "events"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento. Inténtelo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const openNewEventModal = () => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const openEditEventModal = (event: EventWithUser) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'actuacion_procesal':
        return <Gavel className="text-sm" />;
      case 'agenda':
        return <ClipboardList className="text-sm" />;
      case 'bienes':
        return <Package className="text-sm" />;
      case 'cartera':
        return <Briefcase className="text-sm" />;
      case 'cartera_comisiones':
        return <DollarSign className="text-sm" />;
      case 'comite':
        return <Handshake className="text-sm" />;
      case 'diligencias_judiciales':
        return <Scale className="text-sm" />;
      case 'documento_fisico':
        return <FileText className="text-sm" />;
      case 'email':
        return <Mail className="text-sm" />;
      case 'general':
        return <Calendar className="text-sm" />;
      case 'informe_constructor':
        return <Building2 className="text-sm" />;
      case 'informe_interventor':
        return <UserCheck className="text-sm" />;
      case 'llamada':
        return <Phone className="text-sm" />;
      case 'modificacion_contractual':
        return <PenTool className="text-sm" />;
      case 'proceso_juridico':
        return <AlertCircle className="text-sm" />;
      case 'providencias_judiciales':
        return <Gavel className="text-sm" />;
      case 'reunion_formal':
        return <CalendarDays className="text-sm" />;
      case 'reunion_informal':
        return <MessageCircle className="text-sm" />;
      case 'servicio_cliente':
        return <Headphones className="text-sm" />;
      case 'junta':
        return <Users className="text-sm" />;
      case 'reunion':
        return <CalendarCheck className="text-sm" />;
      case 'visita':
        return <MapPin className="text-sm" />;
      default:
        return <Calendar className="text-sm" />;
    }
  };

  const getEventIconBg = (type: string) => {
    switch (type) {
      case 'actuacion_procesal':
        return 'bg-red-100 text-red-600';
      case 'agenda':
        return 'bg-gray-200 text-gray-700';
      case 'bienes':
        return 'bg-green-100 text-green-600';
      case 'cartera':
        return 'bg-red-100 text-red-700';
      case 'cartera_comisiones':
        return 'bg-yellow-100 text-yellow-600';
      case 'comite':
        return 'bg-green-100 text-green-600';
      case 'diligencias_judiciales':
        return 'bg-red-100 text-red-600';
      case 'documento_fisico':
        return 'bg-slate-100 text-slate-600';
      case 'email':
        return 'bg-gray-200 text-gray-700';
      case 'general':
        return 'bg-gray-100 text-gray-600';
      case 'informe_constructor':
        return 'bg-orange-100 text-orange-600';
      case 'informe_interventor':
        return 'bg-teal-100 text-teal-600';
      case 'llamada':
        return 'bg-cyan-100 text-cyan-600';
      case 'modificacion_contractual':
        return 'bg-red-200 text-red-700';
      case 'proceso_juridico':
        return 'bg-red-100 text-red-600';
      case 'providencias_judiciales':
        return 'bg-red-100 text-red-600';
      case 'reunion_formal':
        return 'bg-gray-200 text-gray-700';
      case 'reunion_informal':
        return 'bg-pink-100 text-pink-600';
      case 'servicio_cliente':
        return 'bg-green-100 text-green-600';
      case 'junta':
        return 'bg-gray-200 text-gray-700';
      case 'reunion':
        return 'bg-gray-200 text-gray-700';
      case 'visita':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'realizado':
        return <Badge className="bg-green-100 text-green-800">Realizado</Badge>;
      case 'programado':
        return <Badge className="bg-gray-200 text-gray-800">Programado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'reprogramado':
        return <Badge className="bg-yellow-100 text-yellow-800">Reprogramado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'actuacion_procesal':
        return 'Actuación Procesal';
      case 'agenda':
        return 'Agenda';
      case 'bienes':
        return 'Bienes';
      case 'cartera':
        return 'Cartera';
      case 'cartera_comisiones':
        return 'Cartera Comisiones Fiduciaria';
      case 'comite':
        return 'Comité';
      case 'diligencias_judiciales':
        return 'Diligencias Judiciales';
      case 'documento_fisico':
        return 'Documento Físico';
      case 'email':
        return 'E-mail';
      case 'general':
        return 'General';
      case 'informe_constructor':
        return 'Informe Constructor';
      case 'informe_interventor':
        return 'Informe Interventor';
      case 'llamada':
        return 'Llamada';
      case 'modificacion_contractual':
        return 'Modificación Contractual';
      case 'proceso_juridico':
        return 'Proceso Jurídico';
      case 'providencias_judiciales':
        return 'Providencias Judiciales';
      case 'reunion_formal':
        return 'Reunión Formal';
      case 'reunion_informal':
        return 'Reunión Informal';
      case 'servicio_cliente':
        return 'Servicio al Cliente';
      case 'junta':
        return 'Junta';
      case 'reunion':
        return 'Reunión';
      case 'visita':
        return 'Visita';
      default:
        return type;
    }
  };

  const filteredEvents = events.filter(event => {
    if (typeFilter && typeFilter !== "all" && event.type !== typeFilter) return false;
    if (dateFromFilter && new Date(event.date) < new Date(dateFromFilter)) return false;
    if (dateToFilter && new Date(event.date) > new Date(dateToFilter)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Libro de Anotaciones - Eventos</h3>
        <Button 
          onClick={openNewEventModal}
          className="btn-gradient-primary text-white transition-colors flex items-center space-x-2"
          data-testid="button-new-event"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Evento</span>
        </Button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full" data-testid="select-filter-type">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
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
                <SelectItem value="junta">Junta</SelectItem>
                <SelectItem value="reunion">Reunión</SelectItem>
                <SelectItem value="visita">Visita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <Input 
              type="date" 
              className="text-sm"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              data-testid="input-filter-date-from"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <Input 
              type="date" 
              className="text-sm"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              data-testid="input-filter-date-to"
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline"
              className="w-full text-sm text-gray-600 border-gray-300 hover:bg-gray-50"
              onClick={() => {
                setTypeFilter("all");
                setDateFromFilter("");
                setDateToFilter("");
              }}
              data-testid="button-clear-filters"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500" data-testid="empty-events">
            No hay eventos registrados para este fideicomiso.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              data-testid={`event-${event.id}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 ${getEventIconBg(event.type)} rounded-full flex items-center justify-center`}>
                      {getEventIcon(event.type)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900" data-testid={`event-title-${event.id}`}>
                      {event.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-secondary">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {event.startTime && event.endTime && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.startTime} - {event.endTime}
                        </span>
                      )}
                      <span className="flex items-center text-red-600" data-testid={`event-created-by-${event.id}`}>
                        <User className="w-3 h-3 mr-1" />
                        {event.user.username}
                      </span>
                      <span className="inline-flex items-center" data-testid={`event-status-${event.id}`}>
                        {getStatusBadge(event.status)}
                      </span>
                      <Badge variant="outline" data-testid={`event-type-${event.id}`}>
                        {getTypeLabel(event.type)}
                      </Badge>
                      {event.includeInReport && (
                        <Badge 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          data-testid={`event-include-report-${event.id}`}
                        >
                          <FileBarChart className="w-3 h-3 mr-1" />
                          En Informe
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => openEditEventModal(event)}
                  className="text-secondary hover:text-primary"
                  data-testid={`button-edit-event-${event.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              <div className="ml-13">
                <p className="text-gray-700 mb-3" data-testid={`event-description-${event.id}`}>
                  {event.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-sm text-secondary">
                    {event.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </span>
                    )}
                    {Array.isArray(event.attachments) && event.attachments.length > 0 && (
                      <span className="flex items-center" data-testid={`event-attachments-${event.id}`}>
                        <Paperclip className="w-3 h-3 mr-1" />
                        {event.attachments.length} archivo{event.attachments.length !== 1 ? 's' : ''} adjunto{event.attachments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {Array.isArray(event.attachments) && event.attachments.length > 0 && (
                    <EvidenceGallery
                      evidence={event.attachments}
                      eventTitle={event.title}
                      eventType={getTypeLabel(event.type)}
                      eventDate={new Date(event.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EventForm
        trustId={trustId}
        event={editingEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
