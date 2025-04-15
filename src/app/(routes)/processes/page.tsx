import { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import { getCurrentUser } from "@/lib/supabase/server";
import { UserProcessesView } from "./components/user-processes-view";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Processi | Feedback Manager",
  description: "Gestisci i tuoi processi",
};

export default async function ProcessesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="I Miei Processi" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="flex justify-end mb-4">
          <Link href="/teams" passHref>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Gestisci Processi Team
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <UserProcessesView userId={user.id} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
