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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PreSessionFeedbacksTable } from "./pre-session-feedbacks-table";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PreSessionAnalysisView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [loadingRule, setLoadingRule] = useState<number | string | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  
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

  // Ottieni le statistiche per la sessione selezionata
  const { data: stats, isLoading: isLoadingStats } = useQuery<PreSessionStats>({
    queryKey: ['sessionStats', selectedSessionId],
    queryFn: () => queries.sessionStats.getStats(selectedSessionId),
    enabled: !!selectedSessionId,
    initialData: {
      totalFeedbacks: 0,
      avgFeedbacksPerUser: 0,
      usersWithNoFeedbacks: 0,
      totalUsers: 0
    }
  });

  const preparationSessions = sessions.filter(
    (s) => s.status === "In preparazione"
  );

  // Seleziona la prima sessione in preparazione all'avvio
  useEffect(() => {
    if (preparationSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(preparationSessions[0].id);
    }
  }, [preparationSessions, selectedSessionId]);

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  // Mutation per generare i feedback secondo una regola
  const generateFeedbackMutation = useMutation({
    mutationFn: async ({ ruleNumber, sessionId }: { ruleNumber: number | string, sessionId: string }) => {
      setLoadingRule(ruleNumber);
      
      // Configurazione parametri per le chiamate RPC
      let params = {};
      let functionName = '';
      
      // Configurazione corretta dei parametri in base alla struttura delle funzioni su Supabase
      switch(ruleNumber) {
        case '1':
          functionName = 'generate_rule1_feedbacks';
          params = { "session_id": sessionId };
          break;
        case '2':
          functionName = 'generate_rule2_feedbacks';
          params = { "p_session_id": sessionId };
          break;
        case '3':
          functionName = 'generate_rule3a_feedbacks';
          params = { "session_id": sessionId };
          break;
        case '4':
          functionName = 'generate_rule4_feedbacks';
          params = { "session_id_input": sessionId };
          break;
        case '5':
          functionName = 'generate_rule5_feedbacks';
          params = { "session_uuid": sessionId };
          break;
        case '6':
          functionName = 'generate_rule6_feedbacks';
          params = { "session_uuid": sessionId };
          break;
        case '7':
          functionName = 'generate_rule7_feedbacks';
          params = { "p_session_id": sessionId };
          break;
        case 'duplicates':
          functionName = 'remove_duplicate_feedbacks';
          params = { "session_id": sessionId };
          break;
        default:
          throw new Error(`Regola non supportata: ${ruleNumber}`);
      }
      
      const { data, error } = await supabase.rpc(functionName, params);
      
      if (error) {
        console.error(`Errore nell'esecuzione di ${functionName}:`, error);
        throw new Error(`Errore nell'esecuzione della regola ${ruleNumber}: ${error.message}`);
      }
      
      return { success: true, ruleNumber, data };
    },
    onSuccess: (result, variables) => {
      toast.success(`Regola ${variables.ruleNumber === 'duplicates' ? 'Elimina Duplicati' : variables.ruleNumber} applicata con successo`);
      // Aggiorniamo i dati dopo la generazione dei feedback
      queryClient.invalidateQueries({ queryKey: ['sessionStats', selectedSessionId] });
      queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
    },
    onError: (error) => {
      console.error("Errore mutation:", error);
      toast.error(error instanceof Error ? error.message : 'Errore sconosciuto');
    },
    onSettled: () => {
      setLoadingRule(null);
    }
  });

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

        {/* Stats Section */}
        <div className="mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="FEEDBACK TOTALI" 
              value={stats.totalFeedbacks}
              isLoading={isLoadingStats}
            />
            <StatCard
              title="MEDIA PER UTENTE"
              value={stats.avgFeedbacksPerUser}
              className="bg-blue-100"
              isLoading={isLoadingStats}
            />
            <StatCard
              title="UTENTI SENZA FEEDBACK"
              value={stats.usersWithNoFeedbacks}
              className="bg-yellow-100"
              isLoading={isLoadingStats}
            />
            <StatCard
              title="UTENTI TOTALI"
              value={stats.totalUsers}
              className="bg-green-100"
              isLoading={isLoadingStats}
            />
          </div>

          {selectedSessionId && (
            <div className="mt-6">
              {/* Rules Buttons Section */}
              <div className="mb-4 flex flex-wrap gap-2">
                {/* Regola 1 */}
                <Button 
                  variant="outline" 
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: '1', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === '1' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : 'Regola 1'}
                </Button>
                
                {/* Regola 2 */}
                <Button 
                  variant="outline" 
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: '2', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === '2' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : 'Regola 2'}
                </Button>
                
                {/* Regola 3 (ex 3a) */}
                <Button 
                  variant="outline" 
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: '3', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === '3' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : 'Regola 3'}
                </Button>
                
                {/* Regola 4 */}
                <Button 
                  variant="outline" 
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: '4', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === '4' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : 'Regola 4'}
                </Button>
                
                {/* Regola 5 */}
                <Button 
                  variant="outline" 
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: '5', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === '5' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : 'Regola 5'}
                </Button>
                
                {/* Regola 6 */}
                <Button 
                  variant="outline" 
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: '6', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === '6' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : 'Regola 6'}
                </Button>
                
                {/* Regola 7 */}
                <Button
                  variant="outline"
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: '7', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === '7' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generazione...
                    </>
                  ) : 'Regola 7 (TL Connessi)'}
                </Button>
                
                {/* Elimina Duplicati */}
                <Button 
                  variant="destructive" 
                  onClick={() => generateFeedbackMutation.mutate({ ruleNumber: 'duplicates', sessionId: selectedSessionId })}
                  disabled={loadingRule !== null}
                >
                  {loadingRule === 'duplicates' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Elaborazione...
                    </>
                  ) : 'Elimina duplicati'}
                </Button>
              </div>
              
              {/* Pre Session Analysis Content */}
              <div className="rounded-lg bg-white shadow-sm">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm text-gray-500">Analisi Feedback</p>
                </div>
                <div className="p-4 overflow-x-auto">
                  <PreSessionFeedbacksTable 
                    sessionId={selectedSessionId}
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
