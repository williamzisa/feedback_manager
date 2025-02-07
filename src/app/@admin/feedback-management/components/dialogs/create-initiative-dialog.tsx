'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { queries } from "@/lib/supabase/queries";

interface Initiative {
  id: string;
  description: string | null;
}

interface CreateInitiativeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  userId: string;
  questionId: string;
  questionType: string;
  onSuccess?: () => void;
  initiative?: Initiative | null;
}

export default function CreateInitiativeDialog({
  isOpen,
  onClose,
  sessionId,
  userId,
  questionId,
  questionType,
  onSuccess,
  initiative
}: CreateInitiativeDialogProps) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initiative?.description) {
      setDescription(initiative.description);
    } else {
      setDescription('');
    }
  }, [initiative]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('La descrizione è obbligatoria');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      if (initiative) {
        // Modifica
        result = await queries.initiatives.update(
          initiative.id,
          description.trim()
        );
      } else {
        // Creazione
        result = await queries.initiatives.create({
          description: description.trim(),
          session_id: sessionId,
          user_id: userId,
          question_id: questionId,
          type: questionType
        });
      }

      if (!result) {
        throw new Error(initiative 
          ? 'Non è stato possibile modificare l\'iniziativa'
          : 'Non è stato possibile creare l\'iniziativa'
        );
      }

      toast({
        title: initiative ? "Iniziativa modificata" : "Iniziativa creata",
        description: initiative 
          ? "L'iniziativa è stata modificata con successo"
          : "L'iniziativa è stata creata con successo",
        variant: "success"
      });

      onSuccess?.();
      onClose();
      setDescription('');
    } catch (err) {
      console.error(initiative ? 'Errore nella modifica' : 'Errore nella creazione', err);
      const errorMessage = err instanceof Error ? err.message : 'Si è verificato un errore sconosciuto';
      setError(`Errore: ${errorMessage}`);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initiative ? 'Modifica Iniziativa' : 'Crea Iniziativa'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Textarea
              id="description"
              placeholder="Descrivi l'iniziativa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading 
              ? (initiative ? 'Salvataggio...' : 'Creazione...') 
              : (initiative ? 'Salva' : 'Crea')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 