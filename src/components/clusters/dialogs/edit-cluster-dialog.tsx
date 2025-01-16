'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ClusterForm } from "../forms/cluster-form"
import type { ClusterFormValues } from "../forms/cluster-schema"

interface EditClusterDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: ClusterFormValues) => Promise<void>
  onDelete: () => Promise<void>
  initialData: ClusterFormValues
}

export function EditClusterDialog({
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  initialData
}: EditClusterDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ClusterFormValues) => {
    try {
      setIsLoading(true)
      await onUpdate(data)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await onDelete()
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
          <DialogTitle>Modifica Cluster</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ClusterForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full"
          >
            ELIMINA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
