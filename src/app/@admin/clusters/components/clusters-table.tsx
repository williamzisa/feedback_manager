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
import { EditClusterDialog } from "./dialogs/edit-cluster-dialog";
import type { Cluster } from "@/lib/types/clusters";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/supabase/queries";

interface ClustersTableProps {
  clusters: Cluster[];
  onSuccess?: () => void;
}

export function ClustersTable({ clusters, onSuccess }: ClustersTableProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  // Ottieni tutti gli utenti per trovare i leader
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: queries.users.getAll
  });

  // Funzione per trovare il leader di un cluster
  const findLeader = (leaderId: string | null) => {
    if (!leaderId) return null;
    return users.find(u => u.id === leaderId);
  };

  const handleEdit = (cluster: Cluster) => {
    setSelectedCluster(cluster);
    setIsEditOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CLUSTER</TableHead>
            <TableHead>CLUSTER LEADER</TableHead>
            <TableHead>LIVELLO</TableHead>
            <TableHead>N.TEAM</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.map((cluster) => {
            const leader = findLeader(cluster.leader);
            return (
              <TableRow key={cluster.id}>
                <TableCell className="font-medium">{cluster.name}</TableCell>
                <TableCell>
                  {leader
                    ? `${leader.name} ${leader.surname}`
                    : "-"}
                </TableCell>
                <TableCell>{cluster.level ?? "-"}</TableCell>
                <TableCell>{cluster.team_count}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(cluster)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {(!clusters || clusters.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                Nessun cluster trovato
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EditClusterDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        cluster={selectedCluster}
        onSuccess={onSuccess}
      />
    </>
  );
}
