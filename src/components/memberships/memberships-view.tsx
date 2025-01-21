'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MembershipsTable } from './memberships-table'
import { CreateMembershipDialog } from './dialogs/create-membership-dialog'
import { EditMembershipDialog } from './dialogs/edit-membership-dialog'
import type { Membership } from '@/lib/types/memberships'

interface MembershipsViewProps {
  memberships: Membership[]
  onSuccess: () => void
}

export function MembershipsView({ memberships, onSuccess }: MembershipsViewProps) {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null)
  const [userFilter, setUserFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')

  // Filtra le membership in base ai criteri di ricerca
  const filteredMemberships = memberships.filter(membership => {
    const userName = membership.user ? `${membership.user.name} ${membership.user.surname}`.toLowerCase() : ''
    const teamName = membership.team?.name?.toLowerCase() ?? ''
    const searchUser = userFilter.toLowerCase()
    const searchTeam = teamFilter.toLowerCase()

    return (!userFilter || userName.includes(searchUser)) && 
           (!teamFilter || teamName.includes(searchTeam))
  })

  const handleEdit = (membership: Membership) => {
    setEditingMembership(membership)
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['memberships'] })
    onSuccess()
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Cerca User"
              className="w-full"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Input
              type="search"
              placeholder="Cerca Team"
              className="w-full"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            />
          </div>
        </div>
        <Button 
          className="w-full sm:w-auto whitespace-nowrap"
          onClick={() => setIsCreateOpen(true)}
        >
          Nuova Membership
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">{filteredMemberships.length} risultati</p>
        </div>
        <div className="p-4 overflow-x-auto">
          <MembershipsTable 
            memberships={filteredMemberships}
            onEdit={handleEdit}
          />
        </div>
      </div>

      <CreateMembershipDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleSuccess}
      />

      <EditMembershipDialog
        membership={editingMembership}
        open={editingMembership !== null}
        onOpenChange={(open) => !open && setEditingMembership(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
