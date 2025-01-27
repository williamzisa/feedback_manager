"use client";

import { StatCard } from "@/components/stats/stat-card";
import { UsersTable } from "./users-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "./dialogs/create-user-dialog";
import { EditUserDialog } from "./dialogs/edit-user-dialog";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/lib/supabase/queries";
import type { User } from "@/lib/types/users";

export function UsersView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFilter, setUserFilter] = useState("");
  const [mentorFilter, setMentorFilter] = useState("");

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: queries.users.getAll
  });

  // Filtra gli utenti in base ai criteri di ricerca
  const filteredUsers = useMemo(() => {
    // Funzione per trovare il mentor di un utente
    const findMentor = (mentorId: string | null) => {
      if (!mentorId) return null;
      return users.find(u => u.id === mentorId);
    };

    return users.filter((user) => {
      const userName = `${user.name} ${user.surname}`.toLowerCase();
      const userEmail = user.email.toLowerCase();
      const mentor = findMentor(user.mentor);
      const mentorName = mentor 
        ? `${mentor.name} ${mentor.surname}`.toLowerCase()
        : '';
      const searchUser = userFilter.toLowerCase();
      const searchMentor = mentorFilter.toLowerCase();

      const matchesUser =
        userName.includes(searchUser) || userEmail.includes(searchUser);
      const matchesMentor = mentorName.includes(searchMentor);

      return (!userFilter || matchesUser) && (!mentorFilter || matchesMentor);
    });
  }, [users, userFilter, mentorFilter]);

  // Calcola le statistiche sui risultati filtrati
  const totalUsers = filteredUsers.length;
  const totalMentors = filteredUsers.filter((u) => u.mentor).length;
  const activeUsers = filteredUsers.filter((u) => u.status === 'active').length;
  const activeMentors = filteredUsers.filter(
    (u) => u.mentor && u.status === 'active'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Utenti</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="N.UTENTI"
            value={totalUsers}
            className="bg-white shadow-sm"
          />
          <StatCard
            title="N.MENTOR"
            value={totalMentors}
            className="bg-blue-100"
          />
          <StatCard
            title="Utenti Attivi"
            value={activeUsers}
            className="bg-green-100"
          />
          <StatCard
            title="Mentor Attivi"
            value={activeMentors}
            className="bg-yellow-100"
          />
        </div>

        {/* Users Section */}
        <div className="mt-6">
          <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Cerca User"
                  className="w-full"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64">
                <Input
                  type="search"
                  placeholder="Cerca Mentor"
                  className="w-full"
                  value={mentorFilter}
                  onChange={(e) => setMentorFilter(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="w-full sm:w-auto whitespace-nowrap"
              onClick={() => setIsCreateOpen(true)}
            >
              Nuovo Utente
            </Button>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">
                {filteredUsers.length} risultati
              </p>
            </div>
            <div className="p-4 overflow-x-auto">
              <UsersTable users={filteredUsers} onEdit={setEditingUser} />
            </div>
          </div>
        </div>
      </main>

      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refetch}
      />

      <EditUserDialog
        user={editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
