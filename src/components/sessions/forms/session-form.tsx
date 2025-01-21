'use client'

import * as React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Session, SessionFormData } from "@/lib/types/sessions"
import { Loader2, X } from "lucide-react"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { mockClusters, mockRules } from "@/lib/data/mock-sessions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  nomeSessione: z.string().min(1, "Il nome della sessione è obbligatorio"),
  dataInizio: z.string().optional(),
  dataFine: z.string().optional(),
  clusters: z.array(z.string()).min(1, "Seleziona almeno un cluster"),
  regole: z.array(z.string()).min(1, "Seleziona almeno una regola")
})

interface SessionFormProps {
  onSubmit: (data: SessionFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  initialData?: Session
  mode?: 'create' | 'edit'
}

export function SessionForm({
  onSubmit,
  onDelete,
  isLoading = false,
  initialData,
  mode = 'create'
}: SessionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeSessione: initialData?.nomeSessione || '',
      dataInizio: initialData?.dataInizio || '',
      dataFine: initialData?.dataFine || '',
      clusters: initialData?.clusters || [],
      regole: initialData?.regole || []
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nomeSessione"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Sessione</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === 'create' && (
          <>
            <FormField
              control={form.control}
              name="clusters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cluster</FormLabel>
                  <div className="border rounded-md p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value.map((clusterId) => {
                        const cluster = mockClusters.find(c => c.id === clusterId)
                        return cluster ? (
                          <Badge key={cluster.id} variant="secondary" className="gap-1">
                            {cluster.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                field.onChange(field.value.filter(id => id !== cluster.id))
                              }}
                            />
                          </Badge>
                        ) : null
                      })}
                    </div>
                    <Select
                      value="none"
                      onValueChange={(value) => {
                        if (value !== "none" && !field.value.includes(value)) {
                          field.onChange([...field.value, value])
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Aggiungi cluster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockClusters.map((cluster) => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regole</FormLabel>
                  <div className="border rounded-md p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value.map((ruleId) => {
                        const rule = mockRules.find(r => r.id === ruleId)
                        return rule ? (
                          <Badge key={rule.id} variant="secondary" className="gap-1">
                            {rule.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                field.onChange(field.value.filter(id => id !== rule.id))
                              }}
                            />
                          </Badge>
                        ) : null
                      })}
                    </div>
                    <Select
                      value="none"
                      onValueChange={(value) => {
                        if (value !== "none" && !field.value.includes(value)) {
                          field.onChange([...field.value, value])
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Aggiungi regola" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataInizio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Inizio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataFine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Fine</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                'Elimina'
              )}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : mode === 'create' ? (
              'Crea Sessione'
            ) : (
              'Salva'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 