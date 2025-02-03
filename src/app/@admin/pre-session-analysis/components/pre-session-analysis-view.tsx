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
import { Badge } from "@/components/ui/badge";
import { queries } from "@/lib/supabase/queries";
import { Session } from "@/lib/types/sessions";
import { useQuery } from "@tanstack/react-query";
import { PreSessionFeedbacksTable } from "./pre-session-feedbacks-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Feedback } from "@/lib/types/feedbacks";

export function PreSessionAnalysisView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<PreSessionStats>({
    totalFeedbacks: 0,
    duplicateFeedbacks: 0,
    usersWithNoFeedbacks: 0,
    totalUsers: 0,
    avgFeedbacksPerUser: 0,
    usersWithNoFeedbacksDetails: []
  });
  
  // Ottieni l'utente corrente
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: queries.users.getCurrentUser
  });

  // Ottieni le sessioni per la company dell'utente
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery<Session[]>({
    queryKey: ['sessions', currentUser?.company],
    queryFn: () => {
      if (!currentUser?.company) throw new Error('Company non disponibile');
      return queries.sessions.getByCompany(currentUser.company);
    },
    enabled: !!currentUser?.company
  });

  // Calcola le statistiche dai feedback filtrati
  const calculateStats = (feedbacks: Feedback[]): PreSessionStats => {
    // Calcola i feedback duplicati
    const feedbackMap = new Map<string, number>();
    let duplicateFeedbacks = 0;

    feedbacks.forEach(feedback => {
      const key = `${feedback.sender}-${feedback.receiver}-${feedback.question}`;
      feedbackMap.set(key, (feedbackMap.get(key) || 0) + 1);
    });

    feedbackMap.forEach(count => {
      if (count > 1) {
        duplicateFeedbacks += (count - 1);
      }
    });

    // Ottieni tutti gli utenti unici
    const uniqueUsers = new Set<string>();
    const uniqueReceivers = new Set<string>();
    const usersDetails = new Map<string, { name: string; surname: string }>();

    feedbacks.forEach(feedback => {
      const [senderName, senderSurname] = feedback.sender.split(' ');
      const [receiverName, receiverSurname] = feedback.receiver.split(' ');
      
      if (feedback.sender) {
        uniqueUsers.add(feedback.sender);
        usersDetails.set(feedback.sender, { name: senderName, surname: senderSurname });
      }
      if (feedback.receiver) {
        uniqueUsers.add(feedback.receiver);
        uniqueReceivers.add(feedback.receiver);
        usersDetails.set(feedback.receiver, { name: receiverName, surname: receiverSurname });
      }
    });

    // Trova gli utenti senza feedback
    const usersWithNoFeedbacksDetails = Array.from(uniqueUsers)
      .filter(user => !uniqueReceivers.has(user))
      .map(user => usersDetails.get(user)!)
      .filter(details => details);

    const totalUsers = uniqueUsers.size;
    const avgFeedbacksPerUser = totalUsers > 0 ? feedbacks.length / totalUsers : 0;

    return {
      totalFeedbacks: feedbacks.length,
      duplicateFeedbacks,
      usersWithNoFeedbacks: usersWithNoFeedbacksDetails.length,
      totalUsers,
      avgFeedbacksPerUser,
      usersWithNoFeedbacksDetails
    };
  };

  useEffect(() => {
    if (filteredFeedbacks.length > 0) {
      const newStats = calculateStats(filteredFeedbacks);
      setStats(newStats);
    }
  }, [filteredFeedbacks]);

  const preparationSessions = sessions.filter(
    (s) => s.status === "In preparazione"
  );

  // Seleziona la prima sessione in preparazione all'avvio
  useEffect(() => {
    if (preparationSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(preparationSessions[0].id);
    }
  }, [preparationSessions, selectedSessionId]);

  // Debug log per vedere quando cambia la sessione selezionata
  useEffect(() => {
    console.log('Selected session changed to:', selectedSessionId);
  }, [selectedSessionId]);

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  if (isLoadingSessions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Caricamento sessioni...</div>
      </div>
    );
  }

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

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
            Analisi pre Sessione
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
                <SelectValue placeholder="Seleziona una sessione in preparazione" />
              </SelectTrigger>
              <SelectContent>
                {preparationSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSession && (
              <div className="mt-2">
                <Badge variant="default">{selectedSession.status}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="FEEDBACK TOTALI" 
              value={stats.totalFeedbacks}
            />
            <StatCard
              title="FEEDBACK DUPLICATI"
              value={stats.duplicateFeedbacks}
              className="bg-red-100"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <StatCard
                      title="UTENTI SENZA FEEDBACK"
                      value={stats.usersWithNoFeedbacks}
                      className="bg-yellow-100"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] max-h-[200px] overflow-y-auto">
                  <div className="p-2">
                    {stats.usersWithNoFeedbacksDetails?.map((user, index) => (
                      <div key={index} className="whitespace-nowrap">
                        {user.name} {user.surname}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <StatCard
              title="UTENTI TOTALI"
              value={stats.totalUsers}
              className="bg-green-100"
            />
          </div>

          {selectedSessionId && (
            <div className="mt-6">
              <div className="rounded-lg bg-white shadow-sm">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm text-gray-500">Analisi Feedback</p>
                </div>
                <div className="p-4 overflow-x-auto">
                  <PreSessionFeedbacksTable 
                    sessionId={selectedSessionId}
                    onFilteredDataChange={setFilteredFeedbacks}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
