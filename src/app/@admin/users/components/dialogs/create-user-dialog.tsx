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

      // Separiamo i processi dai dati dell'utente
      const { processes, ...userData } = data;

      // 1. Creiamo l'utente senza i processi
      const newUser = await queries.users.create({
        ...userData,
        auth_id: null,
        company: currentUser.company,
        status: 'active',
        admin: false
      });

      // 2. Se ci sono processi selezionati, creiamo le associazioni user_processes
      if (processes && processes.length > 0) {
        await Promise.all(processes.map(processId => 
          queries.userProcesses.create({
            userId: newUser.id,
            processId
          })
        ));
      }

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
      <DialogContent className="overflow-visible">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Utente</DialogTitle>
        </DialogHeader>
        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
        <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
