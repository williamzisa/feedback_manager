"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
import { queries } from "@/lib/supabase/queries";
import { QuestionTag, QuestionTagFormData } from "@/lib/types/questions";
import { useToast } from "@/components/ui/use-toast";

interface QuestionTagsDialogProps {
  questionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QuestionWithTags {
  id: string;
  description: string;
  type: string;
  tags: { id: string }[];
}

export function QuestionTagsDialog({
  questionId,
  open,
  onOpenChange,
}: QuestionTagsDialogProps) {
  const [tags, setTags] = useState<QuestionTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<QuestionTag | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuestionTagFormData>({
    score: 1,
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [scoreFilter, setScoreFilter] = useState<string>("ALL");
  const [questionsWithTags, setQuestionsWithTags] = useState<QuestionWithTags[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [isCopyingTags, setIsCopyingTags] = useState(false);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 5;

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await queries.tags.getForQuestion(questionId);
      setTags(data);
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile caricare i tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [questionId, toast]);
  
  const fetchQuestionsWithTags = useCallback(async () => {
    try {
      const data = await queries.tags.getQuestionsWithTags();
      // Filtra la domanda corrente dalla lista
      const filteredData = data.filter(q => q.id !== questionId);
      setQuestionsWithTags(filteredData);
    } catch (error) {
      console.error("Errore nel caricamento delle domande con tag:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le domande con tag",
        variant: "destructive",
      });
      setQuestionsWithTags([]);
    }
  }, [questionId, toast]);

  useEffect(() => {
    if (open) {
      fetchTags();
      fetchQuestionsWithTags();
    }
  }, [open, fetchTags, fetchQuestionsWithTags]);

  // Reset alla prima pagina quando cambia il filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [scoreFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTag) {
        // Aggiornamento tag esistente
        const response = await fetch("/api/questions/tags", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTag.id,
            ...formData,
          }),
        });

        if (!response.ok) throw new Error("Errore nell'aggiornamento del tag");

        toast({
          title: "Successo",
          description: "Tag aggiornato correttamente",
        });
      } else {
        // Creazione nuovo tag
        const response = await fetch("/api/questions/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: questionId,
            ...formData,
          }),
        });

        if (!response.ok) throw new Error("Errore nella creazione del tag");

        toast({
          title: "Successo",
          description: "Tag creato correttamente",
        });
      }

      // Reset form e stato
      setFormData({ score: 1, description: "" });
      setEditingTag(null);
      fetchTags();
    } catch {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo tag?")) return;

    try {
      const response = await fetch(`/api/questions/tags?id=${tagId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Errore nell'eliminazione del tag");

      toast({
        title: "Successo",
        description: "Tag eliminato correttamente",
      });

      fetchTags();
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il tag",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyTags = async () => {
    if (!selectedQuestionId) {
      toast({
        title: "Attenzione",
        description: "Seleziona prima una domanda da cui copiare i tag",
        variant: "destructive",
      });
      return;
    }
    
    setIsCopyingTags(true);
    
    try {
      // 1. Ottieni i tag della domanda selezionata
      const sourceTags = await queries.tags.getForQuestion(selectedQuestionId);
      
      if (!sourceTags || sourceTags.length === 0) {
        toast({
          title: "Attenzione",
          description: "La domanda selezionata non ha tag da copiare",
          variant: "destructive",
        });
        return;
      }
      
      // 2. Crea i nuovi tag per la domanda corrente
      for (const tag of sourceTags) {
        const response = await fetch("/api/questions/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: questionId,
            score: tag.score,
            description: tag.description,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Errore nella creazione del tag: ${tag.description}`);
        }
      }
      
      toast({
        title: "Successo",
        description: `Copiati ${sourceTags.length} tag con successo`,
      });
      
      // 3. Aggiorna la visualizzazione dei tag
      fetchTags();
      
    } catch (error) {
      console.error("Errore durante la copia dei tag:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la copia dei tag",
        variant: "destructive",
      });
    } finally {
      setIsCopyingTags(false);
      setSelectedQuestionId("");
    }
  };

  // Filtra i tag in base allo score selezionato
  const filteredTags = tags.filter(
    (tag) => scoreFilter === "ALL" || tag.score.toString() === scoreFilter
  );

  // Calcola i tag da mostrare nella pagina corrente
  const totalPages = Math.ceil(filteredTags.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTags = filteredTags.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gestione Tag</DialogTitle>
        </DialogHeader>
        
        {/* Sezione per copiare i tag da altre domande */}
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Copia tag da altre domande</h3>
          <div className="flex items-center gap-2">
            <Select
              value={selectedQuestionId}
              onValueChange={setSelectedQuestionId}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleziona una domanda con tag" />
              </SelectTrigger>
              <SelectContent>
                {questionsWithTags.length === 0 ? (
                  <SelectItem value="no-options" disabled>
                    Nessuna domanda disponibile con tag
                  </SelectItem>
                ) : (
                  questionsWithTags.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.description} ({q.tags ? q.tags.length : 0} tag)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleCopyTags} 
              disabled={!selectedQuestionId || isCopyingTags}
              variant="outline"
            >
              {isCopyingTags ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copia Tag
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={formData.score.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, score: parseInt(value) }))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((score) => (
                  <SelectItem key={score} value={score.toString()}>
                    {score}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Descrizione del tag"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingTag ? (
                "Aggiorna"
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi
                </>
              )}
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtra per score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutti gli score</SelectItem>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <SelectItem key={score} value={score.toString()}>
                      Score: {score}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>Descrizione</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>{tag.score}</TableCell>
                    <TableCell>{tag.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTag(tag);
                            setFormData({
                              score: tag.score,
                              description: tag.description,
                            });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tag.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTags.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-gray-500"
                    >
                      Nessun tag trovato
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Paginazione */}
            {filteredTags.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Pagina {currentPage} di {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
