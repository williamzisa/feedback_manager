"use client";

import { useState, useTransition } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { queries } from "@/lib/supabase/queries";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Team {
  id: string;
  name: string;
}

interface TeamConnectionsManagerProps {
  teamId: string;
  connectedTeams: Team[];
  availableTeams: Team[];
}

export function TeamConnectionsManager({
  teamId,
  connectedTeams: initialConnectedTeams,
  availableTeams,
}: TeamConnectionsManagerProps) {
  const [connectedTeams, setConnectedTeams] = useState(initialConnectedTeams);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTeamId, setPendingTeamId] = useState<string | null>(null);

  const determineTeamOrder = (
    firstId: string,
    secondId: string
  ): [string, string] => {
    // Garantisce che vengano sempre restituiti esattamente due elementi
    const [first, second] = [firstId, secondId].sort();
    return [first, second] as [string, string];
  };

  const handleConnect = async (selectedTeamId: string) => {
    const selectedTeam = availableTeams.find(
      (team) => team.id === selectedTeamId
    );
    if (!selectedTeam) return;

    setPendingTeamId(selectedTeamId);
    startTransition(async () => {
      try {
        const [first, second] = determineTeamOrder(teamId, selectedTeam.id);
        await queries.teams.createTeamConnection(first, second);
        setConnectedTeams((prev) => [...prev, selectedTeam]);
        setSearchQuery("");
        toast.success("Team connesso con successo");
      } catch (error) {
        console.error("Errore nella connessione del team:", error);
        toast.error("Errore nella connessione del team");
      } finally {
        setPendingTeamId(null);
      }
    });
  };

  const handleDisconnect = async (teamToDisconnect: Team) => {
    setPendingTeamId(teamToDisconnect.id);
    startTransition(async () => {
      try {
        const [first, second] = determineTeamOrder(teamId, teamToDisconnect.id);
        await queries.teams.deleteTeamConnection(first, second);
        setConnectedTeams((prev) =>
          prev.filter((team) => team.id !== teamToDisconnect.id)
        );
        toast.success("Team disconnesso con successo");
      } catch (error) {
        console.error("Errore nella disconnessione del team:", error);
        toast.error("Errore nella disconnessione del team");
      } finally {
        setPendingTeamId(null);
      }
    });
  };

  const availableTeamsForConnection = availableTeams.filter(
    (team) =>
      team.id !== teamId &&
      !connectedTeams.some((connectedTeam) => connectedTeam.id === team.id) &&
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {connectedTeams.length > 0 ? (
          connectedTeams.map((team) => (
            <Badge
              key={team.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {team.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDisconnect(team)}
                disabled={isPending}
              >
                {pendingTeamId === team.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nessun team connesso</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca team..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={handleSearchFocus}
            className="pl-8"
            disabled={isPending}
          />
        </div>

        <Select
          open={isOpen}
          onOpenChange={setIsOpen}
          disabled={isPending || availableTeamsForConnection.length === 0}
          onValueChange={(value) => {
            handleConnect(value);
            setIsOpen(false);
          }}
        >
          <SelectTrigger onClick={() => setIsOpen(true)}>
            <SelectValue
              placeholder={
                availableTeamsForConnection.length === 0
                  ? searchQuery
                    ? "Nessun team trovato"
                    : "Nessun team disponibile"
                  : isPending
                  ? "Connessione in corso..."
                  : "Seleziona un team da connettere"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableTeamsForConnection.map((team) => (
              <SelectItem
                key={team.id}
                value={team.id}
                className="cursor-pointer"
                disabled={pendingTeamId === team.id}
              >
                <span className="flex items-center gap-2">
                  {team.name}
                  {pendingTeamId === team.id && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
