"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/stats/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { managementQueries } from "@/lib/queries/feedback-management.queries";
import { queryKeys } from "@/lib/query-keys";
import { FeedbackType, SessionStatus } from "@/lib/types/feedback.types";
import type { FeedbackManagementFilters } from "@/lib/types/feedback-management.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeedbackResponseFilter = 'all' | 'with_response' | 'without_response';

const ITEMS_PER_PAGE = 10;

export function FeedbackManagementView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(SessionStatus.PREPARATION);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Query per le sessioni
  const { data: sessions = [] } = useQuery({
    queryKey: queryKeys.sessions.all(),
    queryFn: async () => {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .or('status.eq.In corso,status.eq.Conclusa')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Seleziona automaticamente la prima sessione disponibile
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      const firstSession = sessions[0];
      setSelectedSessionId(firstSession.id);
      setSessionStatus(firstSession.status as SessionStatus);
    }
  }, [sessions, selectedSessionId]);
  
  // Filtri
  const [senderFilter, setSenderFilter] = useState('');
  const [receiverFilter, setReceiverFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [responseFilter, setResponseFilter] = useState<FeedbackResponseFilter>('all');

  // Query per le statistiche
  const { data: feedbackStats = { 
    totalResponses: 0, 
    responseRate: 0, 
    averageScore: 0, 
    feedbacksByType: {
      [FeedbackType.SOFT]: 0,
      [FeedbackType.EXECUTION]: 0,
      [FeedbackType.STRATEGY]: 0
    }
  } } = useQuery({
    queryKey: queryKeys.management.feedbacks.stats(selectedSessionId),
    queryFn: () => managementQueries.getStats(selectedSessionId),
    enabled: !!selectedSessionId
  });

  // Query per i feedback filtrati
  const { data: filteredFeedbacks = [] } = useQuery({
    queryKey: queryKeys.management.feedbacks.filtered(selectedSessionId, {
      sender: senderFilter,
      receiver: receiverFilter,
      type: typeFilter,
      responseStatus: responseFilter
    }),
    queryFn: () => managementQueries.getFilteredFeedbacks(selectedSessionId, {
      sender: senderFilter,
      receiver: receiverFilter,
      type: typeFilter,
      responseStatus: responseFilter
    } as FeedbackManagementFilters),
    enabled: !!selectedSessionId,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  // Calcola i feedback paginati
  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Gestione paginazione
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Reset paginazione quando cambiano i filtri
  useEffect(() => {
    setCurrentPage(1);
  }, [senderFilter, receiverFilter, typeFilter, responseFilter]);

  // Funzione per ottenere la variante del badge in base allo stato
  const getStatusBadgeVariant = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.ACTIVE:
        return "default";
      case SessionStatus.COMPLETED:
        return "secondary";
      default:
        return "outline";
    }
  };

  // Funzione per ottenere l'etichetta dello stato
  const getStatusLabel = (status: SessionStatus) => status;

  // Gestione cambio sessione
  const handleSessionChange = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    setSelectedSessionId(sessionId);
    if (session) {
      setSessionStatus(session.status as SessionStatus);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Feedback</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestisci e monitora i feedback per le sessioni attive
          </p>
        </div>

        {/* Session Selector */}
        <div>
          <div className="w-full sm:w-96">
            <Select
              value={selectedSessionId}
              onValueChange={handleSessionChange}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleziona una sessione" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSessionId && (
              <div className="mt-2">
                <Badge variant={getStatusBadgeVariant(sessionStatus)}>
                  {getStatusLabel(sessionStatus)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {selectedSessionId && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="FEEDBACK TOTALI" 
                value={filteredFeedbacks.length} 
                className="bg-white"
              />
              <StatCard
                title="TASSO DI RISPOSTA"
                value={Math.round(feedbackStats.responseRate)}
                className="bg-blue-50"
              />
              <StatCard
                title="MEDIA VALUTAZIONI"
                value={Number(feedbackStats.averageScore.toFixed(1))}
                className="bg-yellow-50"
              />
              <StatCard
                title="FEEDBACK SOFT"
                value={feedbackStats.feedbacksByType[FeedbackType.SOFT]}
                className="bg-green-50"
              />
            </div>

            {/* Filtri e Tabella */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-500">Gestione Feedback</h2>
                <span className="text-sm text-gray-500">{filteredFeedbacks.length} risultati</span>
              </div>

              {/* Filtri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="Filtra per mittente..."
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                  className="bg-white"
                />
                <Input
                  placeholder="Filtra per destinatario..."
                  value={receiverFilter}
                  onChange={(e) => setReceiverFilter(e.target.value)}
                  className="bg-white"
                />
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as FeedbackType | "all")}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Tutti i tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    <SelectItem value="SOFT">Soft</SelectItem>
                    <SelectItem value="EXECUTION">Execution</SelectItem>
                    <SelectItem value="STRATEGY">Strategy</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={responseFilter}
                  onValueChange={(value) => setResponseFilter(value as FeedbackResponseFilter)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Tutte le risposte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte le risposte</SelectItem>
                    <SelectItem value="with_response">Con risposta</SelectItem>
                    <SelectItem value="without_response">Senza risposta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Paginazione */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Pagina {currentPage} di {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tabella Feedback */}
              <div className="rounded-lg border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mittente</TableHead>
                      <TableHead>Destinatario</TableHead>
                      <TableHead>Domanda</TableHead>
                      <TableHead>Valore</TableHead>
                      <TableHead>Commento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFeedbacks.length > 0 ? (
                      paginatedFeedbacks.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>{`${feedback.sender.name} ${feedback.sender.surname}`}</TableCell>
                          <TableCell>{`${feedback.receiver.name} ${feedback.receiver.surname}`}</TableCell>
                          <TableCell>{feedback.question.description}</TableCell>
                          <TableCell>
                            {feedback.value === null 
                              ? "Nessuna risposta" 
                              : feedback.value === 0 
                                ? "Non lo so" 
                                : feedback.value}
                          </TableCell>
                          <TableCell>{feedback.comment || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Nessun feedback trovato
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
