import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, XCircle, Search, Users, FileText, Building2, Briefcase, ClipboardList, Info, Calendar, Users2 } from "lucide-react";
import Header from "@/components/header";
import ContractForm from "@/components/contract-form";
import EventList from "@/components/event-list";
import type { Trust, Contract, EventWithUser } from "@shared/schema";

export default function TrustDetails() {
  const [match, params] = useRoute("/trust/:id");
  const trustId = params?.id;

  const { data: trust, isLoading: trustLoading } = useQuery<Trust>({
    queryKey: ["/api/trusts", trustId],
    enabled: !!trustId,
  });

  const { data: contract } = useQuery<Contract | null>({
    queryKey: ["/api/trusts", trustId, "contract"],
    enabled: !!trustId,
  });

  const { data: events = [] } = useQuery<EventWithUser[]>({
    queryKey: ["/api/trusts", trustId, "events"],
    enabled: !!trustId,
  });

  // Search state
  const [participantSearchQuery, setParticipantSearchQuery] = useState("");

  // Filtered participants
  const filteredTrustors = useMemo(() => {
    const trustors = ((trust?.trustors as any) || []);
    if (!participantSearchQuery) return trustors;
    
    return trustors.filter((trustor: any) => {
      const query = participantSearchQuery.toLowerCase();
      return (
        trustor.name?.toLowerCase().includes(query) ||
        trustor.nit?.toLowerCase().includes(query) ||
        trustor.legalRepresentative?.toLowerCase().includes(query)
      );
    });
  }, [trust?.trustors, participantSearchQuery]);

  const filteredBeneficiaries = useMemo(() => {
    const beneficiaries = ((trust?.beneficiaries as any) || []);
    if (!participantSearchQuery) return beneficiaries;
    
    return beneficiaries.filter((beneficiary: any) => {
      const query = participantSearchQuery.toLowerCase();
      return (
        beneficiary.name?.toLowerCase().includes(query) ||
        beneficiary.nit?.toLowerCase().includes(query)
      );
    });
  }, [trust?.beneficiaries, participantSearchQuery]);

  if (!match || !trustId) {
    return <div>Invalid trust ID</div>;
  }

  if (trustLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trust) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">
              Fideicomiso no encontrado
            </h2>
            <Link href="/">
              <Button className="mt-4" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return (
          <Badge className="bg-green-100 text-green-800" data-testid="status-active">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        );
      case 'en proceso':
        return (
          <Badge className="bg-yellow-100 text-yellow-800" data-testid="status-processing">
            En Proceso
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-100 text-red-800" data-testid="status-inactive">
            <XCircle className="w-3 h-3 mr-1" />
            Inactivo
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la búsqueda
            </Button>
          </Link>
        </div>

        <div className="bg-surface rounded-lg shadow-sm border border-gray-200">
          {/* Trust Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900" data-testid="text-trust-name">
                  {trust.name}
                </h2>
                <p className="text-secondary">
                  Código: <span className="font-medium" data-testid="text-trust-code">{trust.code}</span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusBadge(trust.status)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <div className="border-b border-gray-200">
              <div className="px-6">
                <TabsList className="h-auto p-0 bg-transparent grid grid-cols-4 gap-0">
                  <TabsTrigger 
                    value="info" 
                    className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4 px-4 hover:bg-gray-50 transition-all duration-200"
                    data-testid="tab-info"
                  >
                    <Info className="w-4 h-4" />
                    <span className="hidden sm:inline">Información General</span>
                    <span className="sm:hidden">General</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="contract" 
                    className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4 px-4 hover:bg-gray-50 transition-all duration-200"
                    data-testid="tab-contract"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Información del Contrato</span>
                    <span className="sm:hidden">Contrato</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="participants" 
                    className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4 px-4 hover:bg-gray-50 transition-all duration-200"
                    data-testid="tab-participants"
                  >
                    <Users2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Participantes</span>
                    <span className="sm:hidden">Participantes</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="events" 
                    className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4 px-4 hover:bg-gray-50 transition-all duration-200"
                    data-testid="tab-events"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Libro de Anotaciones</span>
                    <span className="sm:hidden">Eventos</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="info" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Básicos</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Código</label>
                        <p className="text-gray-900" data-testid="text-basic-code">{trust.code}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Estado</label>
                        {getStatusBadge(trust.status)}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-1">Nombre Completo</label>
                      <p className="text-gray-900" data-testid="text-full-name">{trust.fullName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Fecha de Constitución</label>
                        <p className="text-gray-900" data-testid="text-constitution-date">
                          {new Date(trust.constitutionDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Vigencia</label>
                        <p className="text-gray-900" data-testid="text-validity">
                          {new Date(trust.validity).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Participantes</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Fideicomitentes</label>
                      <div className="bg-gray-50 rounded-md p-3 space-y-2">
                        {((trust.trustors as any) || []).map((trustor: any, index: number) => (
                          <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0" data-testid={`text-trustor-${index}`}>
                            <p className="font-medium">
                              {trustor.name} ({parseFloat(trustor.percentage || '0').toFixed(2)}%)
                            </p>
                            <p className="text-sm text-secondary">
                              NIT: {trustor.nit}
                            </p>
                            <p className="text-sm text-secondary">
                              Rep. Legal: {trustor.legalRepresentative}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Beneficiarios</label>
                      <div className="bg-gray-50 rounded-md p-3 space-y-3">
                        {((trust.beneficiaries as any) || []).map((beneficiary: any, index: number) => (
                          <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0" data-testid={`beneficiary-${index}`}>
                            <p className="font-medium">{beneficiary.name}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm text-secondary mt-1">
                              <span>Patrimonial: {parseFloat(beneficiary.patrimonialPercentage || '0').toFixed(2)}%</span>
                              <span>Usufructo: {parseFloat(beneficiary.usufructPercentage || '0').toFixed(2)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">Fiduciaria</label>
                      <div className="bg-gray-50 rounded-md p-3">
                        <p className="font-medium" data-testid="text-fiduciary-name">
                          {(trust.fiduciary as any)?.name}
                        </p>
                        <p className="text-sm text-secondary" data-testid="text-fiduciary-nit">
                          NIT: {(trust.fiduciary as any)?.nit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contract" className="mt-0">
                <ContractForm 
                  trustId={trustId} 
                  contract={contract} 
                  data-testid="contract-form"
                />
              </TabsContent>

              <TabsContent value="participants" className="mt-0">
                <div className="max-w-4xl">
                  <div className="pb-6 border-b border-gray-200/60 mb-8">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                      👥 Participantes del Fideicomiso
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      Información detallada de fideicomitentes y beneficiarios con sus porcentajes de participación
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Fideicomitentes */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <span>Fideicomitentes</span>
                        </h4>
                        {((trust?.trustors as any) || []).length > 1 && (
                          <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Buscar fideicomitente..."
                              value={participantSearchQuery}
                              onChange={(e) => setParticipantSearchQuery(e.target.value)}
                              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              data-testid="input-trustor-search"
                            />
                          </div>
                        )}
                      </div>
                      {/* Simplified Table View */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Fideicomitente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  NIT/ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Representante Legal
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Participación
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {filteredTrustors.map((trustor: any, index: number) => {
                                const percentage = parseFloat(trustor.percentage || '0');
                                
                                return (
                                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700" data-testid={`participant-trustor-${index}`}>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {trustor.name}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Fideicomitente {index + 1}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300" data-testid={`participant-trustor-nit-${index}`}>
                                      {trustor.nit}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300" data-testid={`participant-trustor-representative-${index}`}>
                                      {trustor.legalRepresentative}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center space-x-2">
                                        <div className="w-8 h-8 relative">
                                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                              d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="#e5e7eb"
                                              strokeWidth="4"
                                              strokeDasharray="100, 100"
                                            />
                                            <path
                                              d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="#3b82f6"
                                              strokeWidth="4"
                                              strokeDasharray={`${percentage}, 100`}
                                            />
                                          </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400" data-testid={`participant-trustor-percentage-${index}`}>
                                          {percentage.toFixed(2)}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        
                        {filteredTrustors.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron fideicomitentes</p>
                            {participantSearchQuery && (
                              <p className="text-sm mt-1">que coincidan con "{participantSearchQuery}"</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Total Verification for Trustors */}
                      {((trust?.trustors as any) || []).length > 1 && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Total de participaciones fideicomitentes:
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white" data-testid="total-trustor-participation">
                              {((trust?.trustors as any) || []).reduce((total: number, trustor: any) => {
                                const percentage = parseFloat(trustor.percentage || '0');
                                return total + percentage;
                              }, 0).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Beneficiarios */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                          <span>Beneficiarios</span>
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar por nombre o NIT..."
                            value={participantSearchQuery}
                            onChange={(e) => setParticipantSearchQuery(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            data-testid="input-participant-search"
                          />
                        </div>
                      </div>
                      
                      {/* Simplified Table View */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Beneficiario
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  NIT/ID
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Patrimonial
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Usufructo
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {filteredBeneficiaries.map((beneficiary: any, index: number) => {
                                const patrimonialPercentage = parseFloat(beneficiary.patrimonialPercentage || '0');
                                const usufructPercentage = parseFloat(beneficiary.usufructPercentage || '0');
                                
                                return (
                                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700" data-testid={`participant-beneficiary-${index}`}>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {beneficiary.name}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Beneficiario {index + 1}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                      {beneficiary.nit || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center space-x-2">
                                        <div className="w-8 h-8 relative">
                                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                              d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="#e5e7eb"
                                              strokeWidth="4"
                                              strokeDasharray="100, 100"
                                            />
                                            <path
                                              d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="#10b981"
                                              strokeWidth="4"
                                              strokeDasharray={`${patrimonialPercentage}, 100`}
                                            />
                                          </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400" data-testid={`participant-beneficiary-patrimonial-${index}`}>
                                          {patrimonialPercentage.toFixed(2)}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex items-center justify-center space-x-2">
                                        <div className="w-8 h-8 relative">
                                          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                              d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="#e5e7eb"
                                              strokeWidth="4"
                                              strokeDasharray="100, 100"
                                            />
                                            <path
                                              d="M18 2.0845
                                               a 15.9155 15.9155 0 0 1 0 31.831
                                               a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="#059669"
                                              strokeWidth="4"
                                              strokeDasharray={`${usufructPercentage}, 100`}
                                            />
                                          </svg>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400" data-testid={`participant-beneficiary-usufruct-${index}`}>
                                          {usufructPercentage.toFixed(2)}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        
                        {filteredBeneficiaries.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron beneficiarios</p>
                            {participantSearchQuery && (
                              <p className="text-sm mt-1">que coincidan con "{participantSearchQuery}"</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Total Verification for Both Types */}
                      {((trust?.beneficiaries as any) || []).length > 1 && (
                        <div className="mt-6 space-y-3">
                          <div className="p-4 bg-green-50 dark:bg-green-800/50 rounded-lg border border-green-200 dark:border-green-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Total Participación Patrimonial:
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white" data-testid="total-patrimonial-participation">
                                {((trust?.beneficiaries as any) || []).reduce((total: number, ben: any) => {
                                  const percentage = parseFloat(ben.patrimonialPercentage || '0');
                                  return total + percentage;
                                }, 0).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-800/50 rounded-lg border border-emerald-200 dark:border-emerald-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Total Participación de Usufructo:
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white" data-testid="total-usufruct-participation">
                                {((trust?.beneficiaries as any) || []).reduce((total: number, ben: any) => {
                                  const percentage = parseFloat(ben.usufructPercentage || '0');
                                  return total + percentage;
                                }, 0).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fiduciaria */}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        🏛️ Fiduciaria
                      </h4>
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200/60 dark:border-purple-700/60">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2" data-testid="participant-fiduciary-name">
                              {(trust.fiduciary as any)?.name}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="participant-fiduciary-nit">
                              <span className="font-medium">NIT:</span> {(trust.fiduciary as any)?.nit}
                            </p>
                          </div>
                          <div className="flex items-center ml-6">
                            <div className="bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full text-sm font-semibold">
                              Administrador
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                <EventList 
                  trustId={trustId} 
                  events={events} 
                  data-testid="event-list"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
