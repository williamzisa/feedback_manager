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
import { PreSessionStats } from "@/lib/types/feedbacks";
import { queries } from "@/lib/supabase/queries";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/supabase/database.types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type SessionStatus = 'In preparazione' | 'In corso' | 'Conclusa';
type Session = Database['public']['Tables']['sessions']['Row'];

type FeedbackType = 'SOFT' | 'EXECUTION' | 'STRATEGY';
type FeedbackResponseFilter = 'all' | 'with_response' | 'without_response';

type FeedbackData = {
  id: string;
  value: number | null;
  comment: string | null;
  sender: { id: string; name: string; surname: string } | null;
  receiver: { id: string; name: string; surname: string } | null;
  question: { id: string; description: string; type: string } | null;
  rule_number: number | null;
};

type ValidFeedback = {
  id: string;
  value: number | null;
  comment: string | null;
  sender: { id: string; name: string; surname: string };
  receiver: { id: string; name: string; surname: string };
  question: { id: string; description: string; type: string } | null;
  rule_number: number | null;
};

type FeedbackWithType = {
  id: string;
  sender: {
    id: string;
    name: string;
    surname: string;
  };
  receiver: {
    id: string;
    name: string;
    surname: string;
  };
  question: string;
  value: number | null;
  comment: string | null;
  questionType: string;
  rule_number: number | null;
};

