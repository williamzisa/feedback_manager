'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProcessesTable } from './processes-table'
import { CreateProcessDialog } from './dialogs/create-process-dialog'
import { EditProcessDialog } from './dialogs/edit-process-dialog'
import type { Process } from '@/lib/types/processes'
import { mockProcessesApi } from '@/lib/data/mock-processes'

export function ProcessesView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [processes, setProcesses] = useState<Process[]>(mockProcessesApi.getAll())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredProcesses = processes.filter(process =>
    process.processo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSuccess = () => {
    setProcesses(mockProcessesApi.getAll())
  }

  const handleEditSuccess = () => {
    setProcesses(mockProcessesApi.getAll())
  }

  const handleEdit = (process: Process) => {
    setSelectedProcess(process)
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="search"
            placeholder="Cerca Processo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
          className="w-full sm:w-auto whitespace-nowrap"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Nuovo Processo
        </Button>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b">
          <p className="text-sm text-gray-500">{filteredProcesses.length} risultati</p>
        </div>
        <div className="p-4">
          <ProcessesTable 
            processes={filteredProcesses}
            onEdit={handleEdit}
          />
        </div>
      </div>

      <CreateProcessDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditProcessDialog
        process={selectedProcess}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </>
  )
} 