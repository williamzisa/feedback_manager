"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Rule } from "@/lib/types/rules";

interface RulesTableProps {
  rules: Rule[];
  onEdit: (rule: Rule) => void;
}

export function RulesTable({ rules, onEdit }: RulesTableProps) {
  const [selectedSql, setSelectedSql] = useState<{content: string, name: string} | null>(null);

  return (
    <>
      {/* Tabella Responsive */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Numero</TableHead>
              <TableHead>Nome Regola</TableHead>
              <TableHead>Descrizione</TableHead>
              <TableHead className="w-[180px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.number}</TableCell>
                <TableCell>
                  {rule.name}
                  {rule.template && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      Template
                    </span>
                  )}
                </TableCell>
                <TableCell>{rule.description}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedSql({ content: rule.content_sql, name: rule.name })}
                    >
                      Vedi Codice
                    </Button>
                    <button
                      onClick={() => onEdit(rule)}
                      className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">#{rule.number}</span>
              {rule.template && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Template
                </span>
              )}
            </div>
            <h3 className="font-medium">{rule.name}</h3>
            <p className="text-sm text-gray-600">{rule.description}</p>
            <div className="flex items-center gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => setSelectedSql({ content: rule.content_sql, name: rule.name })}
              >
                Vedi Codice
              </Button>
              <button
                onClick={() => onEdit(rule)}
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog Codice SQL */}
      <Dialog open={!!selectedSql} onOpenChange={() => setSelectedSql(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Codice SQL - {selectedSql?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {selectedSql?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
