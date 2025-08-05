import { getServerSupabase } from '@/lib/supabase/server';
import { 
  SessionReportData, 
  SkillResult, 
  QuestionDetail,
  SKILL_TYPES 
} from '@/lib/types/pdf-report';
import { 
  calculateGapEvaluation,
  formatDateForPDF 
} from './pdf-utils';
import type { Database } from '@/lib/supabase/database.types';

// Temporary type for question processing
type QuestionDetailTemp = QuestionDetail & {
  feedbacks?: Feedback[];
  validValues?: number[];
};

type UserSession = Database['public']['Tables']['user_sessions']['Row'];
type Feedback = Database['public']['Tables']['feedbacks']['Row'];

/**
 * Aggregate all data needed for session PDF report
 */
export async function aggregateSessionReportData(
  sessionId: string, 
  userId: string,
  userName?: string
): Promise<SessionReportData> {
  const supabase = await getServerSupabase();

  try {
    // Get session and user session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        sessions (
          name,
          end_time,
          status
        ),
        users (
          name,
          mentor
        )
      `)
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !sessionData) {
      throw new Error(`Session not found: ${sessionError?.message}`);
    }

    // Get feedback data aggregated by question
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedbacks')
      .select(`
        *,
        questions (
          id,
          description,
          type
        ),
        sender:users!feedbacks_sender_fkey (
          id,
          name,
          surname
        )
      `)
      .eq('session_id', sessionId)
      .eq('receiver', userId)
      .not('sender', 'eq', userId); // Exclude self-feedback

    if (feedbackError) {
      throw new Error(`Failed to fetch feedback data: ${feedbackError.message}`);
    }

    // Get initiatives for each question (filtered by user)
    const questionIds = feedbackData?.map((f: Feedback) => f.question_id) || [];
    const { data: initiativesData, error: initiativesError } = await supabase
      .from('initiatives')
      .select('question_id, description')
      .in('question_id', questionIds)
      .eq('user_id', userId); // Filter initiatives by current user

    if (initiativesError) {
      console.warn('Failed to fetch initiatives:', initiativesError.message);
    }

    // Get comments count for each question (using feedbacks with comments)
    const { data: commentsData, error: commentsError } = await supabase
      .from('feedbacks')
      .select('question_id, comment')
      .eq('session_id', sessionId)
      .eq('receiver', userId)
      .not('comment', 'is', null);

    if (commentsError) {
      console.warn('Failed to fetch comments:', commentsError.message);
    }

    // Process data
    const sessionInfo = {
      name: sessionData.sessions?.name || 'Unknown Session',
      endDate: formatDateForPDF(sessionData.sessions?.end_time || new Date().toISOString()),
      userName: userName || sessionData.users?.name || 'Unknown User',
      status: sessionData.sessions?.status || 'COMPLETED'
    };

    const overallResults = {
      overall: sessionData.val_overall || 0,
      self: sessionData.self_overall || 0,
      standard: sessionData.level_standard || 0,
      mentor: sessionData.mentor_overall || 0,
      gap: sessionData.val_gap || 0,
      gapEvaluation: calculateGapEvaluation(sessionData.val_gap || 0)
    };

    // Aggregate skill results
    const skillResults = aggregateSkillResults(sessionData, feedbackData || []);

    // Process question details
    const questionDetails = await processQuestionDetails(
      feedbackData || [],
      initiativesData || [],
      commentsData || [],
      sessionData
    );

    return {
      sessionInfo,
      overallResults,
      skillResults,
      questionDetails
    };

  } catch (error) {
    console.error('Error aggregating session report data:', error);
    throw error;
  }
}

/**
 * Aggregate skill-level results
 */
function aggregateSkillResults(
  sessionData: UserSession & { 
    sessions?: { name: string; end_time: string | null; status: string } | null; 
    users?: { name: string } | null 
  }, 
  feedbackData: (Feedback & { questions?: { id: string; description: string; type: string } | null })[]
): SkillResult[] {
  const skills: SkillResult[] = [];

  // Strategy skills
  if (sessionData.val_strategy !== null) {
    const strategyFeedbacks = feedbackData.filter((f: Feedback & { questions?: { id: string; description: string; type: string } | null }) => f.questions?.type === 'STRATEGY');
    skills.push({
      type: 'STRATEGY',
      displayName: SKILL_TYPES.STRATEGY.displayName,
      weight: sessionData.weight_strategy || 0,
      overall: sessionData.val_strategy || 0,
      self: sessionData.self_strategy || 0,
      mentor: sessionData.mentor_strategy || 0,
      feedbackCount: strategyFeedbacks.length,
      color: SKILL_TYPES.STRATEGY.color
    });
  }

  // Soft skills
  if (sessionData.val_soft !== null) {
    const softFeedbacks = feedbackData.filter(f => f.questions?.type === 'SOFT');
    skills.push({
      type: 'SOFT',
      displayName: SKILL_TYPES.SOFT.displayName,
      weight: sessionData.weight_soft || 0,
      overall: sessionData.val_soft || 0,
      self: sessionData.self_soft || 0,
      mentor: sessionData.mentor_soft || 0,
      feedbackCount: softFeedbacks.length,
      color: SKILL_TYPES.SOFT.color
    });
  }

  // Execution skills
  if (sessionData.val_execution !== null) {
    const executionFeedbacks = feedbackData.filter(f => f.questions?.type === 'EXECUTION');
    skills.push({
      type: 'EXECUTION',
      displayName: SKILL_TYPES.EXECUTION.displayName,
      weight: sessionData.weight_execution || 0,
      overall: sessionData.val_execution || 0,
      self: sessionData.self_execution || 0,
      mentor: sessionData.mentor_execution || 0,
      feedbackCount: executionFeedbacks.length,
      color: SKILL_TYPES.EXECUTION.color
    });
  }

  return skills;
}

/**
 * Process question details with initiatives and comments
 */
async function processQuestionDetails(
  feedbackData: (Feedback & { questions?: { id: string; description: string; type: string } | null; sender?: { id: string; name: string; surname: string } | null })[],
  initiativesData: { question_id: string | null; description: string | null }[],
  commentsData: { question_id: string | null; comment: string | null }[],
  sessionData: { users?: { mentor?: string | null } | null }
): Promise<QuestionDetail[]> {
  const questionMap = new Map<string, QuestionDetailTemp>();

  // Group feedback by question and calculate aggregated values
  feedbackData.forEach(feedback => {
    const questionId = feedback.question_id;
    
    if (questionId) {
      if (!questionMap.has(questionId)) {
        questionMap.set(questionId, {
          id: questionId,
          description: feedback.questions?.description || 'Unknown Question',
          skillType: feedback.questions?.type || 'UNKNOWN',
          overall: 0,
          mentorValue: 0,
          commentCount: 0,
          initiatives: [],
          feedbacks: [],
          validValues: []
        });
      }
      
      const question = questionMap.get(questionId)!;
      
      // Add feedback with value > 0
      if (feedback.value && feedback.value > 0) {
        question.feedbacks!.push(feedback);
        question.validValues!.push(feedback.value);
        
        // Calculate overall as average of all valid values
        question.overall = question.validValues!.reduce((a: number, b: number) => a + b, 0) / question.validValues!.length;
        
        // Set mentor value if this feedback is from a mentor
        // Check if sender is the user's mentor or if it's marked as mentor feedback
        const isMentorFeedback = feedback.is_mentor || 
          (sessionData.users && feedback.sender?.id === sessionData.users.mentor);
        
        if (isMentorFeedback) {
          question.mentorValue = feedback.value;
        }
      }
    }
  });

  // Add initiatives
  initiativesData.forEach(initiative => {
    if (initiative.question_id) {
      const question = questionMap.get(initiative.question_id);
      if (question && initiative.description) {
        question.initiatives.push(initiative.description);
      }
    }
  });

  // Count comments per question
  const commentCounts = commentsData.reduce((acc, comment) => {
    if (comment.question_id && comment.comment) {
      acc[comment.question_id] = (acc[comment.question_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Update comment counts and clean up temporary fields
  const finalQuestions: QuestionDetail[] = [];
  questionMap.forEach((question, questionId) => {
    question.commentCount = commentCounts[questionId] || 0;
    // Remove temporary fields and convert to final type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { feedbacks: _, validValues: __, ...finalQuestion } = question;
    finalQuestions.push(finalQuestion);
  });

  // Sort questions by overall value (lowest to highest)
  return finalQuestions.sort((a, b) => a.overall - b.overall);
}

/**
 * Get session report data with error handling
 */
export async function getSessionReportDataSafe(
  sessionId: string,
  userId: string,
  userName?: string
): Promise<SessionReportData | null> {
  try {
    return await aggregateSessionReportData(sessionId, userId, userName);
  } catch (error) {
    console.error('Failed to get session report data:', error);
    return null;
  }
}

/**
 * Validate session access for user
 */
export async function validateSessionAccess(
  sessionId: string,
  userId: string
): Promise<boolean> {
  const supabase = await getServerSupabase();
  
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}
