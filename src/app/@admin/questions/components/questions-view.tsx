"use client";

import { useState, useEffect } from "react";
import { queries } from "@/lib/supabase/queries";
import { Question, QuestionFormData } from "@/lib/types/questions";
import { StatCard } from "@/components/stats/stat-card";
import { mockQuestionsApi } from "@/lib/data/mock-questions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionsTable } from "./questions-table";
import { CreateQuestionDialog } from "./dialogs/create-question-dialog";
import { EditQuestionDialog } from "./dialogs/edit-question-dialog";

export function QuestionsView() {
  const [questions, setQuestions] = useState<Question[]>(
    mockQuestionsApi.getAll()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Question["type"] | "ALL">("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  const fetchQuestions = async () => {
    try {
      const data = (await queries.questions.getAll()) as Question[];
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch questions");
      console.error("Error fetching questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreate = async (data: QuestionFormData): Promise<boolean> => {
    try {
      mockQuestionsApi.create(data);
      setQuestions(mockQuestionsApi.getAll());
      return true;
    } catch (error) {
      console.error("Error creating question:", error);
      return false;
    }
  };

  const handleEdit = async (
    id: string,
    data: QuestionFormData
  ): Promise<boolean> => {
    try {
      mockQuestionsApi.update(id, data);
      setQuestions(mockQuestionsApi.getAll());
      return true;
    } catch (error) {
      console.error("Error updating question:", error);
      return false;
    }
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      mockQuestionsApi.delete(id);
      setQuestions(mockQuestionsApi.getAll());
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      return false;
    }
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || question.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">Domande</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Totale Domande"
            value={284}
            className="bg-white shadow-sm"
          />
          <StatCard title="Soft Skills" value={95} className="bg-blue-100" />
          <StatCard title="Strategy" value={89} className="bg-purple-100" />
          <StatCard title="Execution" value={100} className="bg-green-100" />
        </div>

        {error && (
          <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="text-center p-4">Loading questions...</div>
        ) : (
          <div className="mt-6">
            {/* Questions Table Component */}
            <div className="rounded-lg bg-white shadow-sm">
              <div className="px-4 py-3 border-b">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="search"
                      placeholder="Cerca Domanda"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Select
                      value={typeFilter}
                      onValueChange={(value) =>
                        setTypeFilter(value as Question["type"] | "ALL")
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtra per tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tutti i tipi</SelectItem>
                        <SelectItem value="SOFT">Soft</SelectItem>
                        <SelectItem value="STRATEGY">Strategy</SelectItem>
                        <SelectItem value="EXECUTION">Execution</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setIsCreateOpen(true)}>
                      Nuova Domanda
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <QuestionsTable
                  questions={filteredQuestions}
                  onEdit={async (id) => {
                    const question = questions.find((q) => q.id === id);
                    if (question) {
                      setEditQuestion(question);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <CreateQuestionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
      />

      {editQuestion && (
        <EditQuestionDialog
          question={editQuestion}
          onEdit={async (data) => {
            const success = await handleEdit(editQuestion.id, data);
            if (success) {
              setEditQuestion(null);
            }
          }}
          onDelete={async () => {
            if (editQuestion) {
              const success = await handleDelete(editQuestion.id);
              if (success) {
                setEditQuestion(null);
              }
            }
          }}
          onClose={() => setEditQuestion(null)}
        />
      )}
    </div>
  );
}
