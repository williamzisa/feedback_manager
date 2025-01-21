'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SessionsTable } from './sessions-table'
import { CreateSessionDialog } from './dialogs/create-session-dialog'
import { EditSessionDialog } from './dialogs/edit-session-dialog'
import type { Session } from '@/lib/types/sessions'
import { mockSessionsApi, mockClusters } from '@/lib/data/mock-sessions'
import { PlusCircle } from 'lucide-react'

export function SessionsView() {
  const [sessions, setSessions] = useState<Session[]>(mockSessionsApi.getAll())
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedCluster, setSelectedCluster] = useState<string>('all')
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.nomeSessione.toLowerCase().includes(search.toLowerCase())
    const matchesStartDate = !startDate || (session.dataInizio && session.dataInizio >= startDate)
    const matchesEndDate = !endDate || (session.dataFine && session.dataFine <= endDate)
    const matchesCluster = selectedCluster === 'all' || session.clusters?.includes(selectedCluster)
    return matchesSearch && matchesStartDate && matchesEndDate && matchesCluster
  })

  const handleCreate = (data: Omit<Session, 'id' | 'clusterPartecipanti' | 'teamPartecipanti' | 'utentiPartecipanti' | 'regoleApplicate' | 'feedbackGenerati' | 'stato'>) => {
    const newSession = mockSessionsApi.create(data)
    setSessions(prev => [...prev, newSession])
    setIsCreateDialogOpen(false)
  }

  const handleEdit = (id: string, data: Partial<Session>) => {
    const updatedSession = mockSessionsApi.update(id, data)
    setSessions(prev => prev.map(s => s.id === id ? updatedSession : s))
    setEditingSession(null)
  }

  const handleDelete = (id: string) => {
    mockSessionsApi.delete(id)
    setSessions(prev => prev.filter(s => s.id !== id))
    setEditingSession(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Cerca sessione..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px]"
          />
          <Select value={selectedCluster} onValueChange={setSelectedCluster}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleziona cluster" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i cluster</SelectItem>
              {mockClusters.map((cluster) => (
                <SelectItem key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Data Inizio"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[200px]"
          />
          <Input
            type="date"
            placeholder="Data Fine"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[200px]"
          />
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-2 self-end"
        >
          <PlusCircle className="h-4 w-4" />
          Nuova Sessione
        </Button>
      </div>

      <SessionsTable 
        sessions={filteredSessions}
        onEdit={setEditingSession}
      />

      <CreateSessionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
      />

      {editingSession && (
        <EditSessionDialog
          session={editingSession}
          onSubmit={(data) => handleEdit(editingSession.id, data)}
          onDelete={() => handleDelete(editingSession.id)}
          open={!!editingSession}
          onOpenChange={(open) => !open && setEditingSession(null)}
        />
      )}
    </div>
  )
} 