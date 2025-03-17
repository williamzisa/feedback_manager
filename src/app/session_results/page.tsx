"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/supabase/database.types";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Star, UserCircle2, Target, Users } from "lucide-react";

type UserSession = Database["public"]["Tables"]["user_sessions"]["Row"] & {
  sessions: Database["public"]["Tables"]["sessions"]["Row"];
};

function SessionResultsContent() {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const userName = searchParams.get("userName");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  // Recupera l'userId dall'URL o dalla sessione
  useEffect(() => {
    async function getUserId() {
      try {
        // Se c'è un userId nell'URL, usa quello
        if (urlUserId) {
          setUserId(urlUserId);
          return;
        }

        // Altrimenti prova a recuperare l'utente dalla sessione
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.id) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("auth_id", user.id)
            .single();

          if (userError) throw userError;
          if (userData) {
            setUserId(userData.id);
          }
        } else {
          setError("Utente non autenticato");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Errore nel recupero dell'utente:", err);
        setError("Errore nel recupero dell'utente");
        setIsLoading(false);
      }
    }

    getUserId();
  }, [supabase, urlUserId]);

  useEffect(() => {
    async function fetchSessions() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("user_sessions")
          .select(
            `
            *,
            sessions (
              id,
              name,
              start_time,
              end_time,
              status,
              company,
              created_at
            )
          `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          setError("Nessuna sessione trovata per questo utente");
          setIsLoading(false);
          return;
        }

        setSessions(data as UserSession[]);
        setSelectedSession(data[0].session_id);
      } catch (err) {
        console.error("Errore durante il caricamento delle sessioni:", err);
        setError("Errore nel caricamento delle sessioni");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, [userId, supabase]);

  const currentSession = sessions.find((s) => s.session_id === selectedSession);

  const handleViewDetails = () => {
    const queryParams = new URLSearchParams();
    if (userId && userName) {
      queryParams.set("userId", userId);
      queryParams.set("userName", userName);
    }
    window.location.href = `/session_results/feedback${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Caricamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Nessuna sessione trovata</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={userName ? userName : "I miei Risultati"} />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Session Selector */}
        <div className="mb-6">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-full bg-white">
              <div className="flex justify-between items-center w-full">
                <span>
                  {currentSession.sessions.name} -{" "}
                  {format(
                    new Date(currentSession.sessions.end_time || ""),
                    "dd/MM/yy",
                    {
                      locale: it,
                    }
                  )}
                </span>
                <span className="text-yellow-600">
                  GAP: {currentSession.val_gap?.toFixed(1)}%
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.session_id} value={session.session_id}>
                  {session.sessions.name} -{" "}
                  {format(
                    new Date(session.sessions.end_time || ""),
                    "dd/MM/yy",
                    {
                      locale: it,
                    }
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Overview */}
        <div className="bg-white rounded-[20px] p-6 mb-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Colonna sinistra */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex items-baseline flex-1">
                  <span className="text-3xl font-bold">
                    {currentSession.val_overall?.toFixed(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">Overall</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <UserCircle2 className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex items-baseline flex-1">
                  <span className="text-3xl font-bold">
                    {currentSession.self_overall?.toFixed(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">Self</span>
                </div>
              </div>
            </div>

            {/* Colonna destra */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex items-baseline flex-1">
                  <span className="text-3xl font-bold">
                    {currentSession.level_standard?.toFixed(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">Standard</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex items-baseline flex-1">
                  <span className="text-3xl font-bold">
                    {currentSession.val_overall?.toFixed(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    Il mio Mentor
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Separatore */}
          <div className="my-4 border-t border-gray-100"></div>

          {/* GAP Section */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-500 font-medium">
              Risultati della Sessione
            </div>
            <div
              className={`text-2xl font-bold ${
                (currentSession.val_gap || 0) >= 0
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {currentSession.val_gap?.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {(currentSession.val_gap || 0) >= 0
                ? "In linea con lo standard"
                : "Da migliorare"}
            </div>
          </div>
        </div>

        {/* Skills Cards */}
        <div className="space-y-4">
          {/* Soft Skills */}
          <div className="bg-[#FFF8F0] rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Soft Skills</h2>
              <span className="bg-[#F5A623] text-white text-xl font-bold px-4 py-1 rounded-full">
                {currentSession.val_soft?.toFixed(1)}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[#F5A623]">
                Peso: {currentSession.weight_soft}%
              </p>
            </div>
          </div>

          {/* Strategy Skills */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Strategy Skills</h2>
              <span className="bg-[#00BFA5] text-white text-xl font-bold px-4 py-1 rounded-full">
                {currentSession.val_strategy?.toFixed(1)}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[#00BFA5]">
                Peso: {currentSession.weight_strategy}%
              </p>
            </div>
          </div>

          {/* Execution Skills */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Execution Skills</h2>
              <span className="bg-[#4285F4] text-white text-xl font-bold px-4 py-1 rounded-full">
                {currentSession.val_execution?.toFixed(1)}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[#4285F4]">
                Peso: {currentSession.weight_execution}%
              </p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-6">
          <Button
            className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white py-6 rounded-full text-lg"
            onClick={handleViewDetails}
          >
            Vedi Dettaglio
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function SessionResultsPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <SessionResultsContent />
    </Suspense>
  );
}
