"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { removeProcessFromTeam } from "@/lib/supabase/server";

interface TeamProcess {
  id: string;
  process: {
    id: string;
    name: string;
    linked_question: {
      id: string;
      description: string;
    } | null;
  };
}

interface TeamProcessesTableProps {
  teamId: string;
  processes: TeamProcess[];
}

export function TeamProcessesTable({
  teamId,
  processes,
}: TeamProcessesTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRemoveProcess = async (processId: string) => {
    try {
      setIsLoading(processId);
      const result = await removeProcessFromTeam(teamId, processId);

      if (!result.success) {
        throw new Error(result.error || "Errore nella rimozione del processo");
      }

      toast({
        title: "Processo rimosso",
        description: "Il processo è stato rimosso con successo dal team",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description:
          error instanceof Error
            ? error.message
            : "Errore nella rimozione del processo",
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (processes.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Nessun processo associato a questo team
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome Processo</TableHead>
          <TableHead>Domanda Collegata</TableHead>
          <TableHead className="w-[100px]">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processes.map((teamProcess) => (
          <TableRow key={teamProcess.id}>
            <TableCell>{teamProcess.process.name}</TableCell>
            <TableCell>
              {teamProcess.process.linked_question?.description ||
                "Nessuna domanda collegata"}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveProcess(teamProcess.process.id)}
                disabled={isLoading === teamProcess.process.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
