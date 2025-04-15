"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const processSchema = z.object({
  name: z.string().min(1, "Il nome del processo è obbligatorio"),
  questionDescription: z
    .string()
    .min(1, "La descrizione della domanda è obbligatoria"),
});

type ProcessFormData = z.infer<typeof processSchema>;

interface CreateProcessDialogProps {
  teamId: string;
}

export function CreateProcessDialog({ teamId }: CreateProcessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      name: "",
      questionDescription: "",
    },
  });

  const handleSubmit = async (data: ProcessFormData) => {
    try {
      setIsLoading(true);

      // Creiamo prima la domanda
      const questionResponse = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: data.questionDescription,
          type: "EXECUTION", // Tipo corretto per le domande di processo
        }),
      });

      if (!questionResponse.ok) {
        throw new Error("Errore nella creazione della domanda");
      }

      const question = await questionResponse.json();

      // Ora creiamo il processo collegato alla domanda appena creata
      const processResponse = await fetch(`/api/teams/${teamId}/processes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          linked_question_id: question.id,
        }),
      });

      if (!processResponse.ok) {
        throw new Error("Errore nella creazione del processo");
      }

      toast({
        title: "Processo creato",
        description:
          "Il processo è stato creato e associato al team con successo",
      });

      form.reset();
      setIsOpen(false);
      router.refresh(); // Aggiorniamo la UI
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description:
          error instanceof Error
            ? error.message
            : "Errore nella creazione del processo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Nuovo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuovo Processo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Processo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci il nome del processo"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domanda Associata</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Inserisci la domanda da associare al processo"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading || form.formState.isSubmitting}
              className="w-full"
            >
              {(isLoading || form.formState.isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salva Processo
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
