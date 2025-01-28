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

export type SessionStatus = 'In preparazione' | 'In corso' | 'Conclusa';
type Session = Database['public']['Tables']['sessions']['Row'];

export function FeedbackManagementView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("In corso");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<PreSessionStats>({
    totalFeedbacks: 0,
    avgFeedbacksPerUser: 0,
    usersWithNoFeedbacks: 0,
    totalUsers: 0,
  });

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
              {/* Feedback Management Content */}
              <div className="rounded-lg bg-white shadow-sm">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm text-gray-500">Gestione Feedback</p>
                </div>
                <div className="p-4 overflow-x-auto">
                  {/* Feedback Management Table/Content */}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
