'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/navigation/bottom-nav";
import Header from "@/components/navigation/header";

function SessionResultsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const [selectedSession, setSelectedSession] = useState('Sessione terminata il 31/12/24');

  const handleViewDetails = () => {
    const queryParams = new URLSearchParams();
    if (userId && userName) {
      queryParams.set('userId', userId);
      queryParams.set('userName', userName);
    }
    window.location.href = `/session_results/feedback${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={userName ? userName : 'I miei Risultati'} />

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Session Selector */}
        <div className="mb-6">
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-full bg-white">
              <div className="flex justify-between items-center w-full">
                <span>{selectedSession}</span>
                <span className="text-yellow-600">GAP: -8%</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sessione terminata il 31/12/24">
                Sessione terminata il 31/12/24
              </SelectItem>
              {/* Altre sessioni qui */}
            </SelectContent>
          </Select>
        </div>

        {/* Results Overview */}
        <div className="bg-white rounded-[20px] p-6 mb-4 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold">Overall: 4.1</span>
            </div>
            <div>
              <span className="text-2xl font-bold">Standard: 4.2</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-xl text-yellow-600">GAP: -8% (in linea)</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold">Il mio Mentor: 4.0</span>
            </div>
            <div>
              <span className="text-2xl font-bold">Self: 4.0</span>
            </div>
          </div>
        </div>

        {/* Skills Cards */}
        <div className="space-y-4">
          {/* Soft Skills */}
          <div className="bg-[#FFF8F0] rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Soft Skills</h2>
              <span className="bg-[#F5A623] text-white text-xl font-bold px-4 py-1 rounded-full">4.1</span>
            </div>
            <div className="space-y-1">
              <p className="text-[#F5A623]">67 feedback ricevuti</p>
              <p className="text-[#F5A623]">Peso: 40%</p>
            </div>
          </div>

          {/* Strategy Skills */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Strategy Skills</h2>
              <span className="bg-[#00BFA5] text-white text-xl font-bold px-4 py-1 rounded-full">3.9</span>
            </div>
            <div className="space-y-1">
              <p className="text-[#00BFA5]">88 feedback ricevuti</p>
              <p className="text-[#00BFA5]">Peso: 30%</p>
            </div>
          </div>

          {/* Execution Skills */}
          <div className="bg-white rounded-[20px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Execution Skills</h2>
              <span className="bg-[#4285F4] text-white text-xl font-bold px-4 py-1 rounded-full">4.0</span>
            </div>
            <div className="space-y-1">
              <p className="text-[#4285F4]">6 feedback ricevuti</p>
              <p className="text-[#4285F4]">Peso: 30%</p>
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-6">
          <Button 
            className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white py-6 rounded-full text-lg"
            onClick={handleViewDetails}
          >
            Vedi Dettaglio
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function SessionResultsPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <SessionResultsContent />
    </Suspense>
  );
} 