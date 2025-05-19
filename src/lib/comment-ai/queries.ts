import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

export async function getFeedbackComments(
  sessionId: string, 
  questionId: string, 
  receiverId: string
): Promise<string[]> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('feedbacks')
    .select(`
      id,
      comment
    `)
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .not('comment', 'is', null)
    .not('comment', 'eq', '');
    
  if (error) {
    throw new Error(`Error fetching feedback comments: ${error.message}`);
  }
  
  // Filtriamo qualsiasi commento null (anche se la query dovrebbe già escluderli)
  // e convertiamo in array di stringhe
  return data
    .map(feedback => feedback.comment)
    .filter((comment): comment is string => comment !== null);
} 