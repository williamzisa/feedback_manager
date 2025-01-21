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
import { Badge } from '@/components/ui/badge'

interface MembershipsTableProps {
  memberships: Membership[]
  onEdit: (membership: Membership) => void
}

export function MembershipsTable({ memberships, onEdit }: MembershipsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead className="hidden md:table-cell">Team</TableHead>
            <TableHead className="hidden lg:table-cell">Progetto</TableHead>
            <TableHead className="hidden lg:table-cell">Cluster Leader</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships?.map((membership) => (
            <TableRow key={membership.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {membership.user?.name} {membership.user?.surname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {membership.user?.email}
                  </div>
                  {/* Info aggiuntive visibili solo su mobile */}
                  <div className="md:hidden space-y-1 text-sm text-gray-500">
                    <div>Team: {membership.team?.name}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Progetto: {membership.team?.project ? 'Sì' : 'No'}</span>
                      <span className="hidden xs:inline">•</span>
                      <span>Cluster Leader: {membership.team?.isclusterleader ? 'Sì' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {membership.team?.name}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {membership.team?.project ? (
                  <Badge variant="secondary">Sì</Badge>
                ) : (
                  <Badge variant="default">No</Badge>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {membership.team?.isclusterleader ? (
                  <Badge variant="secondary">Sì</Badge>
                ) : (
                  <Badge variant="default">No</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(membership)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!memberships || memberships.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                Nessuna membership trovata
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
