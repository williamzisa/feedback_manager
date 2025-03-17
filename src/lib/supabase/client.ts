import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export const supabase = createClientComponentClient<Database>()

// Funzione per verificare se l'utente è autenticato
export const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return !!session
  } catch (err) {
    console.error('Errore nel controllo dell\'autenticazione:', err)
    return false
  }
}
