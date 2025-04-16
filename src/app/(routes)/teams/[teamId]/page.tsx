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
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dettaglio Team | Feedback Manager",
  description: "Visualizza e gestisci i dettagli del team",
};

export default async function Page({ params }: { params: { teamId: string } }) {
  // Controllo se teamId è definito
  if (!params?.teamId) {
    notFound();
  }

  // Recupero informazioni utente
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  // Recupero dettagli team
  const teamDetails = await getTeamDetails(params.teamId, user.id);
  if (!teamDetails) {
    notFound();
  }

  // Connessioni team (assicurandoci che non sia undefined)
  const connectedTeams = teamDetails.connected_teams || [];

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
                {teamDetails.clusters && teamDetails.clusters.length > 0 ? (
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

          {/* Team Connessi - Versione semplificata */}
          <Card>
            <CardHeader>
              <CardTitle>Team Connessi</CardTitle>
              <CardDescription>
                Lista dei team connessi a questo team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedTeams.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {connectedTeams.map((team) => (
                    <Badge key={team.id} variant="secondary">
                      {team.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nessun team connesso a questo team
                </p>
              )}
              <div className="mt-4">
                <Link href={`/admin/teams?teamId=${params.teamId}`} passHref>
                  <Button variant="outline" size="sm">
                    Gestisci connessioni
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Processi del Team - Versione semplificata */}
          <Card>
            <CardHeader>
              <CardTitle>Processi del Team</CardTitle>
              <CardDescription>
                Gestisci i processi associati a questo team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Visualizza e gestisci i processi del team
                </p>
                <Link
                  href={`/admin/processes?teamId=${params.teamId}`}
                  passHref
                >
                  <Button>Gestisci Processi</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
