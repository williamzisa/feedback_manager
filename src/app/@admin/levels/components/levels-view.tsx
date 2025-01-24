"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LevelsTable } from "./levels-table";
import { CreateLevelDialog } from "./dialogs/create-level-dialog";
import { EditLevelDialog } from "./dialogs/edit-level-dialog";
import type { Level } from "@/lib/types/levels";
import { mockLevels } from "@/lib/data/mock-levels";
import { StatCard } from "@/components/stats/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LevelsView = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [levels, setLevels] = useState<Level[]>(mockLevels);

  const filteredLevels =
    selectedFilter === "all"
      ? levels
      : levels.filter((level) => level.role === selectedFilter);

  const uniqueLevels = Array.from(new Set(levels.map((level) => level.role)));

  // Calcola le statistiche
  const totalLevels = levels.length;
  const uniqueRoles = new Set(levels.map((level) => level.role)).size;
  const averageStandard = Math.round(
    levels.reduce((acc, level) => acc + level.standard, 0) / levels.length
  );

  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
  };

  const handleSuccess = () => {
    setLevels([...mockLevels]);
  };

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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
            <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">
            Gestione Livelli
          </h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCard title="TOTALE LIVELLI" value={totalLevels} />
          <StatCard
            title="RUOLI UNICI"
            value={uniqueRoles}
            className="bg-blue-100"
          />
          <StatCard
            title="MEDIA STANDARD"
            value={averageStandard}
            className="bg-green-100"
          />
        </div>

        <div>
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-96">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Filtra per livello" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i livelli</SelectItem>
                  {uniqueLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full sm:w-auto whitespace-nowrap"
              onClick={() => setIsCreateOpen(true)}
            >
              Nuovo Livello
            </Button>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">
                {filteredLevels.length} risultati
              </p>
            </div>
            <div className="p-4">
              <div className="block sm:hidden space-y-4">
                {filteredLevels.map((level) => (
                  <div key={level.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{level.role}</h3>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(level)}
                        >
                          Modifica
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-xs text-gray-500">Execution</p>
                          <p className="font-medium">
                            {level.execution_weight}%
                          </p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-xs text-gray-500">Soft</p>
                          <p className="font-medium">{level.soft_weight}%</p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-xs text-gray-500">Strategy</p>
                          <p className="font-medium">
                            {level.strategy_weight}%
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <span className="text-gray-500">Standard:</span>
                          <span className="ml-2 font-medium">
                            {level.standard}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Step:</span>
                          <span className="ml-2 font-medium">{level.step}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <LevelsTable levels={filteredLevels} onEdit={handleEdit} />
              </div>
            </div>
          </div>

          <CreateLevelDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSuccess={handleSuccess}
          />

          <EditLevelDialog
            level={selectedLevel}
            open={!!selectedLevel}
            onOpenChange={(open) => !open && setSelectedLevel(null)}
            onSuccess={handleSuccess}
          />
        </div>
      </main>
    </div>
  );
};
