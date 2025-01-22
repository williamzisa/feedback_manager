'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BottomNav from "@/components/navigation/bottom-nav";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

type Skill = {
  name: string;
  score: number;
  color: string;
  question: string;
};

const skillsData: Record<string, Skill> = {
  'Strategy Skills': {
    name: 'Strategy Skills',
    score: 3.9,
    color: '#00BFA5',
    question: 'Come valuti la sua capacità di pensiero strategico?'
  },
  'Execution Skills': {
    name: 'Execution Skills',
    score: 4.0,
    color: '#4285F4',
    question: 'Come valuti la sua esecuzione nel processo xyz?'
  },
  'Soft Skills': {
    name: 'Soft Skills',
    score: 4.1,
    color: '#F5A623',
    question: 'Come valuti la sua capacità di leadership?'
  }
};

function FeedbackContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('userName');
  const [selectedSession, setSelectedSession] = useState('Sessione terminata il 31/12/24');
  const [selectedSkill, setSelectedSkill] = useState('Strategy Skills');
  const currentSkill = skillsData[selectedSkill];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="w-10" />
          <h1 className="text-[24px] font-bold text-gray-900">
            {userName ? userName : 'I miei risultati'}
          </h1>
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
        {/* Session Selector */}
        <div className="mb-4">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-gray-900">{selectedSession}</span>
                <span className="text-yellow-600 font-medium">GAP: -8%</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sessione terminata il 31/12/24">
                <div className="flex justify-between items-center w-full pr-4">
                  <span>Sessione terminata il 31/12/24</span>
                  <span className="text-yellow-600">GAP: -8%</span>
                </div>
              </SelectItem>
              <SelectItem value="Sessione terminata il 30/12/24">
                <div className="flex justify-between items-center w-full pr-4">
                  <span>Sessione terminata il 30/12/24</span>
                  <span className="text-yellow-600">GAP: -5%</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills Selector */}
        <div className="mb-6">
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 shadow-sm">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-gray-900">{selectedSkill}</span>
                <span className="text-white px-3 py-0.5 rounded-full text-sm font-medium" style={{ backgroundColor: currentSkill.color }}>
                  {currentSkill.score}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.values(skillsData).map((skill) => (
                <SelectItem key={skill.name} value={skill.name}>
                  <div className="flex items-center gap-2 pr-4">
                    <span>{skill.name}</span>
                    <span className="text-sm" style={{ color: skill.color }}>{skill.score}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question and Rating */}
        <div className="bg-white rounded-[20px] p-6 mb-4">
          <div className="mb-8">
            <p className="text-lg mb-6">{currentSkill.question}</p>
            <div className="flex justify-center gap-4 px-4">
              {[1, 2, 3, 3.5, 4].map((rating, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${rating <= 3 ? 'text-yellow-400' : 'text-gray-200'}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-lg font-semibold">Overall: 3.6/5</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-lg">Il mio Mentor 3.8/5</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-lg">Self: 3.8/5</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-[20px] p-6">
          <div 
            className="flex justify-between items-center cursor-pointer hover:opacity-80"
            onClick={() => window.location.href = `/session_results/comment?skill=${selectedSkill}`}
          >
            <h3 className="text-lg font-semibold">Hai ricevuto 5 commenti, guardali qui:</h3>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-4">
          <button className="w-full bg-emerald-500 text-white py-4 rounded-full text-lg font-medium hover:bg-emerald-600 transition-colors">
            Crea iniziativa
          </button>
          <button className="w-full bg-blue-500 text-white py-4 rounded-full text-lg font-medium hover:bg-blue-600 transition-colors">
            Prossima Domanda
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <FeedbackContent />
    </Suspense>
  );
} 