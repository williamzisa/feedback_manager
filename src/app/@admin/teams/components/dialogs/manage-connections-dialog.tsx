"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamConnectionsManager } from "@/app/(routes)/teams/[teamId]/components/team-connections-manager";
import { queries } from "@/lib/supabase/queries";
import type { Team, ConnectedTeam } from "@/lib/types/teams";
import { toast } from "sonner";

interface ManageConnectionsDialogProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ManageConnectionsDialog({
  team,
  open,
  onOpenChange,
  onSuccess,
}: ManageConnectionsDialogProps) {
  const [connectedTeams, setConnectedTeams] = useState<ConnectedTeam[]>([]);
  const [availableTeams, setAvailableTeams] = useState<ConnectedTeam[]>([]);

  useEffect(() => {
    if (open) {
      const loadTeams = async () => {
        try {
          // Carica i team connessi
          const connected = await queries.teams.getTeamConnections(team.id);
          setConnectedTeams(connected);

          // Carica tutti i team per avere la lista dei disponibili
          const allTeams = await queries.teams.getAll();
          const available = allTeams
            .filter(
              (t) => t.id !== team.id && !connected.some((c) => c.id === t.id)
            )
            .map((t) => ({ id: t.id, name: t.name }));
          setAvailableTeams(available);
        } catch (error) {
          console.error("Errore nel caricamento dei team:", error);
          toast.error("Errore nel caricamento dei team");
        }
      };

      loadTeams();
    }
  }, [open, team.id]);

  const handleSuccess = () => {
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gestisci Connessioni - {team.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <TeamConnectionsManager
            teamId={team.id}
            connectedTeams={connectedTeams}
            availableTeams={availableTeams}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
