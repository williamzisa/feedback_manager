'use client';

import { useState } from 'react';
import BottomNav from "@/components/navigation/bottom-nav";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import Header from "@/components/navigation/header";

type Comment = {
  author: string;
  text: string;
};

const mockComments: Comment[] = [
  {
    author: 'Chiara Neri',
    text: 'Alle volte il suo approccio a questo processo è mediocre, ma solitamente raggiunge il risultato'
  },
  {
    author: 'Marco Verdi',
    text: 'Alle volte il suo approccio a questo processo è mediocre e poco impattante'
  },
  {
    author: 'Samuele Colombo',
    text: 'Sempre una certezza e affidabile'
  },
  {
    author: 'Elisabetta Longhi',
    text: 'Un punto di riferimento su questo aspetto'
  }
];

export default function CommentPage() {
  const [selectedSkill, setSelectedSkill] = useState('Execution Skills');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Commenti" />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Skill Selector */}
        <div className="mb-6">
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-gray-900">{selectedSkill}</span>
                <span className="bg-[#4285F4] text-white px-3 py-0.5 rounded-full text-sm font-medium">4.0</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Execution Skills">
                <div className="flex items-center gap-2 pr-4">
                  <span>Execution Skills</span>
                  <span className="text-[#4285F4] text-sm">4.0</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commenti Ricevuti Title */}
        <h2 className="text-[#4285F4] text-xl font-medium text-center mb-8">Commenti Ricevuti</h2>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-center mb-8">
            Come valuti la sua esecuzione nel processo xyz?
          </h3>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {mockComments.map((comment, index) => (
            <div key={index} className="bg-white rounded-[20px] p-6">
              <h4 className="font-bold text-lg mb-2">{comment.author}</h4>
              <p className="text-gray-700">{comment.text}</p>
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

      <BottomNav />
    </div>
  );
} 