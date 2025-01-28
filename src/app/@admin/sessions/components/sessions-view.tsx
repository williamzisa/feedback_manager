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
import type { Session, RefetchFunction } from '@/lib/types/sessions'
import { PlusCircle } from 'lucide-react'
import { StatCard } from '@/components/stats/stat-card'
import { queries } from '@/lib/supabase/queries'
import { useQuery } from '@tanstack/react-query'

export function SessionsView() {
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedCluster, setSelectedCluster] = useState<string>('all')
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Otteniamo la company dell'utente corrente
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: queries.users.getCurrentUser
  })

  // Otteniamo i cluster della company
  const { data: clusters = [] } = useQuery({
    queryKey: ['clusters', currentUser?.company],
    queryFn: () => currentUser?.company ? queries.clusters.getAll() : Promise.resolve([]),
    enabled: !!currentUser?.company
  })

  // Otteniamo le sessioni della company
  const { data: sessions = [], refetch: refetchSessions } = useQuery<Session[], Error>({
    queryKey: ['sessions', currentUser?.company],
    queryFn: () => currentUser?.company ? queries.sessions.getByCompany(currentUser.company) : Promise.resolve([]),
    enabled: !!currentUser?.company
  }) as { data: Session[], refetch: RefetchFunction }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(search.toLowerCase())
    const matchesStartDate = !startDate || (session.start_time && session.start_time >= startDate)
    const matchesEndDate = !endDate || (session.end_time && session.end_time <= endDate)
    const matchesCluster = selectedCluster === 'all' || session.session_clusters?.some(sc => sc.cluster.id === selectedCluster)
    return matchesSearch && matchesStartDate && matchesEndDate && matchesCluster
  })

  // Calcola le statistiche
  const totalSessions = sessions.length
  const activeSessions = sessions.filter(s => s.status === 'In corso').length
  const completedSessions = sessions.filter(s => s.status === 'Conclusa').length

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestione Sessioni
          </h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard title="TOTALE SESSIONI" value={totalSessions} />
          <StatCard
            title="SESSIONI ATTIVE"
            value={activeSessions}
            className="bg-blue-100"
          />
          <StatCard
            title="SESSIONI COMPLETATE"
            value={completedSessions}
            className="bg-green-100"
          />
        </div>

        {/* Sessions Table Section */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-500">{sessions.length} sessioni</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Cerca sessione..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-[200px] bg-white"
                />
                <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-white">
                    <SelectValue placeholder="Seleziona cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i cluster</SelectItem>
                    {clusters.map((cluster) => (
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
                  className="w-full sm:w-[200px] bg-white"
                />
                <Input
                  type="date"
                  placeholder="Data Fine"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-[200px] bg-white"
                />
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="w-full sm:w-auto whitespace-nowrap"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuova Sessione
              </Button>
            </div>
            <SessionsTable 
              sessions={filteredSessions}
              onEdit={setEditingSession}
            />
          </div>
        </div>
      </main>

      <CreateSessionDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={refetchSessions}
      />

      {editingSession && (
        <EditSessionDialog
          session={editingSession}
          onSuccess={refetchSessions}
          open={!!editingSession}
          onOpenChange={(open) => !open && setEditingSession(null)}
        />
      )}
    </div>
  )
} 