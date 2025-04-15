import { Metadata } from "next";
import { redirect } from "next/navigation";

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
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">I Miei Team</h1>
      </div>

      <UserTeamsList teams={teams} />
    </main>
  );
}
