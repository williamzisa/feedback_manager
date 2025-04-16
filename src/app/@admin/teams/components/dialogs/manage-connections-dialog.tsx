"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamConnectionsManager } from "../../components/team-connections-manager";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      const loadTeams = async () => {
        setIsLoading(true);
        try {
          // Otteniamo la company del team corrente
          const teamCompany = team.company;

          // Se non abbiamo la company nel team, dobbiamo ottenerla dall'utente corrente
          let companyId: string | undefined = teamCompany || undefined;
          if (!companyId) {
            try {
              // Otteniamo l'utente corrente per la company
              const currentUser = await queries.users.getCurrentUserClient();
              companyId = currentUser.company || undefined;
            } catch (error) {
              console.error(
                "Errore nel recupero della company dell'utente:",
                error
              );
              toast.error("Errore nel recupero dei dati utente");
              setIsLoading(false);
              return;
            }
          }

          if (!companyId) {
            toast.error("Impossibile determinare la company del team");
            setIsLoading(false);
            return;
          }

          // Carica i team connessi
          const connected = await queries.teams.getTeamConnections(team.id);
          setConnectedTeams(connected);

          // Carica tutti i team per avere la lista dei disponibili
          const allTeams = await queries.teams.getAll();

          // Filtra i team che sono:
          // 1. Non il team corrente
          // 2. Non già connesso
          // 3. Della stessa company del team corrente
          const available = allTeams
            .filter(
              (t) =>
                t.id !== team.id &&
                !connected.some((c) => c.id === t.id) &&
                // Verifica che la company corrisponda
                t.company === companyId
            )
            .map((t) => ({ id: t.id, name: t.name }));

          setAvailableTeams(available);
        } catch (error) {
          console.error("Errore nel caricamento dei team:", error);
          toast.error("Errore nel caricamento dei team");
        } finally {
          setIsLoading(false);
        }
      };

      loadTeams();
    }
  }, [open, team.id, team.company]);

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
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
