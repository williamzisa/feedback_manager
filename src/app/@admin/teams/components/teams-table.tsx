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
import { Edit } from "lucide-react";
import { EditTeamDialog } from "./dialogs/edit-team-dialog";
import type { Team } from "@/lib/types/teams";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamsTableProps {
  teams: Team[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function TeamsTable({ teams, onSuccess, isLoading }: TeamsTableProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="block sm:hidden">
        {teams.map((team) => (
          <div key={team.id} className="mb-4 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{team.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(team)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Cluster:</span>{" "}
                {team.team_clusters?.[0]?.cluster?.name || "-"}
              </div>
              <div>
                <span className="font-medium">Team Leader:</span>{" "}
                {`${team.leader?.name || ""} ${team.leader?.surname || ""}`}
              </div>
              <div>
                <span className="font-medium">Members:</span>{" "}
                {team.user_teams?.length || 0}
              </div>
              <div className="flex flex-wrap gap-2">
                {team.is_project && <Badge variant="outline">Progetto</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TEAM</TableHead>
              <TableHead>CLUSTER</TableHead>
              <TableHead>TEAM LEADER</TableHead>
              <TableHead>MEMBERS</TableHead>
              <TableHead>PROGETTO</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>
                  {team.team_clusters?.[0]?.cluster?.name || "-"}
                </TableCell>
                <TableCell>{`${team.leader?.name || ""} ${
                  team.leader?.surname || ""
                }`}</TableCell>
                <TableCell>{team.user_teams?.length || 0}</TableCell>
                <TableCell>
                  <Badge variant={team.is_project ? "default" : "secondary"}>
                    {team.is_project ? "Sì" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Nessun team trovato
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTeam && (
        <EditTeamDialog
          team={selectedTeam}
          open={!!selectedTeam}
          onOpenChange={(open) => !open && setSelectedTeam(null)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
