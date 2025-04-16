import { Plus } from "lucide-react";
import { Initiative } from "@/lib/types/initiatives";
import { Button } from "../ui/button";
import { InitiativeCard } from "./initiative-card";

interface InitiativesSectionProps {
  initiatives: Initiative[];
  onNewInitiative: () => void;
  onEditInitiative: (initiative: Initiative) => void;
  onDeleteInitiative: (id: string) => void;
}

export function InitiativesSection({
  initiatives,
  onNewInitiative,
  onEditInitiative,
  onDeleteInitiative,
}: InitiativesSectionProps) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Iniziative</h3>
        <Button
          onClick={onNewInitiative}
          variant="default"
          className="bg-emerald-500 hover:bg-emerald-600"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova Iniziativa
        </Button>
      </div>

      <div className="space-y-4">
        {initiatives.map((initiative) => (
          <InitiativeCard
            key={initiative.id}
            initiative={initiative}
            onEdit={onEditInitiative}
            onDelete={onDeleteInitiative}
          />
        ))}
        {initiatives.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Nessuna iniziativa creata
          </p>
        )}
      </div>
    </div>
  );
}
