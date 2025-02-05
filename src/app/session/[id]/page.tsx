"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/navigation/header";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";
import { queries } from "@/lib/supabase/queries";

type Person = {
  id: string;
  name: string;
  remainingAnswers: number;
  totalAnswers: number;
};

type SessionInfo = {
  name: string;
  startDate: string | null;
  endDate: string | null;
  totalFeedbacks: number;
  completedFeedbacks: number;
};

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const [people, setPeople] = useState<Person[]>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient<Database>();
        const currentUser = await queries.users.getCurrentUser();

        // Carica i dati della sessione
        const { data: sessionData } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        // Carica tutti i feedback della sessione
        const { data: feedbacks } = await supabase
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
          .eq('session_id', sessionId)
          .eq('sender', currentUser.id);

        if (feedbacks) {
          // Raggruppa i feedback per utente
          const userFeedbacks = new Map<string, { total: number; remaining: number; name: string }>();
          
          feedbacks.forEach(feedback => {
            if (feedback.users) {
              const userId = feedback.users.id;
              const userName = `${feedback.users.name} ${feedback.users.surname}`;
              
              if (!userFeedbacks.has(userId)) {
                userFeedbacks.set(userId, {
                  total: 0,
                  remaining: 0,
                  name: userName
                });
              }
              
              const userStats = userFeedbacks.get(userId)!;
              userStats.total++;
              if (feedback.value === null) {
                userStats.remaining++;
              }
            }
          });

          // Converti la Map in array di Person
          const peopleList = Array.from(userFeedbacks.entries()).map(([id, stats]) => ({
            id,
            name: stats.name,
            remainingAnswers: stats.remaining,
            totalAnswers: stats.total
          }));

          setPeople(peopleList);

          // Calcola le statistiche della sessione
          const totalFeedbacks = feedbacks.length;
          const completedFeedbacks = feedbacks.filter(f => f.value !== null).length;

          setSessionInfo({
            name: sessionData?.name || 'Sessione',
            startDate: sessionData?.start_time || null,
            endDate: sessionData?.end_time || null,
            totalFeedbacks,
            completedFeedbacks
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data non impostata';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePersonClick = (personId: string) => {
    router.push(`/session/${sessionId}/evaluate?person=${encodeURIComponent(personId)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Valutazioni" showBackButton={true} />
        <main className="container mx-auto max-w-2xl px-4 py-6 mt-[60px]">
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
        <Header title="Valutazioni" showBackButton={true} />
        <main className="container mx-auto max-w-2xl px-4 py-6 mt-[60px]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Errore!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Valutazioni" showBackButton={true} />

      <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32 mt-[60px]">
        {/* Session Info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-2">
            Sessione iniziata il {formatDate(sessionInfo?.startDate || null)}
          </h1>
          <p className="text-gray-600">
            Data termine: {formatDate(sessionInfo?.endDate || null)}
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-[20px] p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Feedback completati</h2>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold">
              {sessionInfo?.completedFeedbacks}
            </span>
            <span className="text-gray-600">/{sessionInfo?.totalFeedbacks}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{
                width: `${sessionInfo ? (sessionInfo.completedFeedbacks / sessionInfo.totalFeedbacks) * 100 : 0}%`
              }}
            />
          </div>
          <span className="text-sm text-gray-600 mt-1">
            {sessionInfo ? Math.round((sessionInfo.completedFeedbacks / sessionInfo.totalFeedbacks) * 100) : 0}%
          </span>
        </div>

        {/* People List */}
        <div className="space-y-3">
          {people.map((person) => (
            <div
              key={person.id}
              className={`bg-white rounded-[20px] p-5 cursor-pointer hover:shadow-lg transition-shadow
                ${person.remainingAnswers === 0 ? 'bg-blue-50/50 border border-blue-100' : ''}`}
              onClick={() => handlePersonClick(person.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-medium">{person.name}</span>
                  {person.remainingAnswers === 0 ? (
                    <span className="text-emerald-500 text-sm">
                      Valutazione completata
                    </span>
                  ) : (
                    <span className="text-red-500 text-sm">
                      {person.remainingAnswers} risposte rimanenti
                    </span>
                  )}
                </div>
                {person.remainingAnswers === 0 ? (
                  <button className="px-6 py-2 rounded-full text-white font-medium bg-blue-400 hover:bg-blue-500">
                    RIVEDI
                  </button>
                ) : (
                  <button className="px-6 py-2 rounded-full text-white font-medium bg-blue-500 hover:bg-blue-600">
                    VALUTA
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
