'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ClusterForm } from "../forms/cluster-form"
import type { ClusterFormValues } from "../forms/cluster-schema"

interface CreateClusterDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: ClusterFormValues) => Promise<void>
}

export function CreateClusterDialog({
  isOpen,
  onClose,
  onCreate
}: CreateClusterDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ClusterFormValues) => {
    try {
      setIsLoading(true)
      await onCreate(data)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Cluster</DialogTitle>
        </DialogHeader>
        <ClusterForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
