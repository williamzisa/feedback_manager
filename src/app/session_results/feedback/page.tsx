"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { getSessionFeedback } from "@/lib/supabase/queries";
import { Database } from "@/lib/supabase/database.types";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import { FeedbackScoreCard } from "@/components/stats/feedback-score-card";
import { InitiativesSection } from "@/components/initiatives/initiatives-section";
import { InitiativeDialog } from "@/components/initiatives/initiative-dialog";
import {
  createInitiative,
  deleteInitiative,
  getInitiativesByQuestionId,
  updateInitiative,
  getSessionQuestionAnalysis,
} from "@/lib/supabase/server";
import { Initiative, InitiativeType } from "@/lib/types/initiatives";
import { CommentsDialog } from "@/components/feedback/comments-dialog";

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
  val_soft: number | null;
  val_strategy: number | null;
  val_execution: number | null;
};

type FeedbacksByQuestion = {
  question: { id: string; description: string; type: string };
  feedbacks: Feedback[];
  overall: number;
  count: number;
  mentorValue: number;
};

type FeedbackData = {
  userSession: UserSession | null;
  feedbacksByQuestion: Record<string, FeedbacksByQuestion>;
  selfFeedbacksByQuestion: Record<
    string,
    Omit<Feedback, "sender" | "receiver">
  >;
};

// Definizione del tipo per l'analisi
interface QuestionAnalysis {
  id: string;
  session_id: string;
  question_id: string;
  receiver_id: string;
  overall_value: number;
  mentor_value: number;
  self_value: number;
  summary_comments: string;
  suggested_initiatives: string;
}

