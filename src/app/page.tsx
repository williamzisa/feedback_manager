"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { queries } from "@/lib/supabase/queries";
import { Session } from "@/lib/types/sessions";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [menteeCount, setMenteeCount] = useState(0);
  const [userSessionsCount, setUserSessionsCount] = useState(0);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Ottieni l'utente corrente
        const currentUser = await queries.users.getCurrentUser();

        // Carica le sessioni
        const userSessions = await queries.sessions.getUserSessions(currentUser.id);
        setSessions(userSessions);

        // Conta le user_sessions dell'utente
        const { count } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);
        
        setUserSessionsCount(count || 0);

        // Conta i mentee
        const { data: mentees } = await supabase
          .from('users')
          .select('id')
          .eq('mentor', currentUser.id)
          .eq('status', 'active');
        
        setMenteeCount(mentees?.length || 0);
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
      }
    };

    loadData();
  }, [supabase]);

  const getSessionsSubtitle = () => {
    const activeCount = sessions.filter(s => s.status === 'In corso').length;
    const completedCount = sessions.filter(s => s.status === 'Conclusa').length;
    return `${activeCount} sessione in corso, ${completedCount} sessioni concluse`;
  };

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
          <p className="text-blue-500 mb-4">{userSessionsCount} risultati disponibili</p>
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
