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
}

export function MembershipsView({ memberships = [] }: MembershipsViewProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Filtra le membership in base alla ricerca
  const filteredMemberships = memberships.filter(membership => {
    const searchLower = searchQuery.toLowerCase()
    const userName = `${membership.user?.name} ${membership.user?.surname}`.toLowerCase()
    const teamName = membership.team?.name?.toLowerCase() || ''
    const clusterName = membership.team?.team_clusters?.[0]?.cluster?.name?.toLowerCase() || ''
    
    return userName.includes(searchLower) || 
           teamName.includes(searchLower) || 
           clusterName.includes(searchLower)
  })

  const handleEdit = (membership: Membership) => {
    setSelectedMembership(membership)
    setIsEditOpen(true)
  }

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['memberships'] })
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Cerca per utente, team o cluster"
            className="bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

      {isCreateOpen && (
        <CreateMembershipDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={handleSuccess}
        />
      )}

      {isEditOpen && selectedMembership && (
        <EditMembershipDialog
          membership={selectedMembership}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
