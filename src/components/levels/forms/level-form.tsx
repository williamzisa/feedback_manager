'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { levelSchema } from "@/lib/types/levels"
import type { LevelFormData } from "@/lib/types/levels"

interface LevelFormProps {
  onSubmit: (data: LevelFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  initialData?: LevelFormData
  mode?: 'create' | 'edit'
}

export function LevelForm({
  onSubmit,
  onDelete,
  isLoading,
  initialData,
  mode = 'create'
}: LevelFormProps) {
  const form = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      ruolo: initialData?.ruolo ?? '',
      step: initialData?.step ?? '',
      execution: initialData?.execution ?? 0,
      soft: initialData?.soft ?? 0,
      strategy: initialData?.strategy ?? 0,
      standard: initialData?.standard ?? ''
    }
  })

  const handleSubmit = (data: LevelFormData) => {
    // Converti i valori in numeri prima di inviarli
    const formattedData = {
      ...data,
      execution: Number(data.execution),
      soft: Number(data.soft),
      strategy: Number(data.strategy)
    }
    onSubmit(formattedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="ruolo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruolo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Inserisci il ruolo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="step"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Step</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Inserisci lo step" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="execution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Execution</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0}
                    max={100}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                    placeholder="0-100" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Soft</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min={0}
                    max={100}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                    placeholder="0-100" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Strategy</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min={0}
                    max={100}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                    value={field.value || ''}
                    placeholder="0-100" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="standard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standard</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Inserisci lo standard" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
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
          <Button type="submit" disabled={isLoading}>
            {mode === 'create' ? 'Crea Livello' : 'Salva'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 