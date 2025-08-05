import { GAP_EVALUATIONS, SKILL_TYPES } from '@/lib/types/pdf-report';

/**
 * Utility functions for PDF generation
 */

/**
 * Calculate gap evaluation based on gap value
 */
export function calculateGapEvaluation(gap: number): string {
  if (gap >= 0.5) return GAP_EVALUATIONS.PROMOTED;
  if (gap >= 0) return GAP_EVALUATIONS.STANDARD;
  return GAP_EVALUATIONS.BELOW_STANDARD;
}

/**
 * Get skill type configuration
 */
export function getSkillTypeConfig(type: 'STRATEGY' | 'SOFT' | 'EXECUTION') {
  return SKILL_TYPES[type];
}

/**
 * Format score for display (1 decimal place)
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Format date for PDF display
 */
export function formatDateForPDF(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Get color based on score value
 */
export function getScoreColor(score: number, threshold: number = 3.0): string {
  if (score >= threshold + 0.5) return '#10B981'; // Green for good scores
  if (score >= threshold) return '#6B7280'; // Gray for neutral scores
  return '#EF4444'; // Red for low scores
}

/**
 * Sanitize filename for download
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

/**
 * Generate PDF filename based on session data
 */
export function generatePDFFileName(sessionName: string, userName: string): string {
  const sanitizedSession = sanitizeFileName(sessionName);
  const sanitizedUser = sanitizeFileName(userName);
  const timestamp = new Date().toISOString().split('T')[0];
  
  return `risultati_${sanitizedSession}_${sanitizedUser}_${timestamp}.pdf`;
}

/**
 * Calculate percentage from score
 */
export function scoreToPercentage(score: number, maxScore: number = 5): number {
  return Math.round((score / maxScore) * 100);
}

/**
 * Get grade letter based on score
 */
export function getGradeLetter(score: number): string {
  if (score >= 4.5) return 'A+';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B+';
  if (score >= 3.0) return 'B';
  if (score >= 2.5) return 'C+';
  if (score >= 2.0) return 'C';
  if (score >= 1.5) return 'D+';
  if (score >= 1.0) return 'D';
  return 'F';
}

/**
 * Truncate text for PDF display
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert HTML entities for PDF
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * PDF page dimensions (A4 in mm)
 */
export const PDF_DIMENSIONS = {
  A4: {
    width: 210,
    height: 297,
    margin: 20
  },
  Letter: {
    width: 216,
    height: 279,
    margin: 20
  }
} as const;

/**
 * PDF styling constants
 */
export const PDF_STYLES = {
  fonts: {
    title: '18px',
    subtitle: '14px',
    body: '12px',
    score: '16px'
  },
  colors: {
    primary: '#1f2937',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#ffffff'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px'
  }
} as const;
