import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "../supabase/database.types";

/**
 * Verifica se l'utente corrente è un amministratore
 * @returns {Promise<boolean>} true se l'utente è admin, false altrimenti
 * @throws {Error} se l'utente non è autenticato o se ci sono errori nel recupero dei dati
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return false;
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("admin")
      .eq("auth_id", session.user.id)
      .single();

    if (error || !user) {
      return false;
    }

    return user.admin;
  } catch (err) {
    console.error("Errore nella verifica dei permessi admin:", err);
    return false;
  }
}

/**
 * Middleware helper per verificare i permessi admin
 * @returns {Promise<{isAdmin: boolean, error?: string}>}
 */
export async function checkAdminPermissions(): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    const hasAdminPermissions = await isAdmin();
    
    if (!hasAdminPermissions) {
      return {
        isAdmin: false,
        error: "Non hai i permessi di amministratore necessari per accedere a questa risorsa"
      };
    }

    return { isAdmin: true };
  } catch {
    return {
      isAdmin: false,
      error: "Errore nella verifica dei permessi di amministratore"
    };
  }
} 