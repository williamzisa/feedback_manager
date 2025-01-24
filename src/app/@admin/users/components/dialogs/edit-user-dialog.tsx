"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "../forms/user-form";
import { useState } from "react";
import { mockUsersApi } from "@/lib/data/mock-users";
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

      if (!user) return;

      mockUsersApi.update(user.id, data);

      onOpenChange(false);
      onSuccess?.();
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

      mockUsersApi.delete(user.id);

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
            initialData={user}
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
