'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RuleForm } from "../forms/rule-form"
import type { RuleFormData } from "@/lib/types/rules"
import { queries } from "@/lib/supabase/queries"

interface CreateRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateRuleDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateRuleDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: RuleFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Otteniamo la company dell'utente corrente
      const currentUser = await queries.users.getCurrentUser();
      
      if (!currentUser.company) {
        throw new Error('Errore: account non configurato correttamente (company mancante)');
      }

      await queries.rules.create({
        name: data.name.trim(),
        description: data.description?.trim() || '',
        content_sql: data.content_sql.trim(),
        number: data.number,
        template: false,
        company: currentUser.company
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la creazione della regola')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Nuova Regola</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <RuleForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 