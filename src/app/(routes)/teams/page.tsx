import { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/navigation/header";
import BottomNav from "@/components/navigation/bottom-nav";
import { getCurrentUser, getUserTeams } from "@/lib/supabase/server";
import { UserTeamsList } from "./components/user-teams-list";

export const metadata: Metadata = {
  title: "Teams | Feedback Manager",
  description: "Gestisci i tuoi team",
};

export default async function TeamsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const teams = await getUserTeams(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="I Miei Team" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-6">
          {teams.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              Nessun team disponibile
            </div>
          ) : (
            <UserTeamsList teams={teams} />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
