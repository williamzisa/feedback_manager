'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit } from 'lucide-react'
import type { Membership } from '@/lib/types/memberships'

interface MembershipsTableProps {
  memberships: Membership[]
  onEdit?: (membership: Membership) => void
}

export function MembershipsTable({ memberships, onEdit }: MembershipsTableProps) {
  return (
    <>
      {/* Versione Mobile */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {memberships.map((membership) => (
          <div key={membership.id} className="bg-white space-y-3 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-2 text-sm">
              <div className="text-gray-900 font-bold">
                {membership.user?.name} {membership.user?.surname}
              </div>
              <div className="text-gray-500">{membership.team?.name}</div>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Cluster:</span>{' '}
              {membership.team?.team_clusters?.[0]?.cluster?.name || '-'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(membership)}
              className="w-full justify-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              <span>Modifica</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Versione Desktop */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utente</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Cluster</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberships.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell className="font-medium">
                  {membership.user?.name} {membership.user?.surname}
                </TableCell>
                <TableCell>{membership.team?.name}</TableCell>
                <TableCell>
                  {membership.team?.team_clusters?.[0]?.cluster?.name || '-'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(membership)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
