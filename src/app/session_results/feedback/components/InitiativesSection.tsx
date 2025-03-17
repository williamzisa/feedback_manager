'use client';

import { Button } from "@/components/ui/button";
import { queries } from "@/lib/supabase/queries";
import { useToast } from "@/components/ui/use-toast";
import CreateInitiativeDialog from "@/app/@admin/feedback-management/components/dialogs/create-initiative-dialog";
import { useState } from "react";

type Initiative = {
  id: string;
  description: string | null;
  created_at: string;
  user: {
    name: string;
    surname: string;
  } | null;
};

type InitiativesSectionProps = {
  initiatives: Initiative[];
  onInitiativeSuccess: () => void;
  sessionId: string;
  userId: string;
  questionId: string;
  questionType: string;
};

export function InitiativesSection({ 
  initiatives,
  onInitiativeSuccess,
  sessionId,
  userId,
  questionId,
  questionType
}: InitiativesSectionProps) {
  const [showInitiativeDialog, setShowInitiativeDialog] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const { toast } = useToast();

  const handleCreateInitiative = () => {
    setEditingInitiative(null);
    setShowInitiativeDialog(true);
  };

  const handleEditInitiative = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setShowInitiativeDialog(true);
  };

  const handleDeleteInitiative = async (initiativeId: string) => {
    try {
      await queries.initiatives.delete(initiativeId);
      onInitiativeSuccess();
      toast({
        title: "Iniziativa eliminata",
        description: "L'iniziativa è stata eliminata con successo",
        variant: "success"
      });
    } catch (err) {
      console.error('Errore nell\'eliminazione dell\'iniziativa:', err);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'iniziativa",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Iniziative</h3>
        <Button 
          onClick={handleCreateInitiative}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Nuova Iniziativa
        </Button>
      </div>
      
      {initiatives.length > 0 ? (
        <div className="space-y-4">
          {initiatives.map((initiative) => (
            <div 
              key={initiative.id} 
              className="p-4 border rounded-lg bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    {initiative.user?.name} {initiative.user?.surname} - {new Date(initiative.created_at).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-gray-900">{initiative.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditInitiative(initiative)}
                    className="p-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteInitiative(initiative.id)}
                    className="p-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          Nessuna iniziativa presente
        </p>
      )}

      {/* Initiative Dialog */}
      <CreateInitiativeDialog
        isOpen={showInitiativeDialog}
        onClose={() => {
          setShowInitiativeDialog(false);
          setEditingInitiative(null);
        }}
        sessionId={sessionId}
        userId={userId}
        questionId={questionId}
        questionType={questionType}
        onSuccess={onInitiativeSuccess}
        initiative={editingInitiative}
      />
    </div>
  );
} 