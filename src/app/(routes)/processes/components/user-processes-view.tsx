import { getUserProcesses } from "@/lib/supabase/server";
import { ProcessesTable } from "./processes-table";
import { ProcessAssignmentDialog } from "./process-assignment-dialog";
import { getAvailableTeamProcesses } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface UserProcessesViewProps {
  userId: string;
}

export async function UserProcessesView({ userId }: UserProcessesViewProps) {
  const [processes, availableProcesses] = await Promise.all([
    getUserProcesses(userId),
    getAvailableTeamProcesses(userId),
  ]);

  // Estrai gli ID dei processi già assegnati
  const assignedProcessIds = processes.map((process) => process.id);

  return (
    <div className="rounded-lg border bg-white shadow-sm mb-20">
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">I tuoi processi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Visualizza e gestisci i processi a te assegnati o associati ai tuoi
            team
          </p>
        </div>
        <ProcessAssignmentDialog
          userId={userId}
          availableProcesses={availableProcesses}
          assignedProcessIds={assignedProcessIds}
          onAssign={async () => {
            "use server";
            revalidatePath("/processes");
          }}
        />
      </div>

      <div className="p-6 border-t">
        {processes.length === 0 ? (
          <div className="text-center text-gray-500">
            Non hai ancora processi assegnati
          </div>
        ) : (
          <ProcessesTable
            processes={processes}
            userId={userId}
            onRemove={async () => {
              "use server";
              revalidatePath("/processes");
            }}
          />
        )}
      </div>
    </div>
  );
}
