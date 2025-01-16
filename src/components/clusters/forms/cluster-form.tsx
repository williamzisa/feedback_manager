'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { clusterSchema } from "./cluster-schema"
import type { ClusterFormData } from "@/lib/types/clusters"
import { useQuery } from "@tanstack/react-query"
import { queries } from "@/lib/supabase/queries"

const levelOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
]

interface ClusterFormProps {
  onSubmit: (data: ClusterFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  initialData?: ClusterFormData
  mode?: 'create' | 'edit'
}

export function ClusterForm({
  onSubmit,
  onDelete,
  isLoading,
  initialData,
  mode = 'create'
}: ClusterFormProps) {
  const form = useForm<ClusterFormData>({
    resolver: zodResolver(clusterSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      level: initialData?.level ?? null,
      leaderId: initialData?.leaderId ?? null
    }
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: queries.users.getAll
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome del cluster" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Livello</FormLabel>
              <Select
                value={field.value?.toString() ?? "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un livello" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nessun livello</SelectItem>
                  {levelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leaderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cluster Leader</FormLabel>
              <Select
                value={field.value ?? "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un leader" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nessun leader</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {user.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {mode === 'create' ? 'Crea' : 'Salva'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
