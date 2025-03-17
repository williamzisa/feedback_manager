'use client';

import { useState, useEffect, useCallback } from 'react';
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
  feedbacks: Array<{
    value: number | null;
    comment: string | null;
    sender: string | null;
  }>;
  overall: number | null;
  mentor_value: number | null;
  self_value: number | null;
  comment_count: number;
  feedback_count: number;
};

type Initiative = {
  id: string;
  description: string | null;
  created_at: string;
  question_id: string | null;
  session_id: string | null;
  type: string | null;
  user_id: string | null;
  user: {
    name: string;
    surname: string;
  } | null;
};

export function useFeedback(initialUserId: string | null, initialSessionId: string | null) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(initialSessionId);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);

  // Carica il current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const supabase = createClientComponentClient<Database>();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        if (!user) throw new Error('Utente non autenticato');

        setCurrentUserId(user.id);
      } catch (err) {
        console.error('Errore nel recupero dell\'utente:', err);
        setError('Errore nel recupero dell\'utente');
      } finally {
        setIsInitializing(false);
      }
    };

    loadCurrentUser();
  }, []);

  // Carica le sessioni
  useEffect(() => {
    const loadSessions = async () => {
      if (!initialUserId || initialUserId === 'null' || isInitializing) {
        return;
      }

      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();
        
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
          .eq('user_id', initialUserId)
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

        setSessions(formattedSessions);
        
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
  }, [initialUserId, isInitializing, selectedSession]);

  // Carica i feedback (memoizzato)
  const loadFeedbacks = useCallback(async (sessionId: string, userId: string) => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient<Database>();

      const { data: feedbacksData, error: feedbacksError } = await supabase
        .from('feedbacks')
        .select(`
          id,
          value,
          comment,
          sender,
          receiver,
          question:questions!inner (
            id,
            type,
            description
          ),
          sender_user:users!feedbacks_sender_fkey (
            id,
            name,
            surname,
            mentor
          )
        `)
        .eq('session_id', sessionId)
        .eq('receiver', userId);

      if (feedbacksError) throw feedbacksError;

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
            self_value: null,
            comment_count: 0,
            feedback_count: 0
          };
        }

        acc[questionId].feedbacks.push({
          value: curr.value,
          comment: curr.comment,
          sender: curr.sender
        });

        if (curr.comment && curr.comment.trim() !== '') {
          acc[questionId].comment_count++;
        }

        return acc;
      }, {});

      const processedFeedbacks = Object.values(feedbacksByQuestion).map(fb => {
        const selfFeedbacks = fb.feedbacks.filter(f => f.sender === userId);
        const mentorFeedbacks = fb.feedbacks.filter(f => f.sender && feedbacksData.some(fd => 
          fd.sender_user?.mentor === f.sender
        ));
        const otherFeedbacks = fb.feedbacks.filter(f => 
          f.sender !== userId && 
          !feedbacksData.some(fd => fd.sender_user?.mentor === f.sender)
        );

        const validFeedbacks = [...mentorFeedbacks, ...otherFeedbacks].filter(f => f.value && f.value > 0);
        const overall = validFeedbacks.length > 0
          ? validFeedbacks.reduce((sum, f) => sum + (f.value || 0), 0) / validFeedbacks.length
          : null;

        const mentorFeedback = mentorFeedbacks[0];
        const mentor_value = mentorFeedback?.value || null;

        const selfFeedback = selfFeedbacks[0];
        const self_value = selfFeedback?.value || null;

        return {
          ...fb,
          overall,
          mentor_value,
          self_value,
          feedback_count: validFeedbacks.length
        };
      });

      const sortedFeedbacks = processedFeedbacks.sort((a, b) => {
        const typeOrder = { 'SOFT': 0, 'EXECUTION': 1, 'STRATEGY': 2 };
        return (typeOrder[a.question_type as keyof typeof typeOrder] || 0) - 
               (typeOrder[b.question_type as keyof typeof typeOrder] || 0);
      });

      setFeedbacks(sortedFeedbacks);
      return sortedFeedbacks;
    } catch (err) {
      console.error('Errore nel caricamento dei feedback:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei feedback');
      return [];
    } finally {
      setLoading(false);
    }
  }, []); // Nessuna dipendenza perché usa solo parametri della funzione

  // Carica le iniziative (memoizzato)
  const loadInitiatives = useCallback(async (sessionId: string, questionId: string, userId: string) => {
    try {
      const supabase = createClientComponentClient<Database>();
      
      const { data: initiatives, error: initiativesError } = await supabase
        .from('initiatives')
        .select(`
          id,
          description,
          created_at,
          question_id,
          session_id,
          type,
          user_id,
          user:users (
            name,
            surname
          )
        `)
        .eq('session_id', sessionId)
        .eq('question_id', questionId)
        .eq('user_id', userId);

      if (initiativesError) throw initiativesError;
      
      setInitiatives(initiatives || []);
      return initiatives;
    } catch (err) {
      console.error('Errore nel caricamento delle iniziative:', err);
      setInitiatives([]);
      return [];
    }
  }, []); // Nessuna dipendenza perché usa solo parametri della funzione

  return {
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
    setInitiatives,
    loadFeedbacks,
    loadInitiatives
  };
} 