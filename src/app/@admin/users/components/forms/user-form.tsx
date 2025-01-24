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
import type { User, UserFormData } from "@/lib/types/users";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { mockUsers } from "@/lib/data/mock-users";

interface UserFormProps {
  defaultValues?: Partial<UserFormData>;
  initialData?: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  submitLabel?: string;
  showDeleteButton?: boolean;
  onDelete?: () => Promise<void>;
}

export function UserForm({
  defaultValues,
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create",
  submitLabel = mode === "create" ? "Crea User" : "Salva",
  showDeleteButton = mode === "edit",
  onDelete,
}: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      surname: initialData?.surname ?? "",
      email: initialData?.email ?? "",
      mentorId: initialData?.mentorId ?? null,
      processes: initialData?.processes ?? [],
      level: initialData?.level ?? null,
      role: initialData?.role ?? "",
      isMentor: initialData?.isMentor ?? false,
      isActive: initialData?.isActive ?? true,
      ...defaultValues,
    },
  });

  const mentors = mockUsers.filter((u) => u.isMentor);

  const availableProcesses = [
    "Compliance Legal",
    "Foreign Memberships",
    "Customer Satisfaction",
    "Revenues Analyst",
  ];

  const availableLevels = [
    "Junior 1",
    "Junior 2",
    "Junior 3",
    "Mid 1",
    "Mid 2",
    "Mid 3",
    "Senior 1",
    "Senior 2",
    "Senior 3",
    "Manager (F) 1",
    "PCG Manager 1",
  ] as const;

  const handleSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      form.reset();
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
          name="mentorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mentor</FormLabel>
              <Select
                value={field.value ?? "none"}
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un mentor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nessun mentor</SelectItem>
                  {mentors.map((mentor) => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.name} {mentor.surname}
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
              <FormLabel>Processi</FormLabel>
              <div className="border rounded-md p-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {field.value?.map((process) => (
                    <Badge key={process} variant="secondary" className="gap-1">
                      {process}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          field.onChange(
                            field.value.filter((p) => p !== process)
                          );
                        }}
                      />
                    </Badge>
                  ))}
                </div>
                <Select
                  value="none"
                  onValueChange={(value) => {
                    if (value !== "none" && !field.value?.includes(value)) {
                      field.onChange([...(field.value || []), value]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aggiungi processo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableProcesses.map((process) => (
                      <SelectItem key={process} value={process}>
                        {process}
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
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Livello</FormLabel>
              <Select
                value={field.value || "none"}
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un livello" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nessun livello</SelectItem>
                  {availableLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvataggio..." : submitLabel}
          </Button>
          {showDeleteButton && onDelete && (
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
