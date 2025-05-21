import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

// Tipo semplificato per il codice leggibile
type SnapshotFeedback = Database['public']['Tables']['snapshot_feedbacks']['Row'];

export async function getFeedbackComments(
  sessionId: string, 
  questionId: string, 
  receiverId: string
): Promise<{ comment: string; value: number }[]> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('feedbacks')
    .select(`
      id,
      comment,
      value
    `)
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .not('comment', 'is', null)
    .not('comment', 'eq', '');
    
  if (error) {
    throw new Error(`Error fetching feedback comments: ${error.message}`);
  }
  
  // Filtriamo qualsiasi commento null e convertiamo in array di oggetti
  return (data || [])
    .filter(feedback => feedback.comment !== null)
    .map(feedback => ({
      comment: feedback.comment as string,
      value: feedback.value || 0
    }));
} 

export async function getSnapshotFeedbackComments(
  sessionId: string,
  questionId: string,
  receiverId: string
): Promise<{ comment: string; value: number }[]> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('snapshot_feedbacks')
    .select(`
      id,
      comment,
      value
    `)
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .not('comment', 'is', null)
    .not('comment', 'eq', '');
    
  if (error) {
    throw new Error(`Error fetching snapshot feedback comments: ${error.message}`);
  }
  
  return (data || [])
    .filter(feedback => feedback.comment !== null)
    .map(feedback => ({
      comment: feedback.comment as string,
      value: feedback.value || 0
    }));
}

export async function getQuestionDescription(questionId: string): Promise<string> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error } = await supabase
    .from('questions')
    .select('description')
    .eq('id', questionId)
    .single();
    
  if (error) {
    throw new Error(`Error fetching question description: ${error.message}`);
  }
  
  return data.description;
}

export async function calculateOverallValue(
  sessionId: string,
  questionId: string,
  receiverId: string
): Promise<number> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Get feedback values excluding self-feedback and 0 values
  const { data, error } = await supabase
    .from('snapshot_feedbacks')
    .select('*')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .neq('sender', receiverId) // Exclude self-feedback
    .neq('value', 0); // Exclude feedbacks with value = 0
    
  if (error) {
    throw new Error(`Error calculating overall value: ${error.message}`);
  }
  
  if (!data || data.length === 0) return 0;
  
  // Calculate average of feedback values
  const sum = data.reduce((acc: number, feedback: SnapshotFeedback) => acc + (feedback.value || 0), 0);
  return sum / data.length;
}

export async function calculateMentorValue(
  sessionId: string,
  questionId: string,
  receiverId: string
): Promise<number> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // First get the mentor ID for the receiver
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('mentor')
    .eq('id', receiverId)
    .single();
    
  if (userError) {
    throw new Error(`Error fetching user mentor: ${userError.message}`);
  }
  
  if (!userData.mentor) return 0;
  
  // Then get the feedback value from the mentor
  const { data, error } = await supabase
    .from('snapshot_feedbacks')
    .select('value')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .eq('sender', userData.mentor)
    .single();
    
  if (error) {
    // Se non trova feedback restituisce 0
    if (error.code === 'PGRST116') return 0;
    throw new Error(`Error calculating mentor value: ${error.message}`);
  }
  
  return data.value || 0;
}

export async function calculateSelfValue(
  sessionId: string,
  questionId: string,
  receiverId: string
): Promise<number> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Get self-feedback value
  const { data, error } = await supabase
    .from('snapshot_feedbacks')
    .select('value')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('receiver', receiverId)
    .eq('sender', receiverId) // Self-feedback
    .single();
    
  if (error) {
    // Se non trova feedback restituisce 0
    if (error.code === 'PGRST116') return 0;
    throw new Error(`Error calculating self value: ${error.message}`);
  }
  
  return data.value || 0;
}

export async function saveSnapshotSessionQuestions(
  sessionId: string,
  questionId: string,
  userId: string,
  overallValue: number,
  mentorValue: number,
  selfValue: number,
  commentsSummary: string,
  suggestedInitiatives: string
): Promise<void> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Arrotondiamo i valori e li convertiamo in interi per il database
  const record = {
    session_id: sessionId,
    question_id: questionId,
    receiver_id: userId,
    overall_value: Math.round(overallValue),
    mentor_value: Math.round(mentorValue),
    self_value: Math.round(selfValue),
    summary_comments: commentsSummary,
    suggested_initiatives: suggestedInitiatives,
  };
  
  try {
    // Check if record already exists
    const { data: existingData, error: checkError } = await supabase
      .from('snapshot_session_questions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .eq('receiver_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking existing record: ${checkError.message}`);
    }
    
    let error;
    
    if (existingData?.id) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('snapshot_session_questions')
        .update(record)
        .eq('id', existingData.id);
      
      error = updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('snapshot_session_questions')
        .insert(record);
      
      error = insertError;
    }
    
    if (error) {
      throw new Error(`Error saving snapshot session questions: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in saveSnapshotSessionQuestions:', error);
    throw error;
  }
} 