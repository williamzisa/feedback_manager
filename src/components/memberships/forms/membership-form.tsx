'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { membershipSchema } from "./membership-schema"
import type { MembershipFormData } from "@/lib/types/memberships"
import { mockUsers } from "@/lib/data/mock-users"
import { mockMembershipsApi } from '@/lib/data/mock-memberships'

interface MembershipFormProps {
  onSubmit: (data: MembershipFormData) => void
  onDelete?: () => void
  isLoading?: boolean
  initialData?: MembershipFormData
  mode?: 'create' | 'edit'
}

export function MembershipForm({
  onSubmit,
  onDelete,
  isLoading,
  initialData,
  mode = 'create'
}: MembershipFormProps) {
  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      userId: initialData?.userId ?? '',
      teamId: initialData?.teamId ?? ''
    }
  })

  // Ottieni la lista degli utenti disponibili
  const users = mockUsers

  // Ottieni la lista dei team disponibili (senza duplicati)
  const teams = Array.from(
    new Map(mockMembershipsApi.getAll().map(m => [m.team_id, { id: m.team_id, name: m.team.name }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utente</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un utente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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

        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un team" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
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
            {mode === 'create' ? 'Crea Membership' : 'Salva'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
