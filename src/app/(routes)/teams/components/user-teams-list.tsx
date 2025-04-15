import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Leader {
  id: string;
  name: string;
  surname: string;
}

interface Cluster {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  is_project: boolean;
  leader: Leader | null;
  clusters: Cluster[];
}

interface UserTeamsListProps {
  teams: Team[];
}

export function UserTeamsList({ teams }: UserTeamsListProps) {
  if (!teams.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Non sei ancora membro di nessun team
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/teams/${team.id}`}
          className="block transition-transform hover:scale-[1.02]"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="line-clamp-1">{team.name}</CardTitle>
                {team.is_project && <Badge variant="secondary">Progetto</Badge>}
              </div>
              <CardDescription>
                Team Leader:{" "}
                {team.leader
                  ? `${team.leader.name} ${team.leader.surname}`
                  : "Non assegnato"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {team.clusters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {team.clusters.map((cluster) => (
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
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
