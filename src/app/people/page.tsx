'use client';

import BottomNav from "@/components/navigation/bottom-nav";
import { mockPeople } from "@/lib/data/mock-people";
import { useState } from "react";
import Header from "@/components/navigation/header";

export default function PeoplePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = mockPeople.length;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const currentPeople = mockPeople[currentPage - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Le mie Persone" />

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
          />
        </div>
      </div>

      {/* People List */}
      <main className="container mx-auto max-w-2xl px-4 pb-24">
        <div className="space-y-3 mt-4">
          {currentPeople.map((person) => (
            <div key={person.id} className="bg-white rounded-[20px] p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[20px] font-bold text-gray-900 mb-2">{person.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Last Overall: {person.lastOverall}</p>
                    <p>Standard: {person.standard}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium mb-2 ${person.lastGap >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    Last GAP: {person.lastGap >= 0 ? '+' : ''}{person.lastGap}%
                  </p>
                  <button 
                    onClick={() => window.location.href = `/session_results?userId=${person.id}&userName=${encodeURIComponent(person.name)}`}
                    className="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Vedi Sessioni
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 py-6">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={currentPage === 1}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                currentPage === index + 1
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={currentPage === totalPages}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
} 