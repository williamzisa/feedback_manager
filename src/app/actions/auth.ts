"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/supabase/database.types";

export async function handleSignup(email: string, password: string): Promise<{ error?: string }> {
  const cookieStore = cookies();
  const supabase = createServerActionClient<Database>({ cookies: () => cookieStore });

  // 1. Verifica se l'utente esiste già in public.users
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("id, auth_id")
    .eq("email", email)
    .maybeSingle(); // maybeSingle per gestire il caso in cui non esista

  if (selectError) {
    console.error("Errore verifica utente esistente:", selectError);
    return { error: "Errore durante la verifica dell'utente. Riprova più tardi." };
  }

  if (!existingUser) {
    return { error: "Registrazione non autorizzata. L'email non è presente nel sistema." };
  }

  // 2. Verifica se l'utente ha già un auth_id (è già registrato)
  if (existingUser.auth_id) {
    return { error: "Questa email è già associata a un account registrato." };
  }

  // 3. Prova a registrare l'utente in Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Non inviare l'email di conferma, l'utente è già "verificato"
      // dal momento che esiste in public.users.
      // Se invece vuoi la conferma email, rimuovi questa opzione
      // e assicurati che [auth.email] enable_confirmations sia true in config.toml.
      // emailRedirectTo: `${origin}/auth/callback` // Aggiungere se si usa il flusso con conferma
    },
  });

  if (signUpError) {
    console.error("Errore Supabase signUp:", signUpError);
    // Potresti voler mappare errori comuni a messaggi più user-friendly
    if (signUpError.message.includes("User already registered")) {
         // Questo errore può capitare se l'utente esiste in auth.users ma non in public.users
         // o se il trigger per popolare auth_id non ha funzionato in passato.
         // O semplicemente se l'utente prova a registrarsi di nuovo dopo un tentativo fallito.
        return { error: "Questa email risulta già registrata nel sistema di autenticazione."};
    }
    if (signUpError.message.includes("Password should be at least 6 characters")) {
      return { error: "La password deve contenere almeno 6 caratteri." };
    }
    return { error: `Errore durante la registrazione: ${signUpError.message}` };
  }

  // Se la registrazione va a buon fine ma l'utente non viene creato (caso strano)
  if (!authData.user) {
      console.error("signUp ha avuto successo ma non ha restituito un utente.", authData);
      return { error: "Si è verificato un problema durante la creazione dell'account. Riprova." };
  }

  // La registrazione è andata a buon fine.
  // L'aggiornamento di public.users.auth_id avverrà tramite trigger (spiegato dopo).
  return {}; // Nessun errore
} 