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
  isSelf: boolean;
};

type SessionData = Database['public']['Tables']['sessions']['Row'];

type FeedbackData = {
  id: string;
  value: number | null;
  receiver: string | null;
  sender: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
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
        const currentUserId = currentUser.id;
        
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
            sender,
            users!feedbacks_receiver_fkey (
              id,
              name,
              surname
            )
          `)
          .eq('session_id', id)
          .eq('sender', currentUserId);

        if (feedbackError) throw feedbackError;
        
        // Calcolo statistiche feedback
        const total = feedbacks?.length || 0;
        const completed = feedbacks?.filter((f: FeedbackData) => f.value !== null).length || 0;
        setFeedbackStats({ total, completed });

        // Preparo la lista delle persone
        const peopleMap = new Map<string, { name: string; remaining: number; isSelf: boolean }>();
        
        feedbacks?.forEach((feedback: FeedbackData) => {
          if (feedback.users) {
            const personId = feedback.users.id;
            const fullName = `${feedback.users.name} ${feedback.users.surname}`;
            const isCompleted = feedback.value !== null;
            
            // Identificazione dell'utente corrente in modo diretto
            // L'utente stesso è quando l'ID del ricevente è uguale all'ID dell'utente corrente
            const isSelf = feedback.receiver === currentUserId;

            if (!peopleMap.has(personId)) {
              peopleMap.set(personId, { 
                name: fullName, 
                remaining: isCompleted ? 0 : 1,
                isSelf: isSelf
              });
            } else {
              const current = peopleMap.get(personId)!;
              if (!isCompleted) {
                current.remaining += 1;
              }
              if (isSelf) {
                current.isSelf = true;
              }
            }
          }
        });

        const peopleList = Array.from(peopleMap.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          remainingAnswers: data.remaining,
          isSelf: data.isSelf
        }));
        
        // Ordiniamo le persone in base al numero di risposte rimanenti (decrescente)
        peopleList.sort((a, b) => b.remainingAnswers - a.remainingAnswers);

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

  const calculateEstimatedMinutes = (remainingAnswers: number): number => {
    return remainingAnswers / 2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Sessione 360" />
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
        <Header title="Sessione 360" />
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
      <Header title="Sessione 360" />

      <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32">
        {/* Session Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Data inizio {formatDate(session?.start_time)}
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

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Cerca una persona..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
          />
          <a 
            href="https://riskhub.notion.site/Perch-trovo-loro-nel-mio-360-1f2da54d973c80509e0df1f85f088d6f?pvs=4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-[#4285F4] hover:underline"
          >
            Perché trovo loro?
          </a>
        </div>

        {/* People List */}
        <div className="space-y-4">
          {people
            .filter(person => 
              person.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((person) => {
              // Determiniamo in modo esplicito le classi CSS da applicare
              const cardClassName = person.isSelf
                ? "rounded-[20px] p-6 bg-[#4285F4]/15"
                : "bg-white rounded-[20px] p-6";
                
              return (
                <div key={person.id} className={cardClassName}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xl font-bold mb-1">{person.name}</h4>
                      <p className={person.remainingAnswers === 0 ? "text-green-500" : "text-red-500"}>
                        {person.remainingAnswers} risposte rimanenti
                      </p>
                      {person.remainingAnswers > 0 && (
                        <p className="text-gray-500 text-sm">
                          ({calculateEstimatedMinutes(person.remainingAnswers)} minuti stimati)
                        </p>
                      )}
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
              );
            })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
