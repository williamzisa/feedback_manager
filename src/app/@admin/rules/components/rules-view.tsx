"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { RulesTable } from "./rules-table";
import { CreateRuleDialog } from "./dialogs/create-rule-dialog";
import { EditRuleDialog } from "./dialogs/edit-rule-dialog";
import type { Rule } from "@/lib/types/rules";
import { queries } from "@/lib/supabase/queries";

export function RulesView() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await queries.users.getCurrentUser();
      if (!currentUser.company) {
        throw new Error('Errore: account non configurato correttamente (company mancante)');
      }

      const rulesData = await queries.rules.getByCompany(currentUser.company);
      setRules(rulesData);
    } catch (err) {
      console.error('Errore nel caricamento delle regole:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle regole');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateSuccess = () => {
    fetchRules();
  };

  const handleEditSuccess = () => {
    fetchRules();
    setSelectedRule(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="mx-auto max-w-full px-4 sm:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
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
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <h1 className="text-2xl font-semibold text-gray-900">Regole</h1>
          </div>
          <Button 
            className="w-full sm:w-auto whitespace-nowrap"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Nuova Regola
          </Button>
        </div>

        {/* Rules Section */}
        <div className="mt-6">
          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">{rules.length} regole</p>
            </div>
            {error && (
              <div className="p-4 text-sm text-red-500 bg-red-50">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Caricamento...
              </div>
            ) : (
              <div className="p-4 overflow-x-auto">
                <RulesTable 
                  rules={rules} 
                  onEdit={setSelectedRule}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditRuleDialog
        rule={selectedRule}
        onOpenChange={() => setSelectedRule(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