export function FeedbackManagementView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("In corso");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<PreSessionStats>({
    totalFeedbacks: 0,
    duplicateFeedbacks: 0,
    usersWithNoFeedbacks: 0,
    totalUsers: 0,
    avgFeedbacksPerUser: 0
  });

  // Filtri
  const [senderFilter, setSenderFilter] = useState("");
  const [receiverFilter, setReceiverFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "all">("all");
  const [responseFilter, setResponseFilter] = useState<FeedbackResponseFilter>("all");

  // Feedback
  const [feedbacks, setFeedbacks] = useState<FeedbackWithType[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackWithType[]>([]);

  // Carica le sessioni all'avvio
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const currentUser = await queries.users.getCurrentUser();
        if (!currentUser.company) {
          throw new Error('Company non configurata per questo utente');
        }
        
        const sessionsData = await queries.sessions.getByCompany(currentUser.company);
        const filteredSessions = sessionsData.filter(s => 
          s.status === "In corso" || s.status === "Conclusa"
        );
        setSessions(filteredSessions);

        if (filteredSessions.length > 0 && !selectedSessionId) {
          const firstSession = filteredSessions[0];
          setSelectedSessionId(firstSession.id);
          setSessionStatus(mapSessionStatus(firstSession.status));
        }
      } catch (error) {
        console.error('Errore nel caricamento delle sessioni:', error);
      }
    };

    loadSessions();
  }, [selectedSessionId]);

  // Carica le statistiche quando viene selezionata una sessione
  useEffect(() => {
    const loadStats = async () => {
      if (selectedSessionId) {
        try {
          const sessionStats = await queries.sessionStats.getStats(selectedSessionId);
          setStats(sessionStats);
        } catch (error) {
          console.error('Errore nel caricamento delle statistiche:', error);
        }
      }
    };

    loadStats();
  }, [selectedSessionId]);

  // Carica i feedback quando viene selezionata una sessione
  useEffect(() => {
    const loadFeedbacks = async () => {
      if (selectedSessionId) {
        try {
          const supabase = createClientComponentClient<Database>();
          const { data: feedbackData, error } = await supabase
            .from('feedbacks')
            .select(`
              id,
              value,
              comment,
              sender:users!feedbacks_sender_fkey (
                id,
                name,
                surname
              ),
              receiver:users!feedbacks_receiver_fkey (
                id,
                name,
                surname
              ),
              question:questions (
                id,
                description,
                type
              ),
              rule_number
            `)
            .eq('session_id', selectedSessionId);

          if (error) throw error;

          const formattedFeedbacks = (feedbackData || [])
            .filter((feedback: FeedbackData): feedback is ValidFeedback => 
              feedback.sender !== null && feedback.receiver !== null
            )
            .map(feedback => ({
              id: feedback.id,
              sender: feedback.sender,
              receiver: feedback.receiver,
              question: feedback.question?.description || '',
              value: feedback.value,
              comment: feedback.comment,
              questionType: feedback.question?.type || '',
              rule_number: feedback.rule_number
            }));

          setFeedbacks(formattedFeedbacks);
          setFilteredFeedbacks(formattedFeedbacks);
        } catch (error) {
          console.error('Errore nel caricamento dei feedback:', error);
        }
      }
    };

    loadFeedbacks();
  }, [selectedSessionId]);

  // Applica i filtri quando cambiano
  useEffect(() => {
    let filtered = [...feedbacks];

    // Filtro per mittente
    if (senderFilter) {
      filtered = filtered.filter(f => 
        `${f.sender.name} ${f.sender.surname}`.toLowerCase().includes(senderFilter.toLowerCase())
      );
    }

    // Filtro per destinatario
    if (receiverFilter) {
      filtered = filtered.filter(f => 
        `${f.receiver.name} ${f.receiver.surname}`.toLowerCase().includes(receiverFilter.toLowerCase())
      );
    }

    // Filtro per tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter(f => f.questionType.toLowerCase() === typeFilter.toLowerCase());
    }

    // Filtro per risposta
    if (responseFilter !== "all") {
      filtered = filtered.filter(f => 
        responseFilter === "with_response" ? f.value !== null : f.value === null
      );
    }

    // Ordinamento per mittente e destinatario
    filtered.sort((a, b) => {
      const senderCompare = a.sender.name.localeCompare(b.sender.name);
      if (senderCompare !== 0) return senderCompare;
      return a.receiver.name.localeCompare(b.receiver.name);
    });

    setFilteredFeedbacks(filtered);
  }, [feedbacks, senderFilter, receiverFilter, typeFilter, responseFilter]);

  const handleSessionChange = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setSelectedSessionId(sessionId);
      setSessionStatus(mapSessionStatus(session.status));
    }
  };

  const mapSessionStatus = (status: string): SessionStatus => {
    switch (status) {
      case "In corso":
        return "In corso";
      case "Conclusa":
        return "Conclusa";
      case "In preparazione":
        return "In preparazione";
      default:
        return "In corso";
    }
  };

  const getStatusBadgeVariant = (status: SessionStatus) => {
    switch (status) {
      case "In corso":
        return "secondary";
      case "Conclusa":
        return "outline";
      case "In preparazione":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: SessionStatus) => {
    return status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestione Feedback
          </h1>
        </div>

        {/* Session Selector */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard title="FEEDBACK TOTALI" value={stats.totalFeedbacks} />
              <StatCard
                title="MEDIA PER UTENTE"
                value={stats.avgFeedbacksPerUser}
                className="bg-blue-100"
              />
              <StatCard
                title="UTENTI SENZA FEEDBACK"
                value={stats.usersWithNoFeedbacks}
                className="bg-yellow-100"
              />
              <StatCard
                title="UTENTI TOTALI"
                value={stats.totalUsers}
                className="bg-green-100"
              />
            </div>

            <div className="mt-6">
              <div className="rounded-lg bg-white shadow-sm">
                <div className="px-4 py-3 border-b">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Gestione Feedback</p>
                    <span className="text-sm text-gray-500">{filteredFeedbacks.length} risultati</span>
                  </div>
                </div>

                {/* Filtri */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Filtra per mittente..."
                    value={senderFilter}
                    onChange={(e) => setSenderFilter(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    placeholder="Filtra per destinatario..."
                    value={receiverFilter}
                    onChange={(e) => setReceiverFilter(e.target.value)}
                    className="w-full"
                  />
                  <Select
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value as FeedbackType | "all")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo di feedback" />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Stato risposta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le risposte</SelectItem>
                      <SelectItem value="with_response">Con risposta</SelectItem>
                      <SelectItem value="without_response">Senza risposta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabella Feedback */}
                <div className="p-4 overflow-x-auto">
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
                      {filteredFeedbacks.map((feedback) => (
                        <TableRow key={feedback.id}>
                          <TableCell>{`${feedback.sender.name} ${feedback.sender.surname}`}</TableCell>
                          <TableCell>{`${feedback.receiver.name} ${feedback.receiver.surname}`}</TableCell>
                          <TableCell>{feedback.question}</TableCell>
                          <TableCell>
                            {feedback.value === null 
                              ? "Nessuna risposta" 
                              : feedback.value === 0 
                                ? "Non lo so" 
                                : feedback.value}
                          </TableCell>
                          <TableCell>{feedback.comment || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
