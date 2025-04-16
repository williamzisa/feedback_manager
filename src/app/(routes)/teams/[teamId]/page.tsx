import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dettaglio Team | Feedback Manager",
  description: "Visualizza e gestisci i dettagli del team",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dettaglio Team" showBackButton backUrl="/teams" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Questa pagina è in manutenzione. Tornerà presto disponibile.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Azioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Link href="/teams" passHref>
                  <Button variant="outline">Torna alla lista team</Button>
                </Link>
                <Link href="/admin/teams" passHref>
                  <Button variant="outline">Gestione team</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
