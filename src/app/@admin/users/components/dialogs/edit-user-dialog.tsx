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
        const result = await queries.users.update(user.id, updateData);
        console.log('Risultato aggiornamento:', result);

        if (!result) {
          throw new Error('Nessun dato ricevuto dopo l\'aggiornamento');
        }

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
        {user && (
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
              auth_id: user.auth_id
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
