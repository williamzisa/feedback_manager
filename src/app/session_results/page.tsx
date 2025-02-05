'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { queries } from "@/lib/supabase/queries";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types';

type SessionOption = {
  id: string;
  name: string;
  end_time: string;
  gap: number | null;
};

type UserSessionData = {
  val_overall: number | null;
  level_standard: number | null;
  val_gap: number | null;
  self_overall: number | null;
  val_execution: number | null;
  val_strategy: number | null;
  val_soft: number | null;
  weight_execution: number | null;
  weight_strategy: number | null;
  weight_soft: number | null;
};

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Caricamento..." />
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      <BottomNav />
    </div>
  );
}

function NoSessionsMessage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="I miei Risultati" />
      <div className="flex flex-col justify-center items-center h-[calc(100vh-180px)] px-4">
        <div className="bg-white rounded-[20px] p-8 text-center max-w-md w-full shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Nessuna Sessione Disponibile</h2>
          <p className="text-gray-600 mb-2">Non ci sono ancora sessioni concluse disponibili per la visualizzazione.</p>
          <p className="text-gray-500 text-sm">Le sessioni appariranno qui una volta completate.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function SessionResultsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [userSessionData, setUserSessionData] = useState<UserSessionData | null>(null);
  const [feedbackCounts, setFeedbackCounts] = useState<{
    execution: number;
    strategy: number;
    soft: number;
  }>({ execution: 0, strategy: 0, soft: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();
        const targetUserId = userId || (await queries.users.getCurrentUser()).id;

        const { data: userSessions } = await supabase
          .from('user_sessions')
          .select(`
            session_id,
            val_gap,
            sessions!inner (
              id,
              name,
              end_time,
              status
            )
          `)
          .eq('user_id', targetUserId)
          .eq('sessions.status', 'Conclusa');

        if (userSessions && userSessions.length > 0) {
          const formattedSessions = userSessions.map(us => ({
            id: us.session_id,
            name: us.sessions.name,
            end_time: us.sessions.end_time || '',
            gap: us.val_gap
          }));

          setSessions(formattedSessions);
          setSelectedSessionId(formattedSessions[0].id);
        } else {
          setSessions([]);
          setSelectedSessionId(null);
        }
      } catch (error) {
        console.error('Errore nel caricamento delle sessioni:', error);
        setSessions([]);
        setSelectedSessionId(null);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [userId]);

  useEffect(() => {
    const loadSessionData = async () => {
      if (!selectedSessionId) return;

      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();
        const targetUserId = userId || (await queries.users.getCurrentUser()).id;

        // Recupera i dati della user_session
        const { data: userSession } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('session_id', selectedSessionId)
          .eq('user_id', targetUserId)
          .single();

        if (userSession) {
          setUserSessionData(userSession);
        }

        // Conta i feedback per tipo
        const { data: feedbacks } = await supabase
          .from('feedbacks')
          .select(`
            value,
            questions!inner (
              type
            )
          `)
          .eq('session_id', selectedSessionId)
          .eq('receiver', targetUserId)
          .gt('value', 0);

        if (feedbacks) {
          const counts = {
            execution: feedbacks.filter(f => f.questions?.type === 'EXECUTION').length,
            strategy: feedbacks.filter(f => f.questions?.type === 'STRATEGY').length,
            soft: feedbacks.filter(f => f.questions?.type === 'SOFT').length
          };
          setFeedbackCounts(counts);
        }

      } catch (error) {
        console.error('Errore nel caricamento dei dati della sessione:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [selectedSessionId, userId]);

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleViewDetails = async () => {
    try {
      const supabase = createClientComponentClient<Database>();
      const targetUserId = userId || (await queries.users.getCurrentUser()).id;
      
      // Se non abbiamo l'userId nell'URL, otteniamo anche il nome dell'utente
      let targetUserName = userName || '';
      if (!userName) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name')
          .eq('id', targetUserId)
          .single();

        if (userError) throw userError;
        targetUserName = userData?.name || '';
      }

      const queryParams = new URLSearchParams();
      queryParams.set('userId', targetUserId);
      queryParams.set('userName', targetUserName);
      if (selectedSessionId) {
        queryParams.set('sessionId', selectedSessionId);
      }

      window.location.href = `/session_results/feedback?${queryParams.toString()}`;
    } catch (error) {
      console.error('Errore nel recupero dei dati utente:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (sessions.length === 0) {
    return <NoSessionsMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={userName ? userName : 'I miei Risultati'} />

      <main className="container mx-auto max-w-2xl px-4 py-6 pb-32 mt-[60px]">
        {/* Session Selector */}
        <div className="mb-6">
          <Select value={selectedSessionId || ''} onValueChange={handleSessionChange}>
            <SelectTrigger className="w-full bg-white">
              <div className="flex justify-between items-center w-full">
                <span>
                  {sessions.find(s => s.id === selectedSessionId)?.name || 'Seleziona una sessione'}
                </span>
                <span className="text-yellow-600">
                  GAP: {userSessionData?.val_gap ? `${(userSessionData.val_gap * 100).toFixed(0)}%` : 'N/A'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {`${session.name} - ${formatDate(session.end_time)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Overview */}
        <div className="bg-white rounded-[20px] p-6 mb-4 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold">
                Overall: {userSessionData?.val_overall?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-2xl font-bold">
                Standard: {userSessionData?.level_standard?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xl text-yellow-600">
              GAP: {userSessionData?.val_gap ? `${(userSessionData.val_gap * 100).toFixed(0)}%` : 'N/A'} (in linea)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold">Il mio Mentor: N/A</span>
            </div>
            <div>
              <span className="text-2xl font-bold">
                Self: {userSessionData?.self_overall?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Cards */}
        <div className="space-y-4 mb-6">
          {/* Soft Skills */}
          <div className="bg-[#FFF8F0] rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Soft Skills</h2>
              <span className="bg-[#F5A623] text-white text-xl font-bold px-4 py-1 rounded-full">
                {userSessionData?.val_soft?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[#F5A623]">{feedbackCounts.soft} feedback ricevuti</p>
              <p className="text-[#F5A623]">
                Peso: {userSessionData?.weight_soft ? `${userSessionData.weight_soft}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Strategy Skills */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Strategy Skills</h2>
              <span className="bg-[#00BFA5] text-white text-xl font-bold px-4 py-1 rounded-full">
                {userSessionData?.val_strategy?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[#00BFA5]">{feedbackCounts.strategy} feedback ricevuti</p>
              <p className="text-[#00BFA5]">
                Peso: {userSessionData?.weight_strategy ? `${userSessionData.weight_strategy}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Execution Skills */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Execution Skills</h2>
              <span className="bg-[#4285F4] text-white text-xl font-bold px-4 py-1 rounded-full">
                {userSessionData?.val_execution?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[#4285F4]">{feedbackCounts.execution} feedback ricevuti</p>
              <p className="text-[#4285F4]">
                Peso: {userSessionData?.weight_execution ? `${userSessionData.weight_execution}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* View Details Button - Fixed at bottom */}
        <div className="fixed bottom-[80px] left-0 right-0 px-4 py-4 bg-gray-50">
          <div className="container mx-auto max-w-2xl">
            <Button 
              className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white py-6 rounded-full text-lg"
              onClick={handleViewDetails}
            >
              Vedi Dettaglio
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function SessionResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SessionResultsContent />
    </Suspense>
  );
} 