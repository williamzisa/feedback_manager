'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/bottom-nav';

function EvaluateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPersonMenuOpen, setIsPersonMenuOpen] = useState(false);
  const personName = searchParams.get('person') || 'Mario Rossi';
  const [selectedSkill, setSelectedSkill] = useState('Execution');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSkillMenuOpen, setIsSkillMenuOpen] = useState(false);

  const people = [
    { name: 'Mario Rossi', remainingAnswers: 70 },
    { name: 'Alice Nastri', remainingAnswers: 32 },
    { name: 'Elena Ski', remainingAnswers: 40 }
  ];

  const skills = [
    { name: 'Execution', remainingFeedback: 15 },
    { name: 'Soft', remainingFeedback: 8 },
    { name: 'Strategy', remainingFeedback: 12 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/session" className="w-10 h-10 flex items-center justify-center text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-[24px] font-bold text-gray-900">Feedback</h1>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Person Selection */}
        <div className="bg-white rounded-[20px] p-4 mb-4 relative">
          <div 
            className="flex justify-between items-center cursor-pointer" 
            onClick={() => setIsPersonMenuOpen(!isPersonMenuOpen)}
          >
            <span className="text-lg font-medium">{personName}</span>
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-sm">
                {people.find(p => p.name === personName)?.remainingAnswers} rimanenti
              </span>
              <svg className={`w-5 h-5 transition-transform ${isPersonMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {isPersonMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[20px] shadow-lg z-10">
              {people.map((person) => (
                <div
                  key={person.name}
                  className="p-4 hover:bg-gray-50 cursor-pointer first:rounded-t-[20px] last:rounded-b-[20px]"
                  onClick={() => {
                    router.push(`/session/evaluate?person=${encodeURIComponent(person.name)}`);
                    setIsPersonMenuOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{person.name}</span>
                    <span className="text-red-500 text-sm">{person.remainingAnswers} rimanenti</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skill Selection */}
        <div className="bg-white rounded-[20px] p-4 mb-4 relative">
          <div 
            className="flex justify-between items-center cursor-pointer" 
            onClick={() => setIsSkillMenuOpen(!isSkillMenuOpen)}
          >
            <span className="text-lg font-medium">{selectedSkill}</span>
            <div className="flex items-center gap-2">
              <span className="text-[#F4B400] text-sm">
                {skills.find(s => s.name === selectedSkill)?.remainingFeedback} rimanenti
              </span>
              <svg className={`w-5 h-5 transition-transform ${isSkillMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {isSkillMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-[20px] shadow-lg z-10">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="p-4 hover:bg-gray-50 cursor-pointer first:rounded-t-[20px] last:rounded-b-[20px]"
                  onClick={() => {
                    setSelectedSkill(skill.name);
                    setIsSkillMenuOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{skill.name}</span>
                    <span className="text-[#F4B400] text-sm">{skill.remainingFeedback} rimanenti</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-lg text-gray-800 mb-4">
            Come valuti la sua esecuzione nel processo xyz?
          </h2>
          
          {/* Star Rating */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-2xl"
              >
                <svg
                  className={`w-8 h-8 ${rating >= star ? 'text-[#F4B400]' : 'text-gray-300'}`}
                  fill={rating >= star ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
          </div>

          {/* No Feedback Button */}
          <button className="w-full bg-[#F5F5F5] text-gray-700 py-3 rounded-full mb-4">
            NON HO ELEMENTI PER UN FEEDBACK UTILE
          </button>

          {/* Tags */}
          <div className="flex gap-2 mb-6">
            <button className="px-4 py-2 rounded-full bg-[#F5F5F5] text-gray-700">
              Mediocre
            </button>
            <button className="px-4 py-2 rounded-full bg-[#F5F5F5] text-gray-700">
              Ha bisogno di stimoli
            </button>
          </div>

          {/* Comment Box */}
          <div className="bg-white rounded-[20px] p-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Aggiungi un commento qui.."
              className="w-full h-32 resize-none border-none focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* Next Button */}
        <button className="w-full bg-[#4285F4] text-white py-3 rounded-full text-lg font-medium">
          AVANTI
        </button>
      </main>

      <BottomNav />
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <EvaluateContent />
    </Suspense>
  );
} 