"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "../forms/user-form";
import { useState } from "react";
import { queries } from "@/lib/supabase/queries";
import type { User, UserFormData } from "@/lib/types/users";
import { useQuery } from "@tanstack/react-query";

interface EditUserDialogProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditUserDialog({
  user,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ottieni i processi attuali dell'utente
  const { data: userProcesses = [], isLoading: isLoadingProcesses } = useQuery({
    queryKey: ['userProcesses', user?.id],
    queryFn: () => user?.id ? queries.userProcesses.getByUserId(user.id) : Promise.resolve([]),
    enabled: !!user?.id
  });

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Nessun utente selezionato per la modifica');
      }

      console.log('Form data ricevuti:', data);

      // Prepara i dati per l'aggiornamento mantenendo i valori esistenti se non modificati
      const updateData = {
        name: data.name || user.name,
        surname: data.surname || user.surname,
        email: data.email || user.email,
        level: data.level === "_none" ? null : data.level,
        mentor: data.mentor === "_none" ? null : data.mentor,
        status: data.status || user.status
      };

      console.log('Dati di aggiornamento:', updateData);
      console.log('ID utente:', user.id);

      try {
        // 1. Aggiorniamo l'utente
        const result = await queries.users.update(user.id, updateData);
        console.log('Risultato aggiornamento:', result);

        if (!result) {
          throw new Error('Nessun dato ricevuto dopo l\'aggiornamento');
        }

        // 2. Gestiamo i processi
        // 2.1 Troviamo i processi da rimuovere
        const processesToRemove = userProcesses.filter(
          processId => !data.processes.includes(processId)
        );

        // 2.2 Troviamo i processi da aggiungere
        const processesToAdd = data.processes.filter(
          processId => !userProcesses.includes(processId)
        );

        // 2.3 Rimuoviamo i processi non più selezionati
        await Promise.all(
          processesToRemove.map(processId =>
            queries.userProcesses.deleteByUserAndProcess(user.id, processId)
          )
        );

        // 2.4 Aggiungiamo i nuovi processi
        await Promise.all(
          processesToAdd.map(processId =>
            queries.userProcesses.create({ userId: user.id, processId })
          )
        );

        onOpenChange(false);
        onSuccess?.();
      } catch (updateError) {
        console.error('Errore specifico update:', updateError);
        if (updateError instanceof Error) {
          throw new Error(`Errore durante l'aggiornamento: ${updateError.message}`);
        } else {
          console.error('Dettagli errore non standard:', updateError);
          throw new Error('Errore non previsto durante l\'aggiornamento dell\'utente');
        }
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante la modifica dell'utente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) return;

      // 1. Eliminiamo prima tutte le associazioni user_processes
      await queries.userProcesses.deleteByUserId(user.id);

      // 2. Poi eliminiamo l'utente
      await queries.users.delete(user.id);

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Errore durante l'eliminazione dell'utente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica User</DialogTitle>
        </DialogHeader>
        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}
        {user && !isLoadingProcesses && (
          <UserForm
            initialData={{
              name: user.name,
              surname: user.surname,
              email: user.email,
              level: user.level || "_none",
              mentor: user.mentor || "_none",
              company: user.company,
              admin: user.admin,
              status: user.status,
              auth_id: user.auth_id,
              processes: userProcesses
            }}
            userId={user.id}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isLoading={isLoading}
            mode="edit"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
