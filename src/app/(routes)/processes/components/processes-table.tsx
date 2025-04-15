"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { removeProcessFromUser } from "@/lib/supabase/server";
import { toast } from "sonner";
import { useState } from "react";

interface Process {
  id: string;
  name: string;
  question: {
    id: string;
    description: string;
    type: string;
  } | null;
  team: string | null;
  created_at: string;
}

interface ProcessesTableProps {
  processes: Process[];
  userId: string;
  onRemove: () => Promise<void>;
}

export function ProcessesTable({
  processes,
  userId,
  onRemove,
}: ProcessesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filteredProcesses = processes.filter(
    (process) =>
      process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.question?.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (process.team &&
        process.team.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRemove = async (processId: string) => {
    try {
      setLoading(processId);
      const result = await removeProcessFromUser(userId, processId);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Processo rimosso con successo");
      await onRemove();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Errore nella rimozione del processo"
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Cerca per nome, domanda o team..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Domanda Collegata</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="w-[100px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProcesses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                Nessun processo trovato
              </TableCell>
            </TableRow>
          ) : (
            filteredProcesses.map((process) => (
              <TableRow key={process.id}>
                <TableCell className="font-medium">{process.name}</TableCell>
                <TableCell>
                  {process.question?.description || "Nessuna domanda collegata"}
                </TableCell>
                <TableCell>{process.team || "Nessun team"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(process.id)}
                    disabled={loading === process.id}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
