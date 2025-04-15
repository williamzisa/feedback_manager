import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser, getTeamDetails } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamConnectionsManager } from "./components/team-connections-manager";
import { queries } from "@/lib/supabase/queries";

interface TeamPageProps {
  params: {
    teamId: string;
  };
}

export const metadata: Metadata = {
  title: "Dettaglio Team | Feedback Manager",
  description: "Visualizza e gestisci i dettagli del team",
};

export default async function TeamPage({ params }: TeamPageProps) {
  const user = await getCurrentUser();
  const { teamId } = params;

  const teamDetails = await getTeamDetails(teamId, user.id);
  if (!teamDetails) {
    notFound();
  }

  // Recupera tutti i team disponibili per le connessioni
  const allTeams = await queries.teams.getAll();
  const availableTeams = allTeams.map((team) => ({
    id: team.id,
    name: team.name,
  }));

  return (
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {teamDetails.name}
          </h1>
          {teamDetails.is_project && (
            <Badge variant="secondary">Progetto</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Team */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Team Leader</h3>
              <p className="text-muted-foreground">
                {teamDetails.leader
                  ? `${teamDetails.leader.name} ${teamDetails.leader.surname}`
                  : "Non assegnato"}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Cluster</h3>
              {teamDetails.clusters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teamDetails.clusters.map((cluster) => (
                    <Badge key={cluster.id} variant="outline">
                      {cluster.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nessun cluster associato
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Connessi */}
        <Card>
          <CardHeader>
            <CardTitle>Team Connessi</CardTitle>
            <CardDescription>
              Gestisci le connessioni con altri team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TeamConnectionsManager
              teamId={teamId}
              connectedTeams={teamDetails.connected_teams}
              availableTeams={availableTeams}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
