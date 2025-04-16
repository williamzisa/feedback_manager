"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { queries } from "@/lib/supabase/queries";
import type { ConnectedTeam } from "@/lib/types/teams";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  PlusCircle,
  X,
  Link as LinkIcon,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface TeamConnectionsManagerProps {
  teamId: string;
  connectedTeams: ConnectedTeam[];
  availableTeams: ConnectedTeam[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function TeamConnectionsManager({
  teamId,
  connectedTeams,
  availableTeams,
  onSuccess,
  isLoading: externalLoading,
}: TeamConnectionsManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentConnected, setCurrentConnected] = useState<ConnectedTeam[]>([]);
  const [currentAvailable, setCurrentAvailable] = useState<ConnectedTeam[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Inizializzazione dei dati quando cambiano le props
  useEffect(() => {
    setCurrentConnected(connectedTeams);
    setCurrentAvailable(availableTeams);
    setIsInitializing(false);
  }, [connectedTeams, availableTeams]);

  // Filtra i team disponibili in base alla ricerca
  const filteredAvailableTeams = useMemo(() => {
    if (!searchQuery.trim()) return currentAvailable;

    return currentAvailable.filter((team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentAvailable, searchQuery]);

  // Calcola i team collegati da mostrare in base alla paginazione
  const paginatedConnectedTeams = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return currentConnected.slice(startIndex, startIndex + itemsPerPage);
  }, [currentConnected, currentPage, itemsPerPage]);

  // Calcola il numero totale di pagine
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(currentConnected.length / itemsPerPage)),
    [currentConnected.length, itemsPerPage]
  );

  const handleConnect = async (connectTeamId: string) => {
    setIsLoading(true);

    try {
      await queries.teams.createTeamConnection(teamId, connectTeamId);

      // Aggiorna le liste locali
      const teamToConnect = currentAvailable.find(
        (t) => t.id === connectTeamId
      );
      if (teamToConnect) {
        setCurrentConnected([...currentConnected, teamToConnect]);
        setCurrentAvailable(
          currentAvailable.filter((t) => t.id !== connectTeamId)
        );
      }

      toast.success("Team connesso con successo");
      onSuccess?.();
    } catch (error) {
      console.error("Errore nella connessione del team:", error);
      toast.error("Errore nella connessione del team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (disconnectTeamId: string) => {
    setIsLoading(true);

    try {
      await queries.teams.deleteTeamConnection(teamId, disconnectTeamId);

      // Aggiorna le liste locali
      const teamToDisconnect = currentConnected.find(
        (t) => t.id === disconnectTeamId
      );
      if (teamToDisconnect) {
        setCurrentAvailable([...currentAvailable, teamToDisconnect]);
        setCurrentConnected(
          currentConnected.filter((t) => t.id !== disconnectTeamId)
        );
      }

      // Se dopo la rimozione la pagina corrente è vuota, torna alla pagina precedente
      if (
        currentPage > 1 &&
        (currentPage - 1) * itemsPerPage >= currentConnected.length - 1
      ) {
        setCurrentPage(currentPage - 1);
      }

      toast.success("Connessione rimossa con successo");
      onSuccess?.();
    } catch (error) {
      console.error("Errore nella rimozione della connessione:", error);
      toast.error("Errore nella rimozione della connessione");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing || externalLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Connessi</CardTitle>
          <CardDescription>
            Team attualmente connessi a questo team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentConnected.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              Nessun team connesso
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedConnectedTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{team.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(team.id)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {currentConnected.length > itemsPerPage && (
          <CardFooter className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-500">
              Pagina {currentPage} di {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Disponibili</CardTitle>
          <CardDescription>
            Team che puoi connettere a questo team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredAvailableTeams.length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              {currentAvailable.length === 0
                ? "Nessun team disponibile per la connessione"
                : "Nessun team trovato con la ricerca corrente"}
            </div>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {filteredAvailableTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span>{team.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(team.id)}
                    disabled={isLoading}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Connetti
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
