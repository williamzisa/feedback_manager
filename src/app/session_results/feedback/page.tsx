"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/navigation/bottom-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import Header from "@/components/navigation/header";
import { getSessionFeedback } from "@/lib/supabase/queries";
import { Database } from "@/lib/supabase/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"] & {
  sender: { name: string; surname: string };
  receiver: { name: string; surname: string };
  question: { description: string };
};

type UserSession = Database["public"]["Tables"]["user_sessions"]["Row"];

const skillsData = {
  "Strategy Skills": {
    name: "Strategy Skills",
    color: "#00BFA5",
    weight: "weight_strategy",
    value: "val_strategy",
    self: "self_strategy",
  },
  "Execution Skills": {
    name: "Execution Skills",
    color: "#4285F4",
    weight: "weight_execution",
    value: "val_execution",
    self: "self_execution",
  },
  "Soft Skills": {
    name: "Soft Skills",
    color: "#F5A623",
    weight: "weight_soft",
    value: "val_soft",
    self: "self_soft",
  },
} as const;

type SkillKey = keyof typeof skillsData;

function FeedbackContent() {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const userName = searchParams.get("userName");
  const sessionId = searchParams.get("sessionId");
  const urlSkill = searchParams.get("skill") as SkillKey;
  const [userId, setUserId] = useState<string | null>(urlUserId);
  const [selectedSession, setSelectedSession] = useState(
    "Sessione terminata il 31/12/24"
  );
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>(
    urlSkill || "Strategy Skills"
  );
  const [feedbackData, setFeedbackData] = useState<{
    userSession: UserSession | null;
    feedbacks: Feedback[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  // Recupera l'userId se non presente nell'URL
  useEffect(() => {
    async function getUserId() {
      if (urlUserId) return; // Se c'è già un userId nell'URL, non fare nulla

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

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

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("auth_id", user.id)
          .single();

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

        console.log("Setting userId from auth:", userData.id);
        setUserId(userData.id);
      } catch (err) {
        console.error("Error in getUserId:", err);
        setError("Errore nel recupero dell'utente");
        setIsLoading(false);
      }
    }

    getUserId();
  }, [supabase, urlUserId]);

  useEffect(() => {
    async function loadFeedback() {
      if (!sessionId || !userId) {
        console.log(
          "Missing params - sessionId:",
          sessionId,
          "userId:",
          userId
        );
        return;
      }

      try {
        console.log(
          "Loading feedback for session:",
          sessionId,
          "user:",
          userId
        );
        const data = await getSessionFeedback(sessionId, userId);
        console.log("Feedback data received:", data);
        setFeedbackData(data);
      } catch (error) {
        console.error("Errore nel caricamento dei feedback:", error);
        setError("Errore nel caricamento dei feedback");
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedback();
  }, [sessionId, userId]);

  const currentSkill = skillsData[selectedSkill];
  const pageTitle = userName || "I miei Risultati";

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

  if (!feedbackData || !feedbackData.userSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Nessun dato disponibile</div>
      </div>
    );
  }

  const { userSession, feedbacks } = feedbackData;
  const skillScore =
    Number(userSession?.[currentSkill.value as keyof UserSession]) || 0;
  const selfScore =
    Number(userSession?.[currentSkill.self as keyof UserSession]) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={pageTitle} />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Session Selector */}
        <div className="mb-4">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-gray-900">{selectedSession}</span>
                <span className="text-yellow-600 font-medium">
                  GAP:{" "}
                  {userSession?.val_gap ? `${userSession.val_gap}%` : "N/A"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sessione terminata il 31/12/24">
                <div className="flex justify-between items-center w-full pr-4">
                  <span>Sessione terminata il 31/12/24</span>
                  <span className="text-yellow-600">
                    GAP:{" "}
                    {userSession?.val_gap ? `${userSession.val_gap}%` : "N/A"}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills Selector */}
        <div className="mb-6">
          <Select
            value={selectedSkill}
            onValueChange={(value) => setSelectedSkill(value as SkillKey)}
          >
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-gray-900">{selectedSkill}</span>
                <span
                  className="text-white px-3 py-0.5 rounded-full text-sm font-medium"
                  style={{ backgroundColor: currentSkill.color }}
                >
                  {skillScore}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(skillsData).map(([key, skill]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2 pr-4">
                    <span>{skill.name}</span>
                    <span className="text-sm" style={{ color: skill.color }}>
                      {Number(
                        userSession?.[skill.value as keyof UserSession]
                      ) || 0}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question and Rating */}
        <div className="bg-white rounded-[20px] p-6 mb-4">
          <div className="mb-8">
            <p className="text-lg mb-6">
              {feedbacks[0]?.question?.description ||
                "Nessuna domanda disponibile"}
            </p>
            <div className="flex justify-center gap-4 px-4">
              {[1, 2, 3, 3.5, 4].map((rating, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 ${
                      rating <= skillScore ? "text-yellow-400" : "text-gray-200"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-lg font-semibold">
                Overall: {Number(userSession?.val_overall) || 0}/5
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-lg">Il mio Mentor: {skillScore}/5</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lg">Self: {selfScore}/5</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-[20px] p-6">
          <div
            className="flex justify-between items-center cursor-pointer hover:opacity-80"
            onClick={() =>
              (window.location.href = `/session_results/comment?sessionId=${sessionId}&userId=${userId}&skill=${selectedSkill}`)
            }
          >
            <h3 className="text-lg font-semibold">
              Hai ricevuto {feedbacks.filter((f) => f.comment).length} commenti,
              guardali qui:
            </h3>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-4">
          <button className="w-full bg-emerald-500 text-white py-4 rounded-full text-lg font-medium hover:bg-emerald-600 transition-colors">
            Crea iniziativa
          </button>
          <button className="w-full bg-blue-500 text-white py-4 rounded-full text-lg font-medium hover:bg-blue-600 transition-colors">
            Prossima Domanda
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <FeedbackContent />
    </Suspense>
  );
}
