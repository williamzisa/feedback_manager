"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import { queries } from "@/lib/supabase/queries";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Il nome del team è obbligatorio",
  }),
  clusterId: z.string().nullable(),
  leaderId: z.string().min(1, { message: "Il team leader è obbligatorio" }),
  project: z.boolean().default(false),
});

export type TeamFormValues = z.infer<typeof formSchema>;

interface TeamFormProps {
  initialData?: TeamFormValues;
  onSubmit: (data: TeamFormValues) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function TeamForm({
  initialData,
  onSubmit,
  onDelete,
  isLoading,
  mode = "create",
}: TeamFormProps) {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      clusterId: initialData?.clusterId || null,
      leaderId: initialData?.leaderId || "",
      project: initialData?.project || false,
    },
  });

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["usersByCompany"],
    queryFn: queries.users.getAllByCompany,
  });

  const {
    data: clusters = [],
    isLoading: isLoadingClusters,
    error: clustersError,
  } = useQuery({
    queryKey: ["clusters"],
    queryFn: queries.clusters.getAll,
  });

  const isLoadingData = isLoadingUsers || isLoadingClusters;
  const error = usersError || clustersError;

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-24" />
          {mode === "edit" && <Skeleton className="h-10 w-28" />}
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Errore nel caricamento dei dati del form';
    return <div className="text-red-500">Errore: {errorMessage}</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Team</FormLabel>
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
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value ?? "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cluster" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nessun Cluster</SelectItem>
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
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un team leader" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {`${user.name} ${user.surname}`}
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
          name="project"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Team di Progetto
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 pt-4">
          {mode === "edit" && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              Elimina Team
            </Button>
          )}
          <Button type="submit" disabled={isLoading || isLoadingData}>
            {mode === "create" ? "Crea Team" : "Salva Modifiche"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
