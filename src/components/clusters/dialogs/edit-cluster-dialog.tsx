'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClusterForm } from "../forms/cluster-form"
import type { ClusterFormData } from "@/lib/types/clusters"
import type { Cluster } from "@/lib/types/clusters"
import { queries } from "@/lib/supabase/queries"

interface EditClusterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cluster: Cluster | null
  onSuccess?: () => void
}

export function EditClusterDialog({
  open,
  onOpenChange,
  cluster,
  onSuccess
}: EditClusterDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ClusterFormData) => {
    if (!cluster) return
    
    try {
      setIsLoading(true)
      setError(null)

      if (!data.name.trim()) {
        throw new Error('Il nome del cluster è obbligatorio')
      }

      await queries.clusters.update(cluster.id, {
        name: data.name.trim(),
        level: data.level,
        leaderId: data.leaderId
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error updating cluster:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento del cluster')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!cluster) return
    
    try {
      setIsLoading(true)
      setError(null)

      if (cluster.team_count > 0) {
        throw new Error('Non puoi eliminare un cluster che contiene team')
      }

      await queries.clusters.delete(cluster.id)
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error deleting cluster:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione del cluster')
    } finally {
      setIsLoading(false)
    }
  }

  if (!cluster) return null

  const initialData: ClusterFormData = {
    name: cluster.name,
    level: cluster.level,
    leaderId: cluster.leader?.id ?? null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Modifica Cluster</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <ClusterForm
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isLoading={isLoading}
            initialData={initialData}
            mode="edit"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
