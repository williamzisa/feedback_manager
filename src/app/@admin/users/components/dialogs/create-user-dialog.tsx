"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "../forms/user-form";
import { useState } from "react";
import { UserFormData } from "@/lib/types/users";
import { queries } from "@/lib/supabase/queries";
import { useQuery } from "@tanstack/react-query";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: queries.users.getCurrentUser
  });

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!currentUser?.company) {
        throw new Error('Company non configurata per l\'utente corrente');
      }

      await queries.users.create({
        ...data,
        auth_id: null, // Sarà impostato quando l'utente farà il primo accesso
        company: currentUser.company,
        status: 'active',
        admin: false
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Errore durante la creazione dell'utente");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crea Nuovo Utente</DialogTitle>
        </DialogHeader>
        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
        <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
