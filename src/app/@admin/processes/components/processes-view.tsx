"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProcessesTable } from "./processes-table";
import { CreateProcessDialog } from "./dialogs/create-process-dialog";
import { EditProcessDialog } from "./dialogs/edit-process-dialog";
import type { Process } from "@/lib/types/processes";
import { queries } from "@/lib/supabase/queries";
import { StatCard } from "@/components/stats/stat-card";

export function ProcessesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await queries.processes.getAll();
      setProcesses(data);
    } catch (err) {
      console.error('Errore nel caricamento dei processi:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei processi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProcesses();
  }, []);

  const filteredProcesses = processes.filter((process) =>
    process.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcola le statistiche
  const totalProcesses = processes.length;
  const totalUsers = processes.reduce((acc, p) => acc + p.user_count, 0);
  const averageUsersPerProcess = totalProcesses > 0 
    ? Math.round(totalUsers / totalProcesses) 
    : 0;

  const handleCreateSuccess = () => {
    loadProcesses();
  };

  const handleEditSuccess = () => {
    loadProcesses();
  };

  const handleEdit = (process: Process) => {
    setSelectedProcess(process);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        Errore: {error}
      </div>
    );
  }

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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestione Processi
          </h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard title="TOTALE PROCESSI" value={totalProcesses} />
          <StatCard
            title="TOTALE UTENTI"
            value={totalUsers}
            className="bg-blue-100"
          />
          <StatCard
            title="MEDIA UTENTI PER PROCESSO"
            value={averageUsersPerProcess}
            className="bg-yellow-100"
          />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <Input
              type="search"
              placeholder="Cerca Processo"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            className="w-full sm:w-auto whitespace-nowrap"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Nuovo Processo
          </Button>
        </div>

        <div className="rounded-lg bg-white shadow-sm">
          <div className="px-4 py-3 border-b">
            <p className="text-sm text-gray-500">
              {filteredProcesses.length} risultati
            </p>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">
                Caricamento processi...
              </div>
            ) : (
              <ProcessesTable processes={filteredProcesses} onEdit={handleEdit} />
            )}
          </div>
        </div>

        <CreateProcessDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />

        <EditProcessDialog
          process={selectedProcess}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      </main>
    </div>
  );
}
