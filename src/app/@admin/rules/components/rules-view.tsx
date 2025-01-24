"use client";

import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { RulesTable } from "./rules-table";
import type { Rule } from "./rules-table";

const mockRules: Rule[] = [
  {
    numero: 1,
    nomeRegola: "FEEDBACK SOFT E STRATEGY DA CLU VERSO TL",
    descrizione:
      "Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.",
    note: true,
    codiceSQL: "Apri",
  },
  {
    numero: 2,
    nomeRegola: "FEEDBACK SOFT E STRATEGY DA CLU VERSO TL",
    descrizione:
      "Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.",
    note: true,
    codiceSQL: "Button",
  },
  {
    numero: 3,
    nomeRegola: "FEEDBACK SOFT E STRATEGY DA CLU VERSO TL",
    descrizione:
      "Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.",
    note: true,
    codiceSQL: "Button",
  },
  {
    numero: 4,
    nomeRegola: "FEEDBACK SOFT E STRATEGY DA CLU VERSO TL",
    descrizione:
      "Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.",
    note: true,
    codiceSQL: "Button",
  },
  {
    numero: 5,
    nomeRegola: "FEEDBACK SOFT E STRATEGY DA CLU VERSO TL",
    descrizione:
      "Genera feedback da ciascun Cluster Leader (CLU) verso ciascun Team Leader (TL) del proprio cluster.",
    note: true,
    codiceSQL: "Button",
  },
];

export function RulesView() {
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
          <Button className="w-full sm:w-auto whitespace-nowrap">
            Nuova Regola
          </Button>
        </div>

        {/* Rules Section */}
        <div className="mt-6">
          <div className="rounded-lg bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <p className="text-sm text-gray-500">5 regole</p>
            </div>
            <div className="p-4 overflow-x-auto">
              <div className="block sm:hidden space-y-4">
                {mockRules.map((rule) => (
                  <div key={rule.numero} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 mr-2">
                          Regola #{rule.numero}
                        </span>
                        {rule.note && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Note
                          </span>
                        )}
                      </div>
                      <Button className="w-full sm:w-auto whitespace-nowrap">
                        {rule.codiceSQL}
                      </Button>
                    </div>
                    <h3 className="font-semibold text-sm mb-2">
                      {rule.nomeRegola}
                    </h3>
                    <p className="text-sm text-gray-600">{rule.descrizione}</p>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block">
                <RulesTable rules={mockRules} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
