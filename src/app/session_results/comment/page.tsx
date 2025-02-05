'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from "@/components/navigation/header";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types';

type Comment = {
  author: string;
  text: string;
  questionType: string;
  value: number | null;
};

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Commenti" />
      <div className="flex justify-center items-center h-[calc(100vh-180px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );
}

function CommentsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');
  const questionId = searchParams.get('questionId');
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!sessionId || !userId || !questionId) {
        setError('Parametri mancanti nell\'URL');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      const supabase = createClientComponentClient<Database>();

      try {
        // Recupera i commenti dei feedback per la question specifica
        const { data: feedbacks, error: feedbackError } = await supabase
          .from('feedbacks')
          .select(`
            comment,
            value,
            questions!inner (
              type
            ),
            sender_user:users!feedbacks_sender_fkey (
              name,
              surname
            )
          `)
          .eq('session_id', sessionId)
          .eq('receiver', userId)
          .eq('question_id', questionId)
          .not('comment', 'is', null)
          .not('comment', 'eq', '');

        if (feedbackError) throw feedbackError;

        const formattedComments = feedbacks
          .filter(f => f.comment && f.sender_user && f.questions)
          .map(f => ({
            author: `${f.sender_user!.name} ${f.sender_user!.surname}`,
            text: f.comment!,
            questionType: f.questions!.type,
            value: f.value
          }));

        setComments(formattedComments);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setError('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId, userId, questionId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Commenti" />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-180px)] px-4">
          <div className="bg-white rounded-[20px] p-8 text-center max-w-md w-full shadow-sm">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 bg-[#4285F4] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#3367D6] transition-colors"
            >
              Indietro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Commenti" />

      <main className="container mx-auto max-w-2xl px-4 py-6 pb-32 mt-[60px]">
        {/* Commenti Ricevuti Title */}
        <h2 className="text-xl font-medium text-center mb-8 text-[#4285F4]">
          Commenti Ricevuti
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-[20px] p-8 text-center">
            <p className="text-gray-500">
              Non sono presenti commenti
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="bg-white rounded-[20px] p-6">
                <h4 className="font-bold text-lg mb-2">{comment.author}</h4>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        )}

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

export default function CommentPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CommentsContent />
    </Suspense>
  );
} 