"use client";

import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";
import { useRouter } from "next/navigation";

interface Session {
  id: string;
  name: string;
  endDate: string;
  participants: number;
  status: "VAI" | "ANALISI";
}

const mockSessions: Session[] = [
  {
    id: "winter-2024",
    name: "Winter 2024",
    endDate: "15/12/2024",
    participants: 71,
    status: "VAI",
  },
  {
    id: "summer-2024",
    name: "Summer 2024",
    endDate: "15/06/2024",
    participants: 23,
    status: "ANALISI",
  },
];

export default function SessionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Sessioni" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-4">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-[20px] p-6"
              onClick={() => router.push(`/session/${session.id}`)}
            >
              <h2 className="text-2xl font-bold mb-2">{session.name}</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">
                    Data di conclusione: {session.endDate}
                  </p>
                  <p className="text-gray-600">
                    Partecipanti: {session.participants}
                  </p>
                </div>
                <button
                  className={`px-6 py-2 rounded-full text-white font-medium
                    ${
                      session.status === "VAI"
                        ? "bg-emerald-500"
                        : "bg-blue-500"
                    }`}
                >
                  {session.status}
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
