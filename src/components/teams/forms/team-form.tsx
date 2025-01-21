'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { teamSchema } from "./team-schema"
import type { TeamFormData } from "@/lib/types/teams"
import { mockUsers } from "@/lib/data/mock-users"

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
  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      clusterId: initialData?.clusterId ?? null,
      leaderId: initialData?.leaderId ?? null,
      isclusterleader: initialData?.isclusterleader ?? false,
      project: initialData?.project ?? false
    }
  })

  // Ottieni la lista dei potenziali leader (utenti che sono mentor)
  const potentialLeaders = mockUsers.filter(user => user.isMentor)

  // Lista dei cluster disponibili
  const availableClusters = [
    { id: 'cluster1', name: 'Cluster Marketing' },
    { id: 'cluster2', name: 'Cluster Operations' },
    { id: 'cluster3', name: 'Cluster Development' }
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Team</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome del team" />
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
                value={field.value ?? "none"}
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cluster" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nessun cluster</SelectItem>
                  {availableClusters.map((cluster) => (
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
                  {potentialLeaders.map((leader) => (
                    <SelectItem key={leader.id} value={leader.id}>
                      {leader.name} {leader.surname}
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
          name="isclusterleader"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Questo team è un cluster leader?
              </FormLabel>
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
              <FormLabel className="font-normal">
                Questo team è un progetto?
              </FormLabel>
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
            {mode === 'create' ? 'Crea Team' : 'Salva'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
