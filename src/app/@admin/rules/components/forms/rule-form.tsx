'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RuleFormData } from "@/lib/types/rules"
import { ruleSchema } from "./rule-schema"

interface RuleFormProps {
  initialData?: RuleFormData
  onSubmit: (data: RuleFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
}

export function RuleForm({
  initialData,
  onSubmit,
  onDelete,
  isLoading,
  mode
}: RuleFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      content_sql: initialData?.content_sql || '',
      number: initialData?.number || 0
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Regola</Label>
        <Input
          id="name"
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrizione</Label>
        <Input
          id="description"
          {...register("description")}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content_sql">Codice SQL</Label>
        <Input
          id="content_sql"
          {...register("content_sql")}
          disabled={isLoading}
        />
        {errors.content_sql && (
          <p className="text-sm text-red-500">{errors.content_sql.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="number">Numero</Label>
        <Input
          id="number"
          type="number"
          {...register("number", { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.number && (
          <p className="text-sm text-red-500">{errors.number.message}</p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {mode === 'create' ? 'Crea Regola' : 'Salva Modifiche'}
        </Button>

        {mode === 'edit' && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            Elimina
          </Button>
        )}
      </div>
    </form>
  )
} 
