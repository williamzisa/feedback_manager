"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { handleSignup } from "@/app/actions/auth"; // Creeremo questa action

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      setLoading(false);
      return;
    }

    try {
      const result = await handleSignup(email, password);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(
          "Registrazione completata! Controlla la tua email per confermare l'account." // Assumendo che la conferma email sia attiva
        );
        // Reindirizza al login o a una pagina di "verifica email"
        router.push("/login?message=check-email");
      }
    } catch (err) {
      console.error("Errore imprevisto durante la registrazione:", err);
      const errorMessage = err instanceof Error ? err.message : "Errore sconosciuto";
      setError(`Errore durante la registrazione: ${errorMessage}`);
      toast.error(`Errore durante la registrazione: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Crea un Account</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tuamail@esempio.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
              minLength={6} // Supabase richiede almeno 6 caratteri
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Conferma Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="********"
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrazione in corso..." : "Registrati"}
          </Button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
} 