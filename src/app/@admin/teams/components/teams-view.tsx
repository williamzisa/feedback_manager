"use client";

import { StatCard } from "@/components/stats/stat-card";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TeamsTable } from "./teams-table";
import { CreateTeamDialog } from "./dialogs/create-team-dialog";
import { EditTeamDialog } from "./dialogs/edit-team-dialog";
import { queries } from "@/lib/supabase/queries";
import type { Team } from "@/lib/types/teams";

export function TeamsView() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [totalClusters, setTotalClusters] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await queries.teams.getAll();
      setTeams(data);
    } catch (err) {
      console.error('Errore nel caricamento dei team:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei team. Controlla la console per i dettagli.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClusters = async () => {
    try {
      const clusters = await queries.clusters.getAll();
      setTotalClusters(clusters.length);
    } catch (err) {
      console.error('Errore nel caricamento dei cluster:', err);
    }
  };

  useEffect(() => {
    loadTeams();
    loadClusters();
  }, []);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leader?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leader?.surname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcola le statistiche
  const totalTeams = teams.length;
  const projectTeams = teams.filter((t) => t.is_project).length;
  const totalMembers = teams.reduce((acc, team) => acc + (team.user_teams?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Header Section */}
        <div className="mb-6 flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestione Teams
          </h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard title="TOTALE CLUSTERS" value={totalClusters} />
          <StatCard title="TOTALE TEAMS" value={totalTeams} />
          <StatCard
            title="TEAMS DI PROGETTO"
            value={projectTeams}
            className="bg-blue-100"
          />
          <StatCard title="TOTALE MEMBERS" value={totalMembers} />
        </div>

        {/* Teams Table Section */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-500">{teams.length} teams</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-96">
                <Input
                  type="search"
                  placeholder="Cerca Team"
                  className="w-full bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="w-full sm:w-auto whitespace-nowrap"
                onClick={() => setIsCreateOpen(true)}
              >
                Nuovo Team
              </Button>
            </div>
            <TeamsTable 
              teams={filteredTeams} 
              onSuccess={loadTeams}
              isLoading={isLoading} 
            />
          </div>
        </div>
      </main>

      <CreateTeamDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={loadTeams}
      />

      <EditTeamDialog
        team={selectedTeam}
        open={!!selectedTeam}
        onOpenChange={(open) => !open && setSelectedTeam(null)}
        onSuccess={loadTeams}
      />
    </div>
  );
}
