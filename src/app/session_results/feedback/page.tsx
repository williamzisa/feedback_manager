"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { getSessionFeedback } from "@/lib/supabase/queries";
import { Database } from "@/lib/supabase/database.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type BaseFeedback = Database["public"]["Tables"]["feedbacks"]["Row"];

type FeedbackSender = {
  id: string;
  name: string;
  surname: string;
} | null;

type FeedbackReceiver = {
  id: string;
  name: string;
  surname: string;
} | null;

type FeedbackQuestion = {
  id: string;
  description: string;
  type: string;
} | null;

type Feedback = BaseFeedback & {
  sender: FeedbackSender;
  receiver: FeedbackReceiver;
  question: FeedbackQuestion;
};

type UserSession = Database["public"]["Tables"]["user_sessions"]["Row"] & {
  session_name: string;
  session_end_time: string | null;
  val_gap: number | null;
};

type FeedbacksByQuestion = {
  question: { id: string; description: string; type: string };
  feedbacks: Feedback[];
  overall: number;
  count: number;
};

type FeedbackData = {
  userSession: UserSession | null;
  feedbacksByQuestion: Record<string, FeedbacksByQuestion>;
  selfFeedbacksByQuestion: Record<
    string,
    Omit<Feedback, "sender" | "receiver">
  >;
};

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
  const [userId] = useState<string | null>(urlUserId);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ottieni tutte le domande con feedback
  const allQuestions = feedbackData
    ? Object.entries(feedbackData.feedbacksByQuestion).sort(
        (a, b) => b[1].overall - a[1].overall
      ) // Ordina per overall decrescente
    : [];

  // Imposta la prima domanda quando arrivano i dati
  useEffect(() => {
    if (allQuestions.length > 0) {
      setCurrentQuestionId(allQuestions[0][0]);
    } else {
      setCurrentQuestionId(null);
    }
  }, [feedbackData]);

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

  const pageTitle = userName || "I miei Risultati";

  // Funzioni di navigazione
  const goToNextQuestion = () => {
    if (!currentQuestionId) return;
    const currentIndex = allQuestions.findIndex(
      ([id]) => id === currentQuestionId
    );
    if (currentIndex < allQuestions.length - 1) {
      setCurrentQuestionId(allQuestions[currentIndex + 1][0]);
    }
  };

  const goToPreviousQuestion = () => {
    if (!currentQuestionId) return;
    const currentIndex = allQuestions.findIndex(
      ([id]) => id === currentQuestionId
    );
    if (currentIndex > 0) {
      setCurrentQuestionId(allQuestions[currentIndex - 1][0]);
    }
  };

  // Funzione helper per formattare i numeri con 2 decimali
  const formatNumber = (num: number | null): string => {
    if (num === null) return "N/A";
    return num.toFixed(2);
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

  if (!feedbackData || !feedbackData.userSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Nessun dato disponibile</div>
      </div>
    );
  }

  const { userSession } = feedbackData;
  const currentQuestionData = currentQuestionId
    ? feedbackData.feedbacksByQuestion[currentQuestionId]
    : null;
  const currentSelfFeedback = currentQuestionId
    ? feedbackData.selfFeedbacksByQuestion[currentQuestionId]
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={pageTitle} />

      <main className="container mx-auto max-w-2xl px-4 py-6 pb-32">
        {/* Session Info */}
        <div className="mb-4">
          <div className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
            <div className="flex justify-between items-center w-full pr-4">
              <span className="text-gray-900">
                Sessione terminata il{" "}
                {new Date(
                  userSession.session_end_time || ""
                ).toLocaleDateString("it-IT")}
              </span>
              <span
                className={`font-medium ${
                  Number(userSession?.val_gap) > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                GAP:{" "}
                {userSession?.val_gap && userSession.val_gap > 0 ? "+" : ""}
                {formatNumber(userSession?.val_gap)}%
              </span>
            </div>
          </div>
        </div>

        {/* Question and Rating */}
        <div className="bg-white rounded-[20px] p-6 mb-4">
          <div className="mb-8">
            {currentQuestionData ? (
              <>
                <p className="text-lg mb-6">
                  {currentQuestionData.question.description}
                </p>
                <div className="flex justify-center gap-4 px-4">
                  {[1, 2, 3, 4, 5].map((rating, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 ${
                          rating <= currentQuestionData.overall
                            ? "text-yellow-400"
                            : "text-gray-200"
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
                <div className="mt-4 text-center text-gray-600">
                  Domanda{" "}
                  {allQuestions.findIndex(([id]) => id === currentQuestionId) +
                    1}{" "}
                  di {allQuestions.length}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
                Nessun feedback disponibile
              </p>
            )}
          </div>

          {/* Overall Rating */}
          <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-lg font-semibold">
                Overall: {formatNumber(currentQuestionData?.overall || 0)}/5
              </span>
              <span className="text-sm text-gray-500">
                {currentQuestionData?.count || 0} feedback validi
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lg">
                Self: {formatNumber(currentSelfFeedback?.value || 0)}
                /5
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-[20px] p-6">
          <div
            className="flex justify-between items-center cursor-pointer hover:opacity-80"
            onClick={() =>
              (window.location.href = `/session_results/comment?sessionId=${sessionId}&userId=${userId}`)
            }
          >
            <h3 className="text-lg font-semibold">
              Hai ricevuto{" "}
              {currentQuestionData?.feedbacks.filter(
                (f) => f.comment && (f.value ?? 0) > 0
              ).length || 0}{" "}
              commenti, guardali qui:
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
          <div className="flex gap-4">
            <button
              onClick={goToPreviousQuestion}
              disabled={
                !currentQuestionId ||
                allQuestions.findIndex(([id]) => id === currentQuestionId) === 0
              }
              className={`flex-1 bg-blue-500 text-white py-4 rounded-full text-lg font-medium transition-colors ${
                !currentQuestionId ||
                allQuestions.findIndex(([id]) => id === currentQuestionId) === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              Domanda Precedente
            </button>
            <button
              onClick={goToNextQuestion}
              disabled={
                !currentQuestionId ||
                allQuestions.findIndex(([id]) => id === currentQuestionId) ===
                  allQuestions.length - 1
              }
              className={`flex-1 bg-blue-500 text-white py-4 rounded-full text-lg font-medium transition-colors ${
                !currentQuestionId ||
                allQuestions.findIndex(([id]) => id === currentQuestionId) ===
                  allQuestions.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              Prossima Domanda
            </button>
          </div>
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
