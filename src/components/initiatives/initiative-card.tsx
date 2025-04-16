import { Pencil, Trash2 } from "lucide-react";
import { Initiative } from "@/lib/types/initiatives";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

interface InitiativeCardProps {
  initiative: Initiative & {
    user?: {
      name: string;
      surname: string;
    };
  };
  onEdit: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
}

export function InitiativeCard({
  initiative,
  onEdit,
  onDelete,
}: InitiativeCardProps) {
  const formattedDate = new Date(initiative.created_at).toLocaleDateString(
    "it-IT"
  );
  const userName = initiative.user
    ? `${initiative.user.name} ${initiative.user.surname}`
    : "Utente";

  return (
    <Card className="mb-4">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="text-sm text-gray-600">
          {userName} - {formattedDate}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(initiative)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(initiative.id)}
            className="h-8 w-8 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-gray-900">{initiative.description}</p>
      </CardContent>
    </Card>
  );
}
