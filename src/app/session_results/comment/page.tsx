'use client';

import { useState } from 'react';
import BottomNav from "@/components/navigation/bottom-nav";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

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
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="w-10" />
          <h1 className="text-[24px] font-bold text-gray-900">Commenti</h1>
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