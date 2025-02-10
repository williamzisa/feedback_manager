'use client';

import { useEffect, useState } from "react";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { queries } from "@/lib/supabase/queries";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from "@/lib/supabase/database.types";

type MenteeUser = {
  id: string;
  name: string;
  surname: string;
  lastSession: {
    val_overall: number | null;
    val_gap: number | null;
    level_standard: number | null;
    created_at: string | null;
  } | null;
};

export default function PeoplePage() {
  const [mentees, setMentees] = useState<MenteeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadMentees = async () => {
      try {
        const supabase = createClientComponentClient<Database>();
        const currentUser = await queries.users.getCurrentUser();
        
        // Recupera tutti i mentee con le loro ultime user_sessions
        const { data: menteesData, error: menteesError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            surname,
            user_sessions (
              val_overall,
              val_gap,
              level_standard,
              created_at,
              sessions!inner (
                status
              )
            )
          `)
          .eq('mentor', currentUser.id)
          .eq('status', 'active')
          .eq('user_sessions.sessions.status', 'Conclusa')
          .order('name');

        if (menteesError) throw menteesError;

        // Formatta i dati e trova l'ultima sessione per ogni mentee
        const formattedMentees: MenteeUser[] = (menteesData?.map(mentee => {
          const sessions = mentee.user_sessions || [];
          // Ordina le sessioni per data e prendi la più recente
          const lastSession = sessions.length > 0 
            ? sessions.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
              })[0]
            : null;

          return {
            id: mentee.id,
            name: mentee.name,
            surname: mentee.surname,
            lastSession: lastSession ? {
              val_overall: lastSession.val_overall,
              val_gap: lastSession.val_gap,
              level_standard: lastSession.level_standard,
              created_at: lastSession.created_at
            } : null
          };
        }) || [])
        // Ordina per GAP decrescente
        .sort((a, b) => {
          const gapA = a.lastSession?.val_gap ?? -Infinity;
          const gapB = b.lastSession?.val_gap ?? -Infinity;
          return gapB - gapA;
        });

        setMentees(formattedMentees);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle persone');
        console.error('Errore nel caricamento delle persone:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMentees();
  }, []);

  const filteredMentees = mentees.filter(mentee => 
    `${mentee.name} ${mentee.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Le mie Persone" />
        <main className="container mx-auto max-w-2xl px-4 py-8">
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
        <Header title="Le mie Persone" />
        <main className="container mx-auto max-w-2xl px-4 py-8">
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
      <Header title="Le mie Persone" />

      <div className="pt-[76px]"> {/* 60px per l'header + 16px di margine visivo */}
        {/* Search Bar */}
        <div className="bg-white border-b">
          <div className="container mx-auto max-w-2xl px-4">
            <div className="relative py-4">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Cerca"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* People List */}
        <main className="container mx-auto max-w-2xl px-4 py-4 pb-24">
          <div className="space-y-3">
            {filteredMentees.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Nessuna persona trovata
              </div>
            ) : (
              filteredMentees.map((mentee) => (
                <div key={mentee.id} className="bg-white rounded-[20px] p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[20px] font-bold text-gray-900 mb-2">
                        {mentee.name} {mentee.surname}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Last Overall: {mentee.lastSession?.val_overall?.toFixed(1) || 'N/A'}</p>
                        <p>Standard: {mentee.lastSession?.level_standard?.toFixed(1) || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium mb-2 ${
                        mentee.lastSession?.val_gap != null 
                          ? (mentee.lastSession.val_gap >= 0 ? 'text-emerald-500' : 'text-red-500') 
                          : 'text-gray-400'
                      }`}>
                        Last GAP: {
                          mentee.lastSession?.val_gap != null 
                            ? `${mentee.lastSession.val_gap >= 0 ? '+' : ''}${(mentee.lastSession.val_gap * 100).toFixed(1)}%` 
                            : 'Nessun valore'
                        }
                      </p>
                      <button 
                        onClick={() => window.location.href = `/session_results?userId=${mentee.id}&userName=${encodeURIComponent(mentee.name)}`}
                        className="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors"
                      >
                        Vedi Sessioni
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
} 