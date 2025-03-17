'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClusterForm } from "../forms/cluster-form"
import type { ClusterFormData } from "@/lib/types/clusters"
import { queries } from "@/lib/supabase/queries"

interface CreateClusterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateClusterDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateClusterDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ClusterFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!data.name.trim()) {
        throw new Error('Il nome del cluster è obbligatorio')
      }

      const currentUser = await queries.users.getCurrentUser()
      if (!currentUser.company) {
        throw new Error('Company non configurata per questo utente')
      }

      await queries.clusters.create({
        name: data.name.trim(),
        level: data.level,
        leader: data.leader,
        company: currentUser.company
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Error creating cluster:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la creazione del cluster')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Crea Cluster</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <ClusterForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
