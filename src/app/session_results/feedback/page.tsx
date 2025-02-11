'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import Header from "@/components/navigation/header";
import { useFeedback } from './hooks/useFeedback';
import { FeedbackCard } from './components/FeedbackCard';
import { InitiativesSection } from './components/InitiativesSection';

function FeedbackContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const sessionId = searchParams.get('sessionId');
  const typeFromUrl = searchParams.get('type')?.toUpperCase();
  const indexFromUrl = searchParams.get('index');
  
  const [selectedType, setSelectedType] = useState<string>(typeFromUrl || 'EXECUTION');
  const [initialIndex, setInitialIndex] = useState<number | null>(indexFromUrl ? parseInt(indexFromUrl) : null);
  
  const {
    sessions,
    selectedSession,
    setSelectedSession,
    feedbacks,
    currentIndex,
    setCurrentIndex,
    loading,
    error,
    currentUserId,
    isInitializing,
    initiatives,
    loadFeedbacks,
    loadInitiatives
  } = useFeedback(userId, sessionId);

  const filteredFeedbacks = feedbacks.filter(fb => fb.question_type === selectedType);
  const currentFeedback = filteredFeedbacks[currentIndex];

  // Effetto per caricare i feedback quando cambia la sessione
  useEffect(() => {
    if (selectedSession && userId) {
      loadFeedbacks(selectedSession, userId);
    }
  }, [selectedSession, userId, loadFeedbacks]);

  // Effetto per caricare le iniziative quando cambia il feedback
  useEffect(() => {
    if (selectedSession && currentFeedback && userId) {
      loadInitiatives(selectedSession, currentFeedback.question_id, userId);
    }
  }, [selectedSession, currentFeedback, userId, loadInitiatives]);

  useEffect(() => {
    if (selectedType && feedbacks.length > 0) {
      const typeFeedbacks = feedbacks.filter(fb => fb.question_type === selectedType);
      if (initialIndex !== null && initialIndex < typeFeedbacks.length) {
        setCurrentIndex(initialIndex);
        setInitialIndex(null); // Reset dopo l'uso
      } else if (currentIndex === -1) {
        setCurrentIndex(typeFeedbacks.length - 1);
      }
    }
  }, [selectedType, feedbacks, initialIndex, currentIndex, setCurrentIndex]);

  const handleNext = () => {
    if (currentIndex < filteredFeedbacks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const types = Array.from(new Set(feedbacks.map(fb => fb.question_type)));
      const currentTypeIndex = types.indexOf(selectedType);
      
      if (currentTypeIndex < types.length - 1) {
        const nextType = types[currentTypeIndex + 1];
        setSelectedType(nextType);
        setCurrentIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      const types = Array.from(new Set(feedbacks.map(fb => fb.question_type)));
      const currentTypeIndex = types.indexOf(selectedType);
      
      if (currentTypeIndex > 0) {
        const prevType = types[currentTypeIndex - 1];
        const prevTypeFeedbacks = feedbacks.filter(fb => fb.question_type === prevType);
        setSelectedType(prevType);
        setTimeout(() => {
          setCurrentIndex(prevTypeFeedbacks.length - 1);
        }, 0);
      }
    } else {
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

  const handleViewComments = () => {
    if (!sessionId || !userId || !currentFeedback) return;
    
    const queryParams = new URLSearchParams();
    queryParams.set('sessionId', sessionId);
    queryParams.set('userId', userId);
    queryParams.set('questionId', currentFeedback.question_id);
    queryParams.set('type', selectedType);
    queryParams.set('index', currentIndex.toString());
    if (userName) {
      queryParams.set('userName', userName);
    }
    window.location.href = `/session_results/comment?${queryParams.toString()}`;
  };

  const handleInitiativeSuccess = () => {
    if (!currentFeedback) return;
    loadInitiatives(selectedSession!, currentFeedback.question_id, userId!);
  };

  // Determina il backUrl in base alla presenza dell'userId e se è l'utente corrente
  const backUrl = userId === currentUserId || !userId || userId === 'null'
    ? '/session_results'
    : `/session_results?userId=${userId}&userName=${encodeURIComponent(userName || '')}`;

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
                    sessions.find(s => s.id === selectedSession)?.val_gap != null
                      ? (sessions.find(s => s.id === selectedSession)?.val_gap || 0) < -0.05
                        ? 'text-red-500'
                        : (sessions.find(s => s.id === selectedSession)?.val_gap || 0) > 0.05
                          ? 'text-emerald-500'
                          : 'text-yellow-500'
                      : ''
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
                      session.val_gap != null
                        ? session.val_gap < -0.05
                          ? 'text-red-500'
                          : session.val_gap > 0.05
                            ? 'text-emerald-500'
                            : 'text-yellow-500'
                        : ''
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

        {/* Skill Type Selector */}
        {currentFeedback && (
          <div className="mb-6">
            <Select 
              value={selectedType} 
              onValueChange={(value) => setSelectedType(value)}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
                <span className="text-gray-900">{selectedType} Skills</span>
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(feedbacks.map(fb => fb.question_type))).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type} Skills
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Feedback Content */}
        {currentFeedback && (
          <FeedbackCard
            feedback={currentFeedback}
            onViewComments={handleViewComments}
          >
            <InitiativesSection
              initiatives={initiatives}
              onInitiativeSuccess={handleInitiativeSuccess}
              sessionId={selectedSession!}
              userId={userId!}
              questionId={currentFeedback.question_id}
              questionType={currentFeedback.question_type}
            />
          </FeedbackCard>
        )}

        {/* Navigation */}
        {currentFeedback && (
          <>
            {/* Indicatore di progresso */}
            <div className="text-left text-gray-600 mb-4">
              Domanda {currentIndex + 1} di {filteredFeedbacks.length}
            </div>

            {/* Navigation Buttons - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
              <div className="container mx-auto max-w-2xl flex gap-4 px-4">
                {(currentIndex > 0 || 
                  (currentIndex === 0 && 
                    (selectedType === 'EXECUTION' || selectedType === 'STRATEGY'))
                ) && (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 py-3 px-4 rounded-full text-base sm:text-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                  >
                    <svg 
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-2" 
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
                )}
                {(currentIndex < filteredFeedbacks.length - 1 || 
                  (() => {
                    const types = Array.from(new Set(feedbacks.map(fb => fb.question_type)));
                    const currentTypeIndex = types.indexOf(selectedType);
                    return currentTypeIndex < types.length - 1;
                  })()
                ) && (
                  <button 
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 rounded-full text-base sm:text-lg font-medium transition-colors bg-[#4285F4] text-white hover:bg-[#3367D6] flex items-center justify-center"
                  >
                    AVANTI
                    <svg 
                      className="w-5 h-5 sm:w-6 sm:h-6 ml-2" 
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
                )}
              </div>
            </div>
          </>
        )}
      </main>
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
    </div>
  );
} 