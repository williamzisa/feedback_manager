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
  onEdit: (membership: Membership) => void
}

export function MembershipsTable({ memberships, onEdit }: MembershipsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">User</TableHead>
            <TableHead className="hidden md:table-cell w-[45%]">Team</TableHead>
            <TableHead className="w-[10%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships?.map((membership) => (
            <TableRow key={membership.id}>
              <TableCell className="w-[45%]">
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
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell w-[45%]">
                {membership.team?.name}
              </TableCell>
              <TableCell className="w-[10%]">
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
              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                Nessuna membership trovata
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
