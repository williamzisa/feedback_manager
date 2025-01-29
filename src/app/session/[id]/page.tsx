"use client";

import React, { useEffect, useState } from "react";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { useRouter } from "next/navigation";
import { queries } from "@/lib/supabase/queries";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";

type Person = {
  id: string;
  name: string;
  remainingAnswers: number;
};

type SessionData = Database['public']['Tables']['sessions']['Row'];

type FeedbackData = {
  id: string;
  value: number | null;
  receiver: string | null;
  users: {
    id: string;
    name: string;
    surname: string;
  } | null;
};

interface SessionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const router = useRouter();
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<{
    total: number;
    completed: number;
  }>({ total: 0, completed: 0 });
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();
        
        // 1. Otteniamo l'utente corrente
        const currentUser = await queries.users.getCurrentUser();
        
        // 2. Otteniamo i dati della sessione
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', id)
          .single();
          
        if (sessionError) throw sessionError;
        setSession(sessionData);

        // 3. Otteniamo i feedback dove sono sender
        const { data: feedbacks, error: feedbackError } = await supabase
          .from('feedbacks')
          .select(`
            id,
            value,
            receiver,
            users!feedbacks_receiver_fkey (
              id,
              name,
              surname
            )
          `)
          .eq('session_id', id)
          .eq('sender', currentUser.id);

        if (feedbackError) throw feedbackError;

        // Calcolo statistiche feedback
        const total = feedbacks?.length || 0;
        const completed = feedbacks?.filter((f: FeedbackData) => f.value !== null).length || 0;
        setFeedbackStats({ total, completed });

        // Preparo la lista delle persone
        const peopleMap = new Map<string, { name: string; remaining: number }>();
        feedbacks?.forEach((feedback: FeedbackData) => {
          if (feedback.users) {
            const personId = feedback.users.id;
            const fullName = `${feedback.users.name} ${feedback.users.surname}`;
            const isCompleted = feedback.value !== null;

            if (!peopleMap.has(personId)) {
              peopleMap.set(personId, { 
                name: fullName, 
                remaining: isCompleted ? 0 : 1 
              });
            } else {
              const current = peopleMap.get(personId)!;
              if (!isCompleted) {
                current.remaining += 1;
              }
            }
          }
        });

        const peopleList = Array.from(peopleMap.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          remainingAnswers: data.remaining
        }));

        setPeople(peopleList);

      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [id]);

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data non impostata';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Sessione di valutazione" />
        <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32">
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
        <Header title="Sessione di valutazione" />
        <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Errore!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const progressPercentage = feedbackStats.total > 0 
    ? Math.round((feedbackStats.completed / feedbackStats.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Sessione di valutazione" />
      <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32 mt-[60px]">
        {/* Session Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Sessione iniziata il {formatDate(session?.start_time)}
          </h2>
          <p className="text-xl text-gray-700">
            Data termine: {formatDate(session?.end_time)}
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-[20px] p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Feedback completati</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold">{feedbackStats.completed}</span>
            <span className="text-xl text-gray-600">/{feedbackStats.total}</span>
          </div>
          <div className="relative h-2 bg-[#E5F8F6] rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-[#00BFA5] rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-right text-gray-600">{progressPercentage}%</div>
        </div>

        {/* People List */}
        <div className="space-y-4">
          {people.map((person) => (
            <div key={person.id} className="bg-white rounded-[20px] p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold mb-1">{person.name}</h4>
                  <p className="text-red-500">
                    {person.remainingAnswers} risposte rimanenti
                  </p>
                </div>
                <button
                  className="bg-[#4285F4] text-white px-6 py-2 rounded-full text-lg font-medium hover:bg-[#3367D6] transition-colors"
                  onClick={() =>
                    router.push(
                      `/session/${id}/evaluate?person=${encodeURIComponent(person.id)}`
                    )
                  }
                >
                  Valuta
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
