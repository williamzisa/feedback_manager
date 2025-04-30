"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userSchema } from "./user-schema";
import type { UserFormData } from "@/lib/types/users";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/supabase/queries";
import { useEffect } from "react";

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  userId?: string;
  onSubmit: (data: UserFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function UserForm({
  initialData,
  userId,
  onSubmit,
  onDelete,
  isLoading = false,
  mode = "create",
}: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      surname: initialData?.surname ?? "",
      email: initialData?.email ?? "",
      level: initialData?.level ?? null,
      mentor: initialData?.mentor ?? null,
      company: initialData?.company ?? null,
      admin: initialData?.admin ?? false,
      status: initialData?.status ?? "active",
      auth_id: initialData?.auth_id ?? null,
      processes: initialData?.processes ?? [],
    },
  });

  // Ottieni l'utente corrente per la company
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: queries.users.getCurrentUser
  });

  // Ottieni la lista degli utenti per selezionare i mentor (stessa company)
  const { data: potentialMentors = [] } = useQuery({
    queryKey: ['users', currentUser?.company],
    queryFn: () => currentUser?.company ? queries.users.getByCompany(currentUser.company) : Promise.resolve([]),
    enabled: !!currentUser?.company,
    select: (users) => users.filter(user => 
      user.status === 'active' && 
      (!userId || user.id !== userId)
    )
  });

  // Ottieni la lista dei livelli per la company
  const { data: levels = [] } = useQuery({
    queryKey: ['levels', currentUser?.company],
    queryFn: () => currentUser?.company ? queries.levels.getByCompany(currentUser.company) : Promise.resolve([]),
    enabled: !!currentUser?.company
  });

  // Ottieni la lista dei processi per la company
  const { data: processes = [] } = useQuery({
    queryKey: ['processes', currentUser?.company],
    queryFn: () => currentUser?.company ? queries.processes.getByCompany(currentUser.company) : Promise.resolve([]),
    enabled: !!currentUser?.company
  });

  // Carica i processi assegnati all'utente se in modalità edit
  const { data: userProcesses = [] } = useQuery({
    queryKey: ['userProcesses', userId],
    queryFn: () => userId ? queries.user_processes.getByUserId(userId) : Promise.resolve([]),
    enabled: !!userId && mode === "edit"
  });

  // Imposta i processi dell'utente quando vengono caricati
  useEffect(() => {
    if (userProcesses.length > 0) {
      const processIds = userProcesses
        .map(up => up.process_id)
        .filter((id): id is string => !!id);
      
      form.setValue('processes', processIds);
    }
  }, [userProcesses, form]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      
      if (mode === "create") {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Inserisci il nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cognome</FormLabel>
              <FormControl>
                <Input placeholder="Inserisci il cognome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Inserisci l'email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mentor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentor</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "_none" ? null : value)}
                value={field.value ?? "_none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un mentor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="_none">Nessun mentor</SelectItem>
                  {potentialMentors.map((user) => (
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
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Livello</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "_none" ? null : value)}
                value={field.value ?? "_none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un livello" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="_none">Nessun livello</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.role} {level.step}
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
          name="processes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processi assegnati</FormLabel>
              <div className="border rounded-md p-4">
                <div className="max-h-60 overflow-auto space-y-2">
                  {processes.map((process) => {
                    const isSelected = field.value?.includes(process.id);
                    return (
                      <div key={process.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`process-${process.id}`}
                          checked={isSelected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newValue = checked
                              ? [...(field.value || []), process.id]
                              : (field.value || []).filter(id => id !== process.id);
                            field.onChange(newValue);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label 
                          htmlFor={`process-${process.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {process.name}
                        </label>
                      </div>
                    );
                  })}
                  {processes.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nessun processo disponibile per questa company
                    </p>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="submit" disabled={isLoading}>
            {mode === "create" ? "Crea User" : "Salva Modifiche"}
          </Button>
          {mode === "edit" && onDelete && (
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
    </Form>
  );
}
