export interface SessionInfo {
  name: string;
  endDate: string;
  userName: string;
  status: string;
}

export interface OverallResults {
  overall: number;
  self: number;
  standard: number;
  mentor: number;
  gap: number;
  gapEvaluation: string;
}

export interface SessionReportData {
  // Session metadata
  sessionInfo: SessionInfo;
  
  // Overall results
  overallResults: OverallResults;
  
  // Skill results
  skillResults: SkillResult[];
  
  // Question details
  questionDetails: QuestionDetail[];
}

export interface SkillResult {
  type: 'STRATEGY' | 'SOFT' | 'EXECUTION';
  displayName: string;
  weight: number;
  overall: number;
  self: number;
  mentor: number;
  feedbackCount: number;
  color: string;
}

export interface QuestionDetail {
  id: string;
  description: string;
  skillType: string;
  overall: number;
  mentorValue: number;
  commentCount: number;
  initiatives: string[];
}

// PDF generation options
export interface PDFGenerationOptions {
  fileName?: string;
  includeInitiatives?: boolean;
  includeComments?: boolean;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

// PDF template props
export interface PDFTemplateProps {
  data: SessionReportData;
  isPreview?: boolean;
  options?: PDFGenerationOptions;
}

// Skill type configuration
export const SKILL_TYPES = {
  STRATEGY: {
    displayName: 'Strategy Skills',
    color: '#00BFA5'
  },
  SOFT: {
    displayName: 'Soft Skills', 
    color: '#F5A623'
  },
  EXECUTION: {
    displayName: 'Execution Skills',
    color: '#4285F4'
  }
} as const;

// Gap evaluation types
export const GAP_EVALUATIONS = {
  PROMOTED: 'Sopra Standard',
  STANDARD: 'Standard',
  BELOW_STANDARD: 'Sotto Standard'
} as const;

export type GapEvaluationType = typeof GAP_EVALUATIONS[keyof typeof GAP_EVALUATIONS];
