'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RuleForm } from "../forms/rule-form"
import type { Rule, RuleFormData } from "@/lib/types/rules"
import { queries } from "@/lib/supabase/queries"

interface EditRuleDialogProps {
  rule: Rule | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditRuleDialog({
  rule,
  onOpenChange,
  onSuccess
}: EditRuleDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: RuleFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!rule) {
        throw new Error('Nessuna regola selezionata per la modifica')
      }

      await queries.rules.update(rule.id, {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        content_sql: data.content_sql.trim(),
        number: data.number,
        template: rule.template
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante la modifica della regola')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!rule) return

      await queries.rules.delete(rule.id)

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Errore:', err)
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione della regola')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={!!rule} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Modifica Regola</DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          {rule && (
            <RuleForm
              initialData={{
                name: rule.name,
                description: rule.description || '',
                content_sql: rule.content_sql,
                number: rule.number
              }}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              isLoading={isLoading}
              mode="edit"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 