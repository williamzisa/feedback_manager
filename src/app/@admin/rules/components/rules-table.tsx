"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Rule {
  numero: number;
  nomeRegola: string;
  descrizione: string;
  note: boolean;
  codiceSQL: string;
}

interface RulesTableProps {
  rules: Rule[];
}

export function RulesTable({ rules }: RulesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Numero</TableHead>
          <TableHead>Nome Regola</TableHead>
          <TableHead>Descrizione</TableHead>
          <TableHead className="w-[100px]">Note</TableHead>
          <TableHead className="w-[100px]">Codice SQL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule.numero}>
            <TableCell>{rule.numero}</TableCell>
            <TableCell>{rule.nomeRegola}</TableCell>
            <TableCell>{rule.descrizione}</TableCell>
            <TableCell>
              {rule.note && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Note
                </span>
              )}
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                {rule.codiceSQL}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
