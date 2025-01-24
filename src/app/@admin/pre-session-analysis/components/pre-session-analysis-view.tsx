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
import { mockSessionsApi } from "@/lib/data/mock-sessions";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Session, SessionStatus } from "@/lib/types/sessions";
import { Button } from "@/components/ui/button";
import { GenerateFeedbackDialog } from "./dialogs/generate-feedback-dialog";

export function PreSessionAnalysisView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const allSessions = mockSessionsApi.getAll();
  const preparationSessions = allSessions.filter(
    (s) => s.stato === "In preparazione"
  );

  // Seleziona la prima sessione in preparazione all'avvio
  useEffect(() => {
    if (preparationSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(preparationSessions[0].id);
    }
  }, [preparationSessions, selectedSessionId]);

  // Statistiche statiche (da implementare con i dati reali)
  const stats: PreSessionStats = {
    totalFeedbacks: 2365,
    avgFeedbacksPerUser: 38.7,
    usersWithNoFeedbacks: 33,
    totalUsers: 61,
  };

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
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
                    {session.nomeSessione}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSessionId && (
              <div className="mt-2">
                <Badge variant="default">In Preparazione</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

          {selectedSessionId && (
            <div className="mt-6">
              {/* Pre Session Analysis Content */}
              <div className="rounded-lg bg-white shadow-sm">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm text-gray-500">Analisi Feedback</p>
                </div>
                <div className="p-4 overflow-x-auto">
                  {/* Pre Session Analysis Table/Content */}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
