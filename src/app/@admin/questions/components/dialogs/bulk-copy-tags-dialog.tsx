"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { queries } from "@/lib/supabase/queries";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";

interface BulkCopyTagsDialogProps {
  selectedQuestionIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

interface QuestionWithTags {
  id: string;
  description: string;
  type: string;
  tags: { id: string }[];
}

export function BulkCopyTagsDialog({
  selectedQuestionIds,
  open,
  onOpenChange,
  onComplete,
}: BulkCopyTagsDialogProps) {
  const [questionsWithTags, setQuestionsWithTags] = useState<QuestionWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();

  const fetchQuestionsWithTags = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await queries.tags.getQuestionsWithTags();
      // Filtriamo le domande selezionate dalla lista delle sorgenti
      const filteredData = data.filter(q => !selectedQuestionIds.includes(q.id));
      setQuestionsWithTags(filteredData);
    } catch (error) {
      console.error("Errore nel caricamento delle domande con tag:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le domande con tag",
        variant: "destructive",
      });
      setQuestionsWithTags([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedQuestionIds, toast]);

  useEffect(() => {
    if (open) {
      fetchQuestionsWithTags();
      setSelectedSourceId("");
    }
  }, [open, fetchQuestionsWithTags]);

  const handleCopyTags = async () => {
    if (!selectedSourceId) {
      toast({
        title: "Attenzione",
        description: "Seleziona prima una domanda da cui copiare i tag",
        variant: "destructive",
      });
      return;
    }
    
    setIsCopying(true);
    
    try {
      // 1. Ottieni i tag della domanda selezionata
      const sourceTags = await queries.tags.getForQuestion(selectedSourceId);
      
      if (!sourceTags || sourceTags.length === 0) {
        toast({
          title: "Attenzione",
          description: "La domanda selezionata non ha tag da copiare",
          variant: "destructive",
        });
        setIsCopying(false);
        return;
      }
      
      let successCount = 0;
      const supabase = createClientComponentClient<Database>();
      
      // Ottieni l'utente corrente per recuperare la company
      const currentUser = await queries.users.getCurrentUserClient();
      
      if (!currentUser || !currentUser.company) {
        toast({
          title: "Errore",
          description: "Impossibile determinare la company dell'utente",
          variant: "destructive",
        });
        setIsCopying(false);
        return;
      }
      
      // 2. Per ogni domanda selezionata, crea i tag copiati dalla sorgente
      for (const targetQuestionId of selectedQuestionIds) {
        // Salta la domanda di origine se per caso è inclusa nei selezionati
        if (targetQuestionId === selectedSourceId) continue;
        
        // Per ogni tag della domanda sorgente
        for (const tag of sourceTags) {
          const { error } = await supabase
            .from('question_tags')
            .insert({
              question_id: targetQuestionId,
              score: tag.score,
              description: tag.description,
              company: currentUser.company
            });
          
          if (error) {
            console.error(`Errore nella creazione del tag per la domanda ${targetQuestionId}:`, error);
          } else {
            successCount++;
          }
        }
      }
      
      toast({
        title: "Successo",
        description: `Copiati ${successCount} tag su ${selectedQuestionIds.length} domande`,
      });
      
      // 3. Chiudi il dialog e aggiorna la vista principale
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Errore durante la copia dei tag:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la copia dei tag",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copia tag in massa</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Seleziona una domanda da cui copiare i tag. I tag verranno copiati su {selectedQuestionIds.length} domande selezionate.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : questionsWithTags.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nessuna domanda con tag disponibile
            </div>
          ) : (
            <Select
              value={selectedSourceId}
              onValueChange={setSelectedSourceId}
              disabled={isLoading || isCopying}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona domanda sorgente" />
              </SelectTrigger>
              <SelectContent>
                {questionsWithTags.map((question) => (
                  <SelectItem key={question.id} value={question.id}>
                    <span className="font-medium">{question.type}</span>:{" "}
                    {question.description.substring(0, 60)}
                    {question.description.length > 60 ? "..." : ""}
                    <span className="ml-1 text-muted-foreground">
                      ({question.tags.length} tag)
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCopying}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleCopyTags}
            disabled={!selectedSourceId || isCopying || isLoading}
          >
            {isCopying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Copia in corso...
              </>
            ) : (
              "Copia tag"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 