function FeedbackContent() {
  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const userName = searchParams.get("userName");
  const sessionId = searchParams.get("sessionId");
  const urlSkillType = searchParams.get("skill");
  const urlQuestionId = searchParams.get("questionId");
  const [userId] = useState<string | null>(urlUserId);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    urlQuestionId
  );

  // Mapping tra i tipi visualizzati e i tipi del backend
  const skillTypeMapping = useMemo(
    () =>
      ({
        "Soft Skills": "SOFT",
        "Strategy Skills": "STRATEGY",
        "Execution Skills": "EXECUTION",
      } as const),
    []
  );

  // Mapping inverso per la visualizzazione
  const reverseSkillTypeMapping = useMemo(
    () =>
      ({
        SOFT: "Soft Skills",
        STRATEGY: "Strategy Skills",
        EXECUTION: "Execution Skills",
      } as const),
    []
  );

  // Inizializza con il tipo corretto mappato dal parametro URL o default
  const getInitialSkillType = () => {
    if (!urlSkillType) return "Strategy Skills";
    return (
      reverseSkillTypeMapping[
        urlSkillType as keyof typeof reverseSkillTypeMapping
      ] || "Strategy Skills"
    );
  };

  const [selectedSkillType, setSelectedSkillType] = useState<string>(
    getInitialSkillType()
  );
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isInitiativeDialogOpen, setIsInitiativeDialogOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | undefined>();
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [suggestedInitiatives, setSuggestedInitiatives] = useState<string>("");
  const [currentAnalysis, setCurrentAnalysis] = useState<QuestionAnalysis | null>(null);

  // Ottieni tutte le domande con feedback filtrate per tipo
  const filteredQuestions = useMemo(
    () =>
      feedbackData
        ? Object.entries(feedbackData.feedbacksByQuestion)
            .filter(
              ([, data]) =>
                data.question.type ===
                skillTypeMapping[
                  selectedSkillType as keyof typeof skillTypeMapping
                ]
            )
            .sort((a, b) => a[1].overall - b[1].overall)
        : [],
    [feedbackData, selectedSkillType, skillTypeMapping]
  );

  // Imposta la prima domanda quando arrivano i dati o cambia il tipo
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      setCurrentQuestionId(filteredQuestions[0][0]);
    } else {
      setCurrentQuestionId(null);
    }
  }, [feedbackData, selectedSkillType, filteredQuestions]);

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

  // Reset states immediately when question changes, then fetch analysis data
  useEffect(() => {
    // Reset degli stati immediatamente quando cambia la domanda
    setCurrentAnalysis(null);
    setInitiatives([]);
    // Chiudi i dialog aperti quando cambia la domanda
    setIsCommentsDialogOpen(false);
    setIsInitiativeDialogOpen(false);
    
    async function fetchQuestionAnalysis() {
      if (!currentQuestionId || !sessionId || !userId) return;
      
      try {
        const analysis = await getSessionQuestionAnalysis(sessionId, currentQuestionId, userId);
        setCurrentAnalysis(analysis as QuestionAnalysis | null);
      } catch (error) {
        console.error("Errore nel caricamento dell'analisi:", error);
        setCurrentAnalysis(null);
      }
    }
    
    async function fetchInitiatives() {
      if (!currentQuestionId) return;
      try {
        const data = await getInitiativesByQuestionId(currentQuestionId, userId || undefined);
        setInitiatives(data as Initiative[]);
      } catch (error) {
        console.error("Errore nel caricamento delle iniziative:", error);
        setInitiatives([]);
      }
    }
    
    if (currentQuestionId) {
      fetchQuestionAnalysis();
      fetchInitiatives();
    }
  }, [currentQuestionId, sessionId, userId]);

  const pageTitle = userName || "I miei Risultati";

  // Funzioni di navigazione
  const goToNextQuestion = () => {
    if (!currentQuestionId) return;
    const currentIndex = filteredQuestions.findIndex(
      ([id]) => id === currentQuestionId
    );
    if (currentIndex < filteredQuestions.length - 1) {
      // Chiudi eventuali dialog aperti quando cambi domanda
      setIsCommentsDialogOpen(false);
      setIsInitiativeDialogOpen(false);
      setCurrentQuestionId(filteredQuestions[currentIndex + 1][0]);
    }
  };

  const goToPreviousQuestion = () => {
    if (!currentQuestionId) return;
    const currentIndex = filteredQuestions.findIndex(
      ([id]) => id === currentQuestionId
    );
    if (currentIndex > 0) {
      // Chiudi eventuali dialog aperti quando cambi domanda
      setIsCommentsDialogOpen(false);
      setIsInitiativeDialogOpen(false);
      setCurrentQuestionId(filteredQuestions[currentIndex - 1][0]);
    }
  };

  // Funzione helper per formattare i numeri con 2 decimali
  const formatNumber = (num: number | null): string => {
    if (num === null) return "N/A";
    return num.toFixed(2);
  };

  const getQuestionsCountByType = (type: string) => {
    if (!feedbackData) return 0;
    return Object.values(feedbackData.feedbacksByQuestion).filter(
      (data) =>
        data.question.type ===
        skillTypeMapping[type as keyof typeof skillTypeMapping]
    ).length;
  };

  const getSessionValueByType = (type: string): number | null => {
    if (!feedbackData?.userSession) return null;
    const session = feedbackData.userSession;
    switch (type) {
      case "Soft Skills":
        return session.val_soft;
      case "Strategy Skills":
        return session.val_strategy;
      case "Execution Skills":
        return session.val_execution;
      default:
        return null;
    }
  };

  const handleBackToResults = () => {
    const queryParams = new URLSearchParams();
    if (userId) {
      queryParams.set("userId", userId);
      if (userName) {
        queryParams.set("userName", userName);
      }
    }
    window.location.href = `/session_results${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
  };

  const handleNewInitiative = (suggestedInitiativesText?: string) => {
    setSuggestedInitiatives(suggestedInitiativesText || "");
    setSelectedInitiative(undefined);
    setDialogMode("create");
    setIsInitiativeDialogOpen(true);
  };

  const handleEditInitiative = (initiative: Initiative) => {
    setSelectedInitiative(initiative);
    setDialogMode("edit");
    setIsInitiativeDialogOpen(true);
  };

  const handleDeleteInitiative = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa iniziativa?")) return;
    try {
      const result = await deleteInitiative(id, userId || undefined);
      if (result.success) {
        setInitiatives((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert(result.error || "Errore durante l'eliminazione dell'iniziativa");
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert("Errore durante l'eliminazione dell'iniziativa");
    }
  };

  const handleInitiativeSubmit = async (data: { description: string }) => {
    if (!currentQuestionId || !sessionId || !currentQuestionData) return;

    try {
      if (dialogMode === "create") {
        const result = await createInitiative({
          description: data.description,
          question_id: currentQuestionId,
          session_id: sessionId,
          type: currentQuestionData.question.type as InitiativeType,
          user_id: userId || undefined
        });

        if (result.success) {
          const updatedInitiatives = await getInitiativesByQuestionId(
            currentQuestionId,
            userId || undefined
          );
          setInitiatives(updatedInitiatives as Initiative[]);
        } else {
          alert(result.error || "Errore durante la creazione dell'iniziativa");
        }
      } else if (selectedInitiative) {
        const result = await updateInitiative(
          selectedInitiative.id, 
          data,
          userId || undefined
        );
        if (result.success) {
          const updatedInitiatives = await getInitiativesByQuestionId(
            currentQuestionId,
            userId || undefined
          );
          setInitiatives(updatedInitiatives as Initiative[]);
        } else {
          alert(
            result.error || "Errore durante l'aggiornamento dell'iniziativa"
          );
        }
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert("Errore durante il salvataggio dell'iniziativa");
    }
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
    <div className="relative w-full flex flex-col min-h-screen bg-[#F5F5F7]">
      <Header title={pageTitle} />

      <main className="container mx-auto max-w-2xl px-4 py-6 pb-32">
        {/* Back Button */}
        <div className="absolute top-20 left-4 md:left-8">
          <button
            onClick={handleBackToResults}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Torna ai risultati"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        </div>

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

        {/* Skill Type Selector */}
        <div className="mb-6">
          <Select
            value={selectedSkillType}
            onValueChange={setSelectedSkillType}
          >
            <SelectTrigger className="w-full bg-white">
              <div className="flex justify-between items-center w-full">
                <span>{selectedSkillType}</span>
                <span className="text-gray-500">
                  {getQuestionsCountByType(selectedSkillType)} domande ·{" "}
                  {formatNumber(getSessionValueByType(selectedSkillType) || 0)}
                  /5
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(skillTypeMapping).map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex justify-between items-center w-full">
                    <span>{type}</span>
                    <span className="text-gray-500 ml-4">
                      {getQuestionsCountByType(type)} domande ·{" "}
                      {formatNumber(getSessionValueByType(type) || 0)}/5
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
                          rating <= Math.round(currentQuestionData.overall)
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
                  {filteredQuestions.findIndex(
                    ([id]) => id === currentQuestionId
                  ) + 1}{" "}
                  di {filteredQuestions.length}
                </div>

                <div className="mt-8">
                  <FeedbackScoreCard
                    overall={currentQuestionData.overall}
                    self={currentSelfFeedback?.value || 0}
                    mentor={currentQuestionData.mentorValue || 0}
                    feedbackCount={currentQuestionData.feedbacks.filter(f => f.value !== null && f.value > 0).length}
                    commentCount={
                      currentQuestionData.feedbacks.filter(
                        (f) => f.comment !== null
                      ).length
                    }
                    onViewComments={() => setIsCommentsDialogOpen(true)}
                  />
                </div>

                <InitiativesSection
                  initiatives={initiatives}
                  onNewInitiative={handleNewInitiative}
                  onEditInitiative={handleEditInitiative}
                  onDeleteInitiative={handleDeleteInitiative}
                  buttonClassName="h-10 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                />

                <CommentsDialog
                  isOpen={isCommentsDialogOpen}
                  onClose={() => setIsCommentsDialogOpen(false)}
                  sessionId={sessionId || ""}
                  userId={userId || ""}
                  questionId={currentQuestionId || ""}
                  questionDescription={
                    currentQuestionId && feedbackData?.feedbacksByQuestion[currentQuestionId]
                      ? feedbackData.feedbacksByQuestion[currentQuestionId].question.description
                      : ""
                  }
                  onCreateInitiative={handleNewInitiative}
                  existingAnalysis={currentAnalysis && currentAnalysis.question_id === currentQuestionId ? {
                    summaryComments: currentAnalysis.summary_comments,
                    suggestedInitiatives: currentAnalysis.suggested_initiatives
                  } : undefined}
                />

                <InitiativeDialog
                  isOpen={isInitiativeDialogOpen}
                  onClose={() => setIsInitiativeDialogOpen(false)}
                  onSubmit={handleInitiativeSubmit}
                  initiative={selectedInitiative}
                  mode={dialogMode}
                  questionId={currentQuestionId || ""}
                  sessionId={sessionId || ""}
                  questionType={
                    currentQuestionId && feedbackData?.feedbacksByQuestion[currentQuestionId]
                      ? (feedbackData.feedbacksByQuestion[currentQuestionId].question
                          .type as InitiativeType)
                      : "STRATEGY"
                  }
                  suggestedInitiatives={suggestedInitiatives}
                />
              </>
            ) : (
              <p className="text-center text-gray-500">
                Nessun feedback disponibile per questa tipologia di skill
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <button
              onClick={goToPreviousQuestion}
              disabled={
                !currentQuestionId ||
                filteredQuestions.findIndex(
                  ([id]) => id === currentQuestionId
                ) === 0
              }
              className={`flex-1 bg-blue-500 text-white py-4 rounded-full text-lg font-medium transition-colors ${
                !currentQuestionId ||
                filteredQuestions.findIndex(
                  ([id]) => id === currentQuestionId
                ) === 0
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
                filteredQuestions.findIndex(
                  ([id]) => id === currentQuestionId
                ) ===
                  filteredQuestions.length - 1
              }
              className={`flex-1 bg-blue-500 text-white py-4 rounded-full text-lg font-medium transition-colors ${
                !currentQuestionId ||
                filteredQuestions.findIndex(
                  ([id]) => id === currentQuestionId
                ) ===
                  filteredQuestions.length - 1
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
