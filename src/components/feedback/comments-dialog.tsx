import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSessionComments } from "@/lib/supabase/queries";
import { ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateFeedbackAnalysis } from "@/lib/comment-ai";

type Feedback = {
  id: string;
  sender: { name: string; surname: string };
  receiver: { name: string; surname: string };
  question: { description: string };
  question_id: string | null;
  comment: string | null;
  value: number | null;
  session_id: string;
  created_at: string;
  sender_name_surname?: string | null;
  receiver_name_surname?: string | null;
  questions_description?: string | null;
};

interface FeedbackAnalysis {
  summaryComments: string;
  suggestedInitiatives: string;
  isLoading: boolean;
}

interface CommentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  userId: string;
  questionId: string;
  questionDescription: string;
  onCreateInitiative: (suggestedInitiatives?: string) => void;
  existingAnalysis?: {
    summaryComments?: string;
    suggestedInitiatives?: string;
  };
}

export function CommentsDialog({
  isOpen,
  onClose,
  sessionId,
  userId,
  questionId,
  questionDescription,
  onCreateInitiative,
  existingAnalysis,
}: CommentsDialogProps) {
  const [comments, setComments] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"comments" | "summary">("comments");
  const [analysis, setAnalysis] = useState<FeedbackAnalysis>({
    summaryComments: existingAnalysis?.summaryComments || "",
    suggestedInitiatives: existingAnalysis?.suggestedInitiatives || "",
    isLoading: false,
  });

  useEffect(() => {
    async function loadComments() {
      if (sessionId && userId && isOpen) {
        try {
          setIsLoading(true);
          const data = await getSessionComments(sessionId, userId);
          const filteredComments = data.filter(f => f.question_id === questionId);
          setComments(filteredComments);
          setCurrentIndex(0); // Reset to first comment when opening dialog
        } catch (error) {
          console.error("Errore nel caricamento dei commenti:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (isOpen) {
      loadComments();
      // Inizializza l'analisi con i dati esistenti, se presenti
      if (existingAnalysis) {
        setAnalysis({
          summaryComments: existingAnalysis.summaryComments || "",
          suggestedInitiatives: existingAnalysis.suggestedInitiatives || "",
          isLoading: false,
        });
        setActiveTab("summary");
      } else {
        setActiveTab("comments");
      }
    }
  }, [sessionId, userId, questionId, isOpen, existingAnalysis]);

  const goToNextComment = () => {
    if (currentIndex < comments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPreviousComment = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGenerateAnalysis = async () => {
    try {
      setAnalysis(prev => ({ ...prev, isLoading: true }));
      const result = await generateFeedbackAnalysis(sessionId, questionId, userId);
      setAnalysis({
        summaryComments: result.summaryComments,
        suggestedInitiatives: result.suggestedInitiatives,
        isLoading: false,
      });
      setActiveTab("summary");
    } catch (error) {
      console.error("Errore durante la generazione dell'analisi:", error);
      setAnalysis(prev => ({ ...prev, isLoading: false }));
    }
  };

  const currentComment = comments[currentIndex];

  const handleCreateInitiative = () => {
    onClose(); // Chiudi il dialog dei commenti
    onCreateInitiative(analysis.suggestedInitiatives); // Passa le iniziative suggerite
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg h-[90vh] flex flex-col">
        <DialogHeader className="px-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-[#4285F4]">
              Feedback Ricevuti
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-center">
            {questionDescription || "Nessuna domanda disponibile"}
          </h3>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as "comments" | "summary")}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="comments">Commenti</TabsTrigger>
            <TabsTrigger value="summary">Riassunto</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <span>Caricamento...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-center mt-2 mb-4">
                  <span className="bg-[#4285F4] text-white px-3 py-0.5 rounded-full text-sm font-medium">
                    {currentIndex + 1} di {comments.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  {comments.length > 0 ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-lg mb-4">
                          {currentComment.sender?.name}{" "}
                          {currentComment.sender?.surname}
                        </h4>
                        <p className="text-gray-700">{currentComment.comment}</p>
                      </div>

                      {/* Controlli di navigazione */}
                      <div className="mt-6 flex items-center justify-between px-4">
                        <Button
                          variant="ghost"
                          size="lg"
                          className="h-16 w-16 rounded-full disabled:opacity-50"
                          onClick={goToPreviousComment}
                          disabled={currentIndex === 0}
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <Button
                          onClick={() => setActiveTab("summary")}
                          className="h-14 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium text-base"
                        >
                          Vai al Riassunto
                        </Button>

                        <Button
                          variant="ghost"
                          size="lg"
                          className="h-16 w-16 rounded-full disabled:opacity-50"
                          onClick={goToNextComment}
                          disabled={currentIndex === comments.length - 1}
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-center text-gray-500">
                        Nessun commento disponibile per questa domanda
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="summary" className="flex-1 flex flex-col">
            {analysis.isLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <span>Generazione analisi in corso...</span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {analysis.summaryComments ? (
                  <>
                    <div className="flex-1 bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm">
                      <h4 className="font-bold text-lg mb-4">
                        Riassunto dei commenti
                      </h4>
                      <p className="text-gray-700 mb-6">{analysis.summaryComments}</p>
                      
                      {analysis.suggestedInitiatives && analysis.suggestedInitiatives !== "Non ci sono abbastanza dati per suggerire iniziative." && (
                        <>
                          <h4 className="font-bold text-lg mb-4 mt-8">
                            Iniziative suggerite
                          </h4>
                          <p className="text-gray-700">{analysis.suggestedInitiatives}</p>
                        </>
                      )}
                    </div>

                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={handleCreateInitiative}
                        className="h-14 px-6 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium text-base"
                      >
                        Crea Iniziativa
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-center text-gray-500 mb-6">
                      Non è ancora stata generata un&apos;analisi per questa domanda
                    </p>
                    <Button 
                      onClick={handleGenerateAnalysis}
                      className="flex items-center gap-2"
                    >
                      <BarChart2 className="h-4 w-4" />
                      Genera Analisi
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
