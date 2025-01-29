"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { queries } from "@/lib/supabase/queries";
import { Session } from "@/lib/types/sessions";

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const currentUser = await queries.users.getCurrentUser();
        const userSessions = await queries.sessions.getUserSessions(currentUser.id);
        setSessions(userSessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle sessioni');
        console.error('Errore nel caricamento delle sessioni:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const handleSessionClick = (session: Session) => {
    if (session.status === 'In corso') {
      router.push(`/session/${session.id}`);
    } else if (session.status === 'Conclusa') {
      router.push(`/session_results?sessionId=${session.id}`);
    }
  };

  const formatDate = (dateString: string | null) => {
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
        <Header title="Sessioni" />
        <main className="container mx-auto max-w-2xl px-4 py-6 mt-[60px]">
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
        <Header title="Sessioni" />
        <main className="container mx-auto max-w-2xl px-4 py-6 mt-[60px]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Errore!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Sessioni" />

      <main className="container mx-auto max-w-2xl px-4 py-6 mt-[60px]">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            Nessuna sessione disponibile
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-[20px] p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSessionClick(session)}
              >
                <h2 className="text-2xl font-bold mb-2">{session.name}</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">
                      Data di conclusione: {formatDate(session.end_time)}
                    </p>
                  </div>
                  <button
                    className={`px-6 py-2 rounded-full text-white font-medium
                      ${session.status === 'In corso' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  >
                    {session.status === 'In corso' ? 'VAI' : 'ANALISI'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
