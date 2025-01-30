'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BottomNav from "@/components/navigation/bottom-nav";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import Header from "@/components/navigation/header";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from "@/lib/supabase/database.types";

type Session = {
  id: string;
  created_at: string;
  val_gap: number | null;
};

type FeedbackData = {
  question_id: string;
  question_type: string;
  question_description: string;
  feedbacks: {
    value: number;
    sender_type: 'mentor' | 'self' | 'other';
  }[];
  overall: number | null;
  mentor_value: number | null;
  self_value: number | null;
};

function FeedbackContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const sessionId = searchParams.get('sessionId');
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(sessionId);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Carica il current user se necessario
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const supabase = createClientComponentClient<Database>();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        if (!user) throw new Error('Utente non autenticato');

        console.log('Current user caricato:', user.id);
        setCurrentUserId(user.id);
        
        // Se abbiamo solo sessionId o manca userId, recuperiamo le info necessarie
        if (sessionId && (!userId || userId === 'null')) {
          // Ottieni il nome dell'utente corrente
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          // Redirect con tutti i parametri necessari
          const newUrl = `/session_results/feedback?userId=${user.id}&userName=${encodeURIComponent(userData?.name || '')}&sessionId=${sessionId}`;
          window.location.href = newUrl;
          return;
        }
        
        // Se non c'è né userId né sessionId, redirect con i parametri base
        if (!userId || userId === 'null') {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          const newUrl = `/session_results/feedback?userId=${user.id}&userName=${encodeURIComponent(userData?.name || '')}`;
          window.location.href = newUrl;
          return;
        }
      } catch (err) {
        console.error('Errore nel recupero dell\'utente:', err);
        setError('Errore nel recupero dell\'utente');
      } finally {
        setIsInitializing(false);
      }
    };

    loadCurrentUser();
  }, [userId, sessionId]);

  // Determina il backUrl in base alla presenza dell'userId e se è l'utente corrente
  const backUrl = userId === currentUserId || !userId || userId === 'null'
    ? '/session_results'  // Se è l'utente corrente o non c'è userId, torna alla pagina principale
    : `/session_results?userId=${userId}&userName=${encodeURIComponent(userName || '')}`; // Se è un altro utente, mantieni i parametri

  // Carica le sessioni disponibili
  useEffect(() => {
    const loadSessions = async () => {
      if (!userId || userId === 'null' || isInitializing) {
        console.log('In attesa di userId o inizializzazione');
        return;
      }

      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();
        
        console.log('Caricamento sessioni per userId:', userId);
        
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('user_sessions')
          .select(`
            sessions (
              id,
              created_at,
              status
            ),
            val_gap
          `)
          .eq('user_id', userId)
          .eq('sessions.status', 'Conclusa');

        if (sessionsError) throw sessionsError;

        const formattedSessions = sessionsData
          .filter(s => s.sessions && s.sessions.created_at)
          .map(s => {
            if (!s.sessions?.created_at) return null;
            return {
              id: s.sessions.id,
              created_at: s.sessions.created_at,
              val_gap: s.val_gap
            };
          })
          .filter((s): s is Session => s !== null)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        console.log('Sessioni formattate:', formattedSessions);
        setSessions(formattedSessions);
        
        // Se non c'è una sessione selezionata, seleziona la prima
        if (!selectedSession && formattedSessions.length > 0) {
          setSelectedSession(formattedSessions[0].id);
        }
      } catch (err) {
        console.error('Errore nel caricamento delle sessioni:', err);
        setError('Errore nel caricamento delle sessioni');
      } finally {
        setLoading(false);
      }
    };

    if (!isInitializing) {
      loadSessions();
    }
  }, [userId, isInitializing, selectedSession]);

  // Carica i feedback quando viene selezionata una sessione
  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!selectedSession) {
        console.log('Nessuna sessione selezionata');
        return;
      }
      
      const targetUserId = userId || currentUserId;
      if (!targetUserId) {
        console.log('Nessun userId disponibile per caricare i feedback');
        return;
      }

      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();

        const { data: feedbacksData, error: feedbacksError } = await supabase
          .from('feedbacks')
          .select(`
            id,
            value,
            sender,
            question:questions!inner (
              id,
              type,
              description
            ),
            users!feedbacks_sender_fkey (
              id,
              mentor
            )
          `)
          .eq('session_id', selectedSession)
          .eq('receiver', targetUserId)
          .gt('value', 0);

        if (feedbacksError) {
          console.error('Errore specifico:', feedbacksError);
          throw new Error(feedbacksError.message);
        }

        if (!feedbacksData) {
          throw new Error('Nessun dato ricevuto');
        }

        // Raggruppa i feedback per domanda
        const feedbacksByQuestion = feedbacksData.reduce((acc: Record<string, FeedbackData>, curr) => {
          if (!curr.question) return acc;
          
          const questionId = curr.question.id;
          if (!acc[questionId]) {
            acc[questionId] = {
              question_id: questionId,
              question_type: curr.question.type,
              question_description: curr.question.description,
              feedbacks: [],
              overall: null,
              mentor_value: null,
              self_value: null
            };
          }

          // Determina il tipo di sender
          let sender_type: 'mentor' | 'self' | 'other' = 'other';
          if (curr.users?.mentor) {
            sender_type = 'mentor';
          } else if (curr.sender === targetUserId) {
            sender_type = 'self';
          }

          acc[questionId].feedbacks.push({
            value: curr.value || 0,
            sender_type
          });

          return acc;
        }, {});

        // Calcola le medie e i valori specifici
        const processedFeedbacks = Object.values(feedbacksByQuestion).map(fb => {
          // Separa i feedback per tipo
          const selfFeedbacks = fb.feedbacks.filter(f => f.sender_type === 'self');
          const mentorFeedbacks = fb.feedbacks.filter(f => f.sender_type === 'mentor');
          const otherFeedbacks = fb.feedbacks.filter(f => f.sender_type === 'other');

          // Calcola overall (media dei feedback validi, escludendo self)
          const validFeedbacks = [...mentorFeedbacks, ...otherFeedbacks].filter(f => f.value > 0);
          const overall = validFeedbacks.length > 0
            ? validFeedbacks.reduce((sum, f) => sum + f.value, 0) / validFeedbacks.length
            : null;

          // Trova il voto del mentor
          const mentorFeedback = mentorFeedbacks[0];
          const mentor_value = mentorFeedback?.value || null;

          // Trova il self value
          const selfFeedback = selfFeedbacks[0];
          const self_value = selfFeedback?.value || null;

          return {
            ...fb,
            overall,
            mentor_value,
            self_value
          };
        });

        // Ordina i feedback per tipo (SOFT -> EXECUTION -> STRATEGY)
        const sortedFeedbacks = processedFeedbacks.sort((a, b) => {
          const typeOrder = { 'SOFT': 0, 'EXECUTION': 1, 'STRATEGY': 2 };
          return (typeOrder[a.question_type as keyof typeof typeOrder] || 0) - 
                 (typeOrder[b.question_type as keyof typeof typeOrder] || 0);
        });

        setFeedbacks(sortedFeedbacks);
        setCurrentIndex(0);
      } catch (err) {
        console.error('Errore nel caricamento dei feedback:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei feedback');
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, [selectedSession, userId, currentUserId]);

  const handleNext = () => {
    if (currentIndex < feedbacks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const currentFeedback = feedbacks[currentIndex];

  const pageTitle = userId ? (userName || 'I miei Risultati') : 'I miei Risultati';

  if (isInitializing || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={pageTitle} showBackButton={true} backUrl={backUrl} />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title={pageTitle} showBackButton={true} backUrl={backUrl} />
        <main className="container mx-auto max-w-2xl px-4 py-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={pageTitle} 
        showBackButton={true}
        backUrl={backUrl}
      />

      <main className="container mx-auto max-w-2xl px-4 py-6 pb-32 mt-[60px]">
        {/* Session Selector */}
        <div className="mb-4">
          <Select 
            value={selectedSession || ''} 
            onValueChange={(value) => setSelectedSession(value)}
          >
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-gray-900">
                  {selectedSession 
                    ? `Sessione terminata il ${formatDate(sessions.find(s => s.id === selectedSession)?.created_at || '')}`
                    : 'Seleziona sessione'
                  }
                </span>
                {selectedSession && (
                  <span className={`font-medium ${
                    sessions.find(s => s.id === selectedSession)?.val_gap != null &&
                    (sessions.find(s => s.id === selectedSession)?.val_gap || 0) >= 0
                      ? 'text-emerald-500' 
                      : 'text-red-500'
                  }`}>
                    GAP: {(() => {
                      const session = sessions.find(s => s.id === selectedSession);
                      if (!session?.val_gap) return 'N/A';
                      const sign = session.val_gap >= 0 ? '+' : '';
                      return `${sign}${(session.val_gap * 100).toFixed(0)}%`;
                    })()}
                  </span>
                )}
              </div>
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  <div className="flex justify-between items-center w-full pr-4">
                    <span>Sessione terminata il {formatDate(session.created_at)}</span>
                    <span className={`font-medium ${
                      session.val_gap != null && session.val_gap >= 0
                        ? 'text-emerald-500' 
                        : 'text-red-500'
                    }`}>
                      GAP: {session.val_gap != null 
                        ? `${session.val_gap >= 0 ? '+' : ''}${(session.val_gap * 100).toFixed(0)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skill Type */}
        {currentFeedback && (
          <div className="mb-6">
            <Select value={currentFeedback.question_type} onValueChange={() => {}}>
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
                <span className="text-gray-900">{currentFeedback.question_type} Skills</span>
              </SelectTrigger>
            </Select>
          </div>
        )}

        {/* Feedback Content */}
        {currentFeedback && (
          <div className="bg-white rounded-[20px] p-6 mb-4">
            {/* Question and Rating */}
            <div className="mb-8">
              <p className="text-lg mb-6">{currentFeedback.question_description}</p>
              <div className="flex justify-center gap-4 px-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex flex-col items-center">
                    <div className={`w-12 h-12 ${
                      currentFeedback.overall && star <= currentFeedback.overall 
                        ? 'text-yellow-400' 
                        : 'text-gray-200'
                    }`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="flex justify-between items-center py-4 px-2">
              <div className="flex gap-8">
                <span className="text-lg font-semibold">
                  Overall: {currentFeedback.overall ? currentFeedback.overall.toFixed(1) : 'N/A'}
                </span>
                <span className="text-lg">
                  Mentor: {currentFeedback.mentor_value ? currentFeedback.mentor_value.toFixed(1) : 'N/A'}
                </span>
                <span className="text-lg">
                  Self: {currentFeedback.self_value ? currentFeedback.self_value.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Comments Link */}
            <div 
              className="mt-6 flex justify-between items-center cursor-pointer hover:opacity-80"
              onClick={() => window.location.href = `/session_results/comment?skill=${currentFeedback.question_type}&questionId=${currentFeedback.question_id}`}
            >
              <h3 className="text-lg font-semibold">
                Hai ricevuto {currentFeedback.feedbacks.length} commenti, guardali qui:
              </h3>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentFeedback && (
          <div>
            <div className="text-left text-gray-600 mb-4">
              Domanda {currentIndex + 1} di {feedbacks.length}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                disabled={currentIndex === 0}
              >
                <svg 
                  className="w-6 h-6 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                INDIETRO
              </button>
              <button 
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-full text-lg font-medium transition-colors bg-[#4285F4] text-white hover:bg-[#3367D6] flex items-center justify-center"
                disabled={currentIndex === feedbacks.length - 1}
              >
                AVANTI
                <svg 
                  className="w-6 h-6 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header backUrl="/session_results" title="Feedback" />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Caricamento...</div>}>
        <FeedbackContent />
      </Suspense>
      <BottomNav />
    </div>
  );
} 