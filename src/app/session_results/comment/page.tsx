"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/navigation/bottom-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import Header from "@/components/navigation/header";
import { getSessionComments } from "@/lib/supabase/queries";
import { Database } from "@/lib/supabase/database.types";

type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"] & {
  sender: { name: string; surname: string };
  receiver: { name: string; surname: string };
  question: { description: string };
};

const skillsData = {
  "Strategy Skills": {
    name: "Strategy Skills",
    color: "#00BFA5",
  },
  "Execution Skills": {
    name: "Execution Skills",
    color: "#4285F4",
  },
  "Soft Skills": {
    name: "Soft Skills",
    color: "#F5A623",
  },
} as const;

type SkillKey = keyof typeof skillsData;

export default function CommentPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const userId = searchParams.get("userId");
  const initialSkill = searchParams.get("skill") as SkillKey;
  const [selectedSkill, setSelectedSkill] = useState<SkillKey>(
    initialSkill || "Execution Skills"
  );
  const [comments, setComments] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
      if (sessionId && userId) {
        try {
          const data = await getSessionComments(sessionId, userId);
          setComments(data.filter((f) => f.comment));
        } catch (error) {
          console.error("Errore nel caricamento dei commenti:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadComments();
  }, [sessionId, userId]);

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Commenti" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Skill Selector */}
        <div className="mb-6">
          <Select
            value={selectedSkill}
            onValueChange={(value) => setSelectedSkill(value as SkillKey)}
          >
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-gray-900">{selectedSkill}</span>
                <span className="bg-[#4285F4] text-white px-3 py-0.5 rounded-full text-sm font-medium">
                  {comments.length}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(skillsData).map(([key, skill]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2 pr-4">
                    <span>{skill.name}</span>
                    <span className="text-[#4285F4] text-sm">
                      {comments.length}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Commenti Ricevuti Title */}
        <h2 className="text-[#4285F4] text-xl font-medium text-center mb-8">
          Commenti Ricevuti
        </h2>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-center mb-8">
            {comments[0]?.question?.description ||
              "Nessuna domanda disponibile"}
          </h3>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-[20px] p-6">
              <h4 className="font-bold text-lg mb-2">
                {comment.sender?.name} {comment.sender?.surname}
              </h4>
              <p className="text-gray-700">{comment.comment}</p>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-[#4285F4] text-white py-4 rounded-full text-lg font-medium hover:bg-[#3367D6] transition-colors"
          >
            Indietro
          </button>
        </div>
      </main>
    </div>
  );
}
