'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { EditClusterDialog } from './dialogs/edit-cluster-dialog'
import type { Cluster } from '@/lib/types/clusters'

interface ClustersTableProps {
  clusters: Cluster[]
  onSuccess?: () => void
}

export function ClustersTable({ clusters, onSuccess }: ClustersTableProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)

  const handleEdit = (cluster: Cluster) => {
    setSelectedCluster(cluster)
    setIsEditOpen(true)
  }

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
          {clusters.map((cluster) => (
            <TableRow key={cluster.id}>
              <TableCell className="font-medium">{cluster.name}</TableCell>
              <TableCell>
                {cluster.leader
                  ? `${cluster.leader.name} ${cluster.leader.surname}`
                  : '-'}
              </TableCell>
              <TableCell>{cluster.level ?? '-'}</TableCell>
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
          ))}
        </TableBody>
      </Table>

      <EditClusterDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        cluster={selectedCluster}
        onSuccess={onSuccess}
      />
    </>
  )
}
