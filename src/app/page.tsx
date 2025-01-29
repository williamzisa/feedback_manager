"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { queries } from "@/lib/supabase/queries";
import { Session } from "@/lib/types/sessions";

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [menteeCount, setMenteeCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await queries.users.getCurrentUser();
        
        // Carica sessioni
        const userSessions = await queries.sessions.getUserSessions(currentUser.id);
        setSessions(userSessions);

        // Carica conteggio mentee
        const { data: mentees } = await queries.users.getMentees(currentUser.id);
        setMenteeCount(mentees?.length || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento dei dati');
        console.error('Errore nel caricamento dei dati:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const activeSessionsCount = sessions.filter(s => s.status === 'In corso').length;
  const completedSessionsCount = sessions.filter(s => s.status === 'Conclusa').length;

  const getSessionsSubtitle = () => {
    const activePart = activeSessionsCount === 1 ? '1 sessione in corso' : `${activeSessionsCount} sessioni in corso`;
    const completedPart = completedSessionsCount === 1 ? '1 sessione conclusa' : `${completedSessionsCount} sessioni concluse`;
    return `${activePart}, ${completedPart}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Home" />
        <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Home" />
        <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32">
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
      <Header title="Home" />

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-4 pb-32 sm:py-6 sm:pb-32 space-y-6">
        {/* Le Sessioni */}
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <h2 className="text-[24px] font-bold text-gray-900 mb-2">Le Sessioni</h2>
          <p className="text-blue-500 mb-4">{getSessionsSubtitle()}</p>
          <Link 
            href="/session"
            className="inline-block px-6 py-2 bg-orange-400 text-white text-sm font-medium rounded-full hover:bg-orange-500 transition-colors"
          >
            VAI
          </Link>
        </div>

        {/* I miei Risultati */}
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <h2 className="text-[24px] font-bold text-gray-900 mb-2">I miei Risultati</h2>
          <p className="text-blue-500 mb-4">3 risultati disponibili</p>
          <Link 
            href="/session_results"
            className="inline-block px-6 py-2 bg-emerald-500 text-white text-sm font-medium rounded-full hover:bg-emerald-600 transition-colors"
          >
            I miei Risultati
          </Link>
        </div>

        {/* Le mie Persone */}
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <h2 className="text-[24px] font-bold text-gray-900 mb-2">Le mie Persone</h2>
          <p className="text-blue-500 mb-4">
            {menteeCount === 1 ? '1 persona ha' : `${menteeCount} persone hanno`} me come Mentor
          </p>
          <Link 
            href="/people"
            className="inline-block px-6 py-2 bg-emerald-500 text-white text-sm font-medium rounded-full hover:bg-emerald-600 transition-colors"
          >
            VAI
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
