import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Initiative, InitiativeType } from "@/lib/types/initiatives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "../../components/ui/textarea";
import { useEffect, useState } from "react";

const initiativeSchema = z.object({
  description: z
    .string()
    .min(10, "La descrizione deve essere di almeno 10 caratteri")
    .max(500, "La descrizione non può superare i 500 caratteri"),
});

type InitiativeFormData = z.infer<typeof initiativeSchema>;

interface InitiativeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InitiativeFormData) => Promise<void>;
  initiative?: Initiative;
  questionId: string;
  sessionId: string;
  questionType: InitiativeType;
  mode: "create" | "edit";
  suggestedInitiatives?: string;
}

export function InitiativeDialog({
  isOpen,
  onClose,
  onSubmit,
  initiative,
  mode,
  suggestedInitiatives,
}: InitiativeDialogProps) {
  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      description: "",
    },
  });
  
  const [parsedInitiatives, setParsedInitiatives] = useState<string[]>([]);

  // Parse le iniziative suggerite quando disponibili
  useEffect(() => {
    if (suggestedInitiatives && suggestedInitiatives !== "Non ci sono abbastanza dati per suggerire iniziative.") {
      // Tenta di estrarre le iniziative dal testo
      const initiatives = suggestedInitiatives
        .split(/[\n\r]/)
        .map(line => line.trim())
        .filter(line => line.startsWith("- ") || /^\d+\./.test(line))
        .map(line => line.replace(/^(-|\d+\.)\s*/, "").trim())
        .filter(line => line.length > 0);
      
      if (initiatives.length > 0) {
        setParsedInitiatives(initiatives);
      } else {
        // Se non riesce a identificare un formato strutturato, usa l'intero testo
        setParsedInitiatives([suggestedInitiatives]);
      }
    } else {
      setParsedInitiatives([]);
    }
  }, [suggestedInitiatives]);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initiative?.description) {
        form.reset({ description: initiative.description });
      } else {
        form.reset({ description: "" });
      }
    }
  }, [isOpen, mode, initiative, form]);

  const handleSubmit = async (data: InitiativeFormData) => {
    try {
      await onSubmit(data);
      form.reset({ description: "" });
      onClose();
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    }
  };

  const handleSelectInitiative = (initiative: string) => {
    form.setValue("description", initiative);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nuova Iniziativa" : "Modifica Iniziativa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Crea una nuova iniziativa per questa domanda"
              : "Modifica i dettagli dell'iniziativa"}
          </DialogDescription>
        </DialogHeader>

        {/* Mostra le iniziative suggerite solo in modalità creazione */}
        {mode === "create" && parsedInitiatives.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Suggerimenti di iniziative:</h3>
            <div className="space-y-2">
              {parsedInitiatives.map((initiative, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectInitiative(initiative)}
                >
                  {initiative}
                </div>
              ))}
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi la tua iniziativa..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({ description: "" });
                  onClose();
                }}
              >
                Annulla
              </Button>
              <Button type="submit">
                {mode === "create" ? "Crea" : "Salva"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
