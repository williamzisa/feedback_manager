"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login effettuato con successo");
      
      setTimeout(() => {
        router.push("/");
      }, 500);
      
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Errore durante il login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !surname) {
      setError("Nome e cognome sono obbligatori");
      setLoading(false);
      return;
    }

    try {
      // 1. Prima creiamo l'utente in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Errore durante la creazione dell'utente");

      // 2. Controlliamo se esiste già un utente con questa email
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (searchError && searchError.code !== 'PGRST116') { // PGRST116 è il codice per "nessun risultato"
        throw searchError;
      }

      if (existingUser) {
        // 3a. Se esiste, aggiorniamo solo l'auth_id
        const { error: updateError } = await supabase
          .from('users')
          .update({ auth_id: authData.user.id })
          .eq('id', existingUser.id);

        if (updateError) throw updateError;
      } else {
        // 3b. Se non esiste, creiamo un nuovo utente
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: crypto.randomUUID(),
            email,
            name,
            surname,
            auth_id: authData.user.id,
            admin: false,
            status: 'active'
          });

        if (insertError) throw insertError;
      }

      toast.success("Registrazione effettuata con successo");
      
      setTimeout(() => {
        router.push("/");
      }, 500);
      
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Errore durante la registrazione");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Accedi</TabsTrigger>
            <TabsTrigger value="register">Registrati</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Accedi al tuo account
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Crea un nuovo account
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <Input
                    id="register-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="register-surname"
                    name="surname"
                    type="text"
                    required
                    placeholder="Cognome"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registrazione in corso..." : "Registrati"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 