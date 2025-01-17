'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { queries } from "@/lib/supabase/queries"
import type { TeamFormData } from "@/lib/types/teams"
import { teamSchema } from "./team-schema"

interface TeamFormProps {
  onSubmit: (data: TeamFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  initialData?: TeamFormData
  mode?: 'create' | 'edit'
}

export function TeamForm({
  onSubmit,
  onDelete,
  isLoading,
  initialData,
  mode = 'create'
}: TeamFormProps) {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: queries.users.getAll
  })

  console.log('Users data:', users)

  const { data: clusters = [] } = useQuery({
    queryKey: ['clusters'],
    queryFn: queries.clusters.getAll
  })

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: initialData?.name || '',
      clusterId: initialData?.clusterId || null,
      leaderId: initialData?.leaderId || null,
      isclusterleader: initialData?.isclusterleader || false,
      project: initialData?.project || false
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome del Team</FormLabel>
              <FormControl>
                <Input placeholder="Inserisci il nome del team" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clusterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cluster</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cluster" />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leaderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Leader</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un team leader" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nessun team leader</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {`${user.name || ''} ${user.surname || ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="isclusterleader"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">È cluster leader?</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="project"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">Team di progetto?</FormLabel>
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
