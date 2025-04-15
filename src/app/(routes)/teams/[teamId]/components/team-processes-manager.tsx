import { getTeamProcesses } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeamProcessesTable } from "./team-processes-table";
import { CreateProcessDialog } from "./dialogs/create-process-dialog";
import { ConnectProcessDialog } from "./dialogs/connect-process-dialog";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamProcessesManagerProps {
  teamId: string;
}

export async function TeamProcessesManager({
  teamId,
}: TeamProcessesManagerProps) {
  const teamProcesses = await getTeamProcesses(teamId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Processi del Team</CardTitle>
            <CardDescription>
              Gestisci i processi associati a questo team
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <CreateProcessDialog teamId={teamId} />
            <ConnectProcessDialog teamId={teamId} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-16">
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <TeamProcessesTable teamId={teamId} processes={teamProcesses} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
