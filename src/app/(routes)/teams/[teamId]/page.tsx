import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
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

  if (!params?.teamId) {
    notFound();
  }

  const teamDetails = await getTeamDetails(params.teamId, user.id);
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
    <div className="min-h-screen bg-gray-50">
      <Header title={teamDetails.name} showBackButton backUrl="/teams" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-6">
          {/* Info Team */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>Informazioni Team</CardTitle>
                {teamDetails.is_project && (
                  <Badge variant="secondary">Progetto</Badge>
                )}
              </div>
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
                teamId={params.teamId}
                connectedTeams={teamDetails.connected_teams}
                availableTeams={availableTeams}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
