"use client";

import { useState, Suspense, useEffect } from "react";
import type { MouseEvent } from "react";
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
import { Star, UserCircle2, Target, Users, MessageSquare, ChevronLeft } from "lucide-react";

type UserSession = Database["public"]["Tables"]["user_sessions"]["Row"] & {
  sessions: Database["public"]["Tables"]["sessions"]["Row"];
};

type BaseFeedback = Database["public"]["Tables"]["feedbacks"]["Row"];

type FeedbackQuestion = {
  id: string;
  description: string;
  type: string;
} | null;

type Feedback = BaseFeedback & {
  question: FeedbackQuestion;
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const supabase = createClientComponentClient<Database>();

  // Recupera l'userId dall'URL o dalla sessione
  useEffect(() => {
    let isMounted = true;

    async function getUserId() {
      if (urlUserId && isMounted) {
        console.log("Using URL userId:", urlUserId);
        setUserId(urlUserId);
        return;
      }

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (authError) {
          console.error("Auth error:", authError);
          setError("Errore di autenticazione");
          setIsLoading(false);
          return;
        }

        if (!user) {
          console.error("No authenticated user found");
          setError("Utente non autenticato");
          setIsLoading(false);
          return;
        }

        console.log("Auth user found:", user.id);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        if (!isMounted) return;

        if (userError) {
          console.error("User fetch error:", userError);
          setError("Errore nel recupero dati utente");
          setIsLoading(false);
          return;
        }

        if (!userData) {
          console.error("No user data found");
          setError("Utente non trovato nel database");
          setIsLoading(false);
          return;
        }

        console.log("User data found:", userData);
        setUserId(userData.id);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error in getUserId:", err);
        setError("Errore nel recupero dell'utente");
        setIsLoading(false);
      }
    }

    getUserId();

    return () => {
      isMounted = false;
    };
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

  useEffect(() => {
    async function fetchFeedbacks() {
      if (!userId || !selectedSession) return;

      try {
        const { data, error } = await supabase
          .from("feedbacks")
          .select(
            `
            *,
            question:question_id (
              id,
              description,
              type
            )
          `
          )
          .eq("session_id", selectedSession)
          .eq("receiver", userId);

        if (error) throw error;

        setFeedbacks(data as Feedback[]);
      } catch (err) {
        console.error("Errore durante il caricamento dei feedback:", err);
      }
    }

    fetchFeedbacks();
  }, [userId, selectedSession, supabase]);

  const currentSession = sessions.find((s) => s.session_id === selectedSession);

  const handleViewDetails = (
    skill?: string | MouseEvent<HTMLButtonElement>
  ) => {
    if (skill instanceof MouseEvent) {
      // Se non c'è skill, usa quella di default
      skill = "Strategy Skills";
    }

    const queryParams = new URLSearchParams();
    if (userId) {
      queryParams.set("userId", userId);
      // Se c'è userName lo passiamo, altrimenti no
      if (userName) {
        queryParams.set("userName", userName);
      }
    }
    if (selectedSession) {
      queryParams.set("sessionId", selectedSession);
    }
    if (typeof skill === "string") {
      queryParams.set("skill", skill);
    }

    console.log("Navigating to feedback with params:", queryParams.toString());
    window.location.href = `/session_results/feedback?${queryParams.toString()}`;
  };

  const handleViewComments = () => {
    const queryParams = new URLSearchParams();
    if (userId && userName) {
      queryParams.set("userId", userId);
      queryParams.set("userName", userName);
    }
    if (selectedSession) {
      queryParams.set("sessionId", selectedSession);
    }
    window.location.href = `/session_results/comment${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
  };

  const getQuestionsCountByType = (feedbacks: Feedback[], type: string) => {
    if (!feedbacks) return 0;
    return feedbacks.filter((feedback) => feedback.question?.type === type)
      .length;
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center text-xl mb-6">Non ci sono ancora risultati</div>
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-full text-lg"
          onClick={() => window.location.href = "/"}
        >
          Torna alla home
        </Button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center text-xl mb-6">Non ci sono ancora risultati</div>
        <Button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-full text-lg"
          onClick={() => window.location.href = "/"}
        >
          Torna alla home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={userName ? userName : "I miei Risultati"} />

      <div className="absolute top-20 left-4 md:left-8">
        <button
          onClick={() => {
            // Se è presente un userName (stiamo visualizzando un altro utente), vai a /people
            // Altrimenti vai alla home
            window.location.href = userName ? "/people" : "/";
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Indietro"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>

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
          {(() => {
            // Crea un array delle skills con il loro peso
            const skillsData = [
              {
                type: "Strategy Skills",
                weight: currentSession.weight_strategy || 0,
                value: currentSession.val_strategy?.toFixed(1),
                bgColor: "bg-white",
                hoverColor: "",
                textColor: "text-[#00BFA5]",
                badgeColor: "bg-[#00BFA5]",
                questionType: "STRATEGY",
                feedbackCount: getQuestionsCountByType(feedbacks, "STRATEGY")
              },
              {
                type: "Soft Skills",
                weight: currentSession.weight_soft || 0,
                value: currentSession.val_soft?.toFixed(1),
                bgColor: "bg-[#FFF8F0]",
                hoverColor: "",
                textColor: "text-[#F5A623]",
                badgeColor: "bg-[#F5A623]",
                questionType: "SOFT",
                feedbackCount: getQuestionsCountByType(feedbacks, "SOFT")
              },
              {
                type: "Execution Skills",
                weight: currentSession.weight_execution || 0,
                value: currentSession.val_execution?.toFixed(1),
                bgColor: "bg-white",
                hoverColor: "",
                textColor: "text-[#4285F4]",
                badgeColor: "bg-[#4285F4]",
                questionType: "EXECUTION",
                feedbackCount: getQuestionsCountByType(feedbacks, "EXECUTION")
              }
            ];
            
            // Ordina l'array in base al peso (decrescente)
            const sortedSkills = skillsData.sort((a, b) => b.weight - a.weight);
            
            // Renderizza le cards in base all'ordine 
            return sortedSkills.map((skill) => (
              <div
                key={skill.type}
                className={`${skill.bgColor} rounded-[20px] p-6 ${skill.hoverColor} transition-colors`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{skill.type}</h2>
                  <span className={`${skill.badgeColor} text-white text-xl font-bold px-4 py-1 rounded-full`}>
                    {skill.value}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className={skill.textColor}>
                    Peso: {skill.weight}%
                  </p>
                  <p className={skill.textColor}>
                    {skill.feedbackCount} feedback ricevuti
                  </p>
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-4">
          <Button
            className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white py-6 rounded-full text-lg"
            onClick={handleViewDetails}
          >
            Vedi Dettaglio
          </Button>
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-full text-lg flex items-center justify-center gap-2"
            onClick={handleViewComments}
          >
            <MessageSquare className="w-5 h-5" />
            Vedi Commenti
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
