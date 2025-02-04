"use client";

import { useState, useEffect, useMemo } from "react";
import { StatCard } from "@/components/stats/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { queries } from "@/lib/supabase/queries";
import { Session } from "@/lib/types/sessions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PreSessionFeedbacksTable } from "./pre-session-feedbacks-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function PreSessionAnalysisView() {
  const router = useRouter();
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [generatingRule, setGeneratingRule] = useState<string | null>(null);
  const [removingDuplicates, setRemovingDuplicates] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const queryClient = useQueryClient();
  
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

  // Aggiungiamo una query per i feedback
  const { data: feedbacks = [], isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: ['feedbacks', selectedSessionId],
    queryFn: () => selectedSessionId ? queries.feedbacks.getBySession(selectedSessionId) : Promise.resolve([]),
    enabled: !!selectedSessionId
  });

  // Calcola le statistiche dai feedback usando useMemo
  const stats = useMemo(() => {
    if (!feedbacks.length) {
      return {
        totalFeedbacks: 0,
        duplicateFeedbacks: 0,
        usersWithNoFeedbacks: 0,
        totalUsers: 0,
        avgFeedbacksPerUser: 0,
        usersWithNoFeedbacksDetails: []
      };
    }

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
  }, [feedbacks]);

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

  const removeDuplicates = async () => {
    if (!selectedSessionId) return;
    try {
      setRemovingDuplicates(true);
      const deletedCount = await queries.feedbacks.removeDuplicateFeedbacks(selectedSessionId);
      // Invalidiamo la query dei feedback per forzare un refresh
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
      toast.success(`${deletedCount} feedback duplicati rimossi con successo`);
    } catch (error) {
      const err = error as Error;
      console.error('Errore nella rimozione dei feedback duplicati:', err);
      toast.error(`Errore nella rimozione dei feedback duplicati: ${err.message}`);
    } finally {
      setRemovingDuplicates(false);
    }
  };

  // Funzione per verificare se una regola è già stata applicata
  const hasRuleBeenApplied = (ruleNumber: number) => {
    return feedbacks.some(f => f.rule_number === ruleNumber);
  };

  // Funzioni per generare i feedback per ogni regola
  const generateRule1 = async () => {
    if (!selectedSessionId) return;
    try {
      setGeneratingRule('1');
      await queries.feedbacks.generateRule1(selectedSessionId);
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
      toast.success('Feedback generati con successo per la Regola 1');
    } catch (error) {
      console.error('Errore nella generazione dei feedback:', error);
      toast.error('Errore nella generazione dei feedback per la Regola 1');
    } finally {
      setGeneratingRule(null);
    }
  };

  const generateRule2 = async () => {
    if (!selectedSessionId) return;
    try {
      setGeneratingRule('2');
      await queries.feedbacks.generateRule2(selectedSessionId);
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
      toast.success('Feedback generati con successo per la Regola 2');
    } catch (error) {
      console.error('Errore nella generazione dei feedback:', error);
      toast.error('Errore nella generazione dei feedback per la Regola 2');
    } finally {
      setGeneratingRule(null);
    }
  };

  const generateRule3 = async () => {
    if (!selectedSessionId) return;
    try {
      setGeneratingRule('3');
      await queries.feedbacks.generateRule3(selectedSessionId);
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
      toast.success('Feedback generati con successo per la Regola 3');
    } catch (error) {
      console.error('Errore nella generazione dei feedback:', error);
      toast.error('Errore nella generazione dei feedback per la Regola 3');
    } finally {
      setGeneratingRule(null);
    }
  };

  const generateRule4 = async () => {
    if (!selectedSessionId) return;
    try {
      setGeneratingRule('4');
      await queries.feedbacks.generateRule4(selectedSessionId);
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
      toast.success('Feedback generati con successo per la Regola 4');
    } catch (error) {
      console.error('Errore nella generazione dei feedback:', error);
      toast.error('Errore nella generazione dei feedback per la Regola 4');
    } finally {
      setGeneratingRule(null);
    }
  };

  const generateRule5 = async () => {
    if (!selectedSessionId) return;
    try {
      setGeneratingRule('5');
      await queries.feedbacks.generateRule5(selectedSessionId);
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
      toast.success('Feedback generati con successo per la Regola 5');
    } catch (error) {
      console.error('Errore nella generazione dei feedback:', error);
      toast.error('Errore nella generazione dei feedback per la Regola 5');
    } finally {
      setGeneratingRule(null);
    }
  };

  const generateRule6 = async () => {
    if (!selectedSessionId) return;
    try {
      setGeneratingRule('6');
      await queries.feedbacks.generateRule6(selectedSessionId);
      await queryClient.invalidateQueries({ queryKey: ['feedbacks', selectedSessionId] });
      toast.success('Feedback generati con successo per la Regola 6');
    } catch (error) {
      console.error('Errore nella generazione dei feedback:', error);
      toast.error('Errore nella generazione dei feedback per la Regola 6');
    } finally {
      setGeneratingRule(null);
    }
  };

  const handleStartSession = async () => {
    if (!selectedSessionId) return;
    try {
      const selectedSession = sessions.find(s => s.id === selectedSessionId);
      if (!selectedSession) return;

      // Aggiorna lo stato della sessione a "In corso"
      await queries.sessions.update(selectedSessionId, {
        name: selectedSession.name,
        start_time: selectedSession.start_time,
        end_time: selectedSession.end_time,
        clusters: selectedSession.session_clusters?.map(sc => sc.cluster.id) || [],
        status: "In corso"
      });
      
      // Invalida la query delle sessioni per aggiornare la cache
      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
      
      // Reindirizza alla pagina di gestione feedback
      router.push(`/admin/feedback-management?session=${selectedSessionId}`);
      
      toast.success('Sessione avviata con successo');
    } catch (error) {
      console.error('Errore nell\'avvio della sessione:', error);
      toast.error('Errore nell\'avvio della sessione');
    }
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
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
          {selectedSessionId && feedbacks.length > 0 && (
            <Button
              onClick={() => setShowStartDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Avvia Sessione
            </Button>
          )}
        </div>

        {/* Dialog di conferma avvio sessione */}
        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conferma avvio sessione</DialogTitle>
              <DialogDescription>
                Stai per avviare una sessione con {feedbacks.length} feedback.
                La sessione passerà dallo stato &ldquo;In preparazione&rdquo; a &ldquo;In corso&rdquo;.
                Vuoi procedere?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStartDialog(false)}>
                Annulla
              </Button>
              <Button onClick={handleStartSession}>
                Avvia Sessione
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Session Selector and Rule Buttons */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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

          {selectedSessionId && (
            <div className="flex flex-wrap gap-2">
              {stats.duplicateFeedbacks > 0 && (
                <Button
                  variant="destructive"
                  onClick={removeDuplicates}
                  disabled={removingDuplicates}
                >
                  {removingDuplicates ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rimozione...
                    </>
                  ) : (
                    'Elimina duplicati'
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={generateRule1}
                disabled={!selectedSessionId || generatingRule !== null || hasRuleBeenApplied(1)}
              >
                {generatingRule === '1' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  'Genera Regola 1'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={generateRule2}
                disabled={!selectedSessionId || generatingRule !== null || hasRuleBeenApplied(2)}
              >
                {generatingRule === '2' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  'Genera Regola 2'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={generateRule3}
                disabled={!selectedSessionId || generatingRule !== null || hasRuleBeenApplied(3)}
              >
                {generatingRule === '3' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  'Genera Regola 3'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={generateRule4}
                disabled={!selectedSessionId || generatingRule !== null || hasRuleBeenApplied(4)}
              >
                {generatingRule === '4' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  'Genera Regola 4'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={generateRule5}
                disabled={!selectedSessionId || generatingRule !== null || hasRuleBeenApplied(5)}
              >
                {generatingRule === '5' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  'Genera Regola 5'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={generateRule6}
                disabled={!selectedSessionId || generatingRule !== null || hasRuleBeenApplied(6)}
              >
                {generatingRule === '6' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione...
                  </>
                ) : (
                  'Genera Regola 6'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoadingFeedbacks ? (
              <>
                <StatCard 
                  title="FEEDBACK TOTALI" 
                  value={0}
                  isLoading={true}
                />
                <StatCard
                  title="FEEDBACK DUPLICATI"
                  value={0}
                  isLoading={true}
                  className="bg-red-100"
                />
                <StatCard
                  title="UTENTI SENZA FEEDBACK"
                  value={0}
                  isLoading={true}
                  className="bg-yellow-100"
                />
                <StatCard
                  title="UTENTI TOTALI"
                  value={0}
                  isLoading={true}
                  className="bg-green-100"
                />
              </>
            ) : (
              <>
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
              </>
            )}
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
                    feedbacks={feedbacks}
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
