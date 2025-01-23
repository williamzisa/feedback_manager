'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserForm } from "@/components/users/forms/user-form"
import { useState } from "react"
import { UserFormData } from '@/lib/types/users'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UserFormData) => Promise<boolean>
  onSuccess: () => void
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  onSuccess
}: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: UserFormData) => {
    try {
      console.log('Creating user with data:', data) // Debug
      setIsLoading(true)
      setError(null)
      const success = await onSubmit({
        ...data,
        role: data.role || 'user',
        isMentor: false,
        isActive: true
      })
      if (success) {
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating user:', error) // Debug
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Errore durante la creazione dell\'utente')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuovo Utente</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        <UserForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
} 