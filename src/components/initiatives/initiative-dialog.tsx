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
import { useEffect } from "react";

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
}

export function InitiativeDialog({
  isOpen,
  onClose,
  onSubmit,
  initiative,
  mode,
}: InitiativeDialogProps) {
  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      description: "",
    },
  });

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
