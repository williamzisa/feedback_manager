"use client";

import React from "react";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { useRouter } from "next/navigation";

type Person = {
  name: string;
  remainingAnswers: number;
};

const mockPeople: Person[] = [
  {
    name: "Mario Rossi",
    remainingAnswers: 50,
  },
  {
    name: "Alice Nastri",
    remainingAnswers: 32,
  },
  {
    name: "Elena Ski",
    remainingAnswers: 40,
  },
];

interface SessionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Sessione di valutazione" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Session Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Sessione iniziata il 30/11/2024
          </h2>
          <p className="text-xl text-gray-700">Data termine: 31/12/2024</p>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-[20px] p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Feedback completati</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold">22</span>
            <span className="text-xl text-gray-600">/88</span>
          </div>
          <div className="relative h-2 bg-[#E5F8F6] rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-[25%] bg-[#00BFA5] rounded-full"></div>
          </div>
          <div className="mt-2 text-right text-gray-600">25%</div>
        </div>

        {/* People List */}
        <div className="space-y-4">
          {mockPeople.map((person, index) => (
            <div key={index} className="bg-white rounded-[20px] p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold mb-1">{person.name}</h4>
                  <p className="text-red-500">
                    {person.remainingAnswers} risposte rimanenti
                  </p>
                </div>
                <button
                  className="bg-[#4285F4] text-white px-6 py-2 rounded-full text-lg font-medium hover:bg-[#3367D6] transition-colors"
                  onClick={() =>
                    router.push(
                      `/session/${id}/evaluate?person=${encodeURIComponent(
                        person.name
                      )}`
                    )
                  }
                >
                  Valuta
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
