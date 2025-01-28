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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { queries } from "@/lib/supabase/queries"
import { useQuery } from "@tanstack/react-query"

const formSchema = z.object({
  name: z.string().min(1, "Il nome della sessione è obbligatorio"),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  clusters: z.array(z.string()).min(1, "Seleziona almeno un cluster"),
  rules: z.array(z.string()).min(1, "Seleziona almeno una regola")
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
  // Otteniamo la company dell'utente corrente
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: queries.users.getCurrentUser
  })

  // Otteniamo i cluster della company
  const { data: clusters = [] } = useQuery({
    queryKey: ['clusters', currentUser?.company],
    queryFn: () => currentUser?.company ? queries.clusters.getAll() : Promise.resolve([]),
    enabled: !!currentUser?.company
  })

  // Otteniamo le regole della company
  const { data: rules = [] } = useQuery({
    queryKey: ['rules', currentUser?.company],
    queryFn: () => currentUser?.company ? queries.rules.getByCompany(currentUser.company) : Promise.resolve([]),
    enabled: !!currentUser?.company
  })

  const defaultValues: Partial<SessionFormData> = {
    name: initialData?.name || '',
    start_time: initialData?.start_time || null,
    end_time: initialData?.end_time || null,
    clusters: initialData?.session_clusters?.map(sc => sc.cluster.id) || [],
    rules: initialData?.session_rules?.map(sr => sr.rule.id) || []
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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
                        const cluster = clusters.find(c => c.id === clusterId)
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
                        {clusters.map((cluster) => (
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
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regole</FormLabel>
                  <div className="border rounded-md p-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value.map((ruleId) => {
                        const rule = rules.find(r => r.id === ruleId)
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
                        {rules.map((rule) => (
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
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Inizio</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ''} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Fine</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ''} 
                    disabled={isLoading} 
                  />
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