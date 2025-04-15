"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2, Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const connectProcessSchema = z.object({
  processId: z.string().min(1, "Seleziona un processo"),
});

type ConnectProcessFormData = z.infer<typeof connectProcessSchema>;

interface Process {
  id: string;
  name: string;
  questions: {
    id: string;
    description: string;
  } | null;
}

interface ConnectProcessDialogProps {
  teamId: string;
}

export function ConnectProcessDialog({ teamId }: ConnectProcessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableProcesses, setAvailableProcesses] = useState<Process[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ConnectProcessFormData>({
    resolver: zodResolver(connectProcessSchema),
    defaultValues: {
      processId: "",
    },
  });

  useEffect(() => {
    const loadAvailableProcesses = async () => {
      try {
        const response = await fetch(
          `/api/teams/${teamId}/available-processes`
        );
        if (!response.ok) {
          throw new Error("Errore nel caricamento dei processi disponibili");
        }
        const data = await response.json();
        setAvailableProcesses(data);
      } catch (error) {
        console.error("Errore nel caricamento dei processi:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile caricare i processi disponibili",
        });
      }
    };

    if (isOpen) {
      loadAvailableProcesses();
    }
  }, [isOpen, teamId, toast]);

  const handleSubmit = async (data: ConnectProcessFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/teams/${teamId}/processes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          processId: data.processId,
          isExisting: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore nel collegamento del processo");
      }

      toast({
        title: "Processo collegato",
        description: "Il processo è stato collegato al team con successo",
      });

      form.reset();
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description:
          error instanceof Error
            ? error.message
            : "Errore nel collegamento del processo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4 mr-2" />
          )}
          Collega
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Collega Processo Esistente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="processId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processo</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un processo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableProcesses.map((process) => (
                        <SelectItem key={process.id} value={process.id}>
                          {process.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              Collega Processo
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
