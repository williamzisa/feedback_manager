'use client';

import BottomNav from "@/components/navigation/bottom-nav";

type Person = {
  name: string;
  remainingAnswers: number;
};

const mockPeople: Person[] = [
  {
    name: 'Mario Rossi',
    remainingAnswers: 50
  },
  {
    name: 'Alice Nastri',
    remainingAnswers: 32
  },
  {
    name: 'Elena Ski',
    remainingAnswers: 40
  }
];

export default function SessionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="w-10" />
          <h1 className="text-[24px] font-bold text-gray-900">Sessione di valutazione</h1>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Session Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Sessione iniziata il 30/11/2024</h2>
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
                  <p className="text-red-500">{person.remainingAnswers} risposte rimanenti</p>
                </div>
                <button 
                  className="bg-[#4285F4] text-white px-6 py-2 rounded-full text-lg font-medium hover:bg-[#3367D6] transition-colors"
                  onClick={() => window.location.href = `/session/evaluate?person=${encodeURIComponent(person.name)}`}
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