"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle, Users } from "lucide-react";
import { assignProcessToUser } from "@/lib/supabase/server";
import Link from "next/link";

interface ProcessAssignmentDialogProps {
  userId: string;
  availableProcesses: Array<{
    id: string;
    name: string;
    team: string | null;
    question: {
      description: string;
    } | null;
  }>;
  assignedProcessIds: string[]; // Aggiungiamo gli ID dei processi già assegnati
  onAssign: () => Promise<void>;
}

export function ProcessAssignmentDialog({
  userId,
  availableProcesses,
  assignedProcessIds,
  onAssign,
}: ProcessAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  // Filtra i processi già assegnati
  const unassignedProcesses = availableProcesses.filter(
    (process) => !assignedProcessIds.includes(process.id)
  );

  // Estrai i team unici dai processi non assegnati
  const teams = Array.from(
    new Set(
      unassignedProcesses
        .map((p) => p.team)
        .filter((team): team is string => team !== null)
    )
  ).sort();

  // Filtra i processi in base al team selezionato
  const filteredProcesses = unassignedProcesses.filter(
    (process) => selectedTeam === "all" || process.team === selectedTeam
  );

  const handleAssign = async (processId: string) => {
    try {
      setLoading(true);
      const result = await assignProcessToUser(userId, processId);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Processo assegnato con successo");
      await onAssign();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Errore nell'assegnazione del processo"
      );
    } finally {
      setLoading(false);
    }
  };

  if (unassignedProcesses.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <PlusCircle className="h-4 w-4 mr-2" />
        Nessun processo disponibile
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Assegna Processo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assegna Nuovo Processo</DialogTitle>
          <DialogDescription>
            Seleziona un processo da assegnare tra quelli disponibili nei tuoi
            team
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i team</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {filteredProcesses.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Nessun processo disponibile per questo team
            </div>
          ) : (
            filteredProcesses.map((process) => (
              <div
                key={process.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">{process.name}</h4>
                  {process.question && (
                    <p className="text-sm text-gray-500">
                      {process.question.description}
                    </p>
                  )}
                  {process.team && (
                    <p className="text-xs text-gray-400">
                      Team: {process.team}
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAssign(process.id)}
                  disabled={loading}
                >
                  Assegna
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="mt-6">
          <Link href="/teams" passHref>
            <Button variant="secondary" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Gestisci Processi Team
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
