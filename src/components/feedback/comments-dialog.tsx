import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSessionComments } from "@/lib/supabase/queries";
import { Database } from "@/lib/supabase/database.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"] & {
  sender: { name: string; surname: string };
  receiver: { name: string; surname: string };
  question: { description: string };
};

interface CommentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  userId: string;
  questionId: string;
  questionDescription: string;
  onCreateInitiative: () => void;
}

export function CommentsDialog({
  isOpen,
  onClose,
  sessionId,
  userId,
  questionId,
  questionDescription,
  onCreateInitiative,
}: CommentsDialogProps) {
  const [comments, setComments] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadComments() {
      if (sessionId && userId && isOpen) {
        try {
          setIsLoading(true);
          const data = await getSessionComments(sessionId, userId);
          const filteredComments = data.filter(
            (f) => f.question_id === questionId && f.comment
          );
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
    }
  }, [sessionId, userId, questionId, isOpen]);

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

  const currentComment = comments[currentIndex];

  const handleCreateInitiative = () => {
    onClose(); // Chiudi il dialog dei commenti
    onCreateInitiative(); // Apri il dialog delle iniziative
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg h-[90vh] flex flex-col">
        <DialogHeader className="px-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-[#4285F4]">
              Commenti Ricevuti
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <span>Caricamento...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-center">
                {questionDescription || "Nessuna domanda disponibile"}
              </h3>
              <div className="flex justify-center mt-2">
                <span className="bg-[#4285F4] text-white px-3 py-0.5 rounded-full text-sm font-medium">
                  {currentIndex + 1} di {comments.length}
                </span>
              </div>
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

                  {/* Controlli di navigazione con bottone crea iniziativa */}
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
                      onClick={handleCreateInitiative}
                      className="h-14 px-6 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium text-base"
                    >
                      Crea Iniziativa
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
      </DialogContent>
    </Dialog>
  );
}
