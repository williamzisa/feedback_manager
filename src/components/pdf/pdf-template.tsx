'use client';

import React from 'react';
import { PDFTemplateProps, SessionInfo, OverallResults, SkillResult, QuestionDetail } from '@/lib/types/pdf-report';
import { 
  formatScore, 
  getScoreColor, 
  getGradeLetter, 
  scoreToPercentage,
  scoreToPercentageRelativeToStandard,
  PDF_STYLES 
} from '@/lib/pdf/pdf-utils';

/**
 * PDF Template Component - Renders the complete PDF layout
 */
export function PDFTemplate({ data, isPreview = false }: PDFTemplateProps) {
  const containerStyle = {
    width: '210mm',
    minHeight: '297mm',
    padding: '15mm',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: 'white',
    color: PDF_STYLES.colors.primary,
    fontSize: PDF_STYLES.fonts.body,
    lineHeight: '1.3',
    ...(isPreview && { 
      transform: 'scale(0.7)', 
      transformOrigin: 'top left',
      border: '1px solid #e5e7eb'
    })
  };

  return (
    <div style={containerStyle} className="pdf-container">
      <PDFHeader sessionInfo={data.sessionInfo} />
      <PDFOverallResults results={data.overallResults} />
      <PDFSkillResults skills={data.skillResults} standardLevel={data.overallResults.standard} />
      <PDFQuestionDetails questions={data.questionDetails} />
      <PDFFooter />
    </div>
  );
}

/**
 * PDF Header Component
 */
function PDFHeader({ sessionInfo }: { sessionInfo: SessionInfo }) {
  return (
    <div style={{ marginBottom: PDF_STYLES.spacing.large, textAlign: 'center' }}>
      <h1 style={{ 
        fontSize: PDF_STYLES.fonts.title, 
        fontWeight: 'bold',
        margin: '0 0 16px 0',
        color: PDF_STYLES.colors.primary
      }}>
        Risultati della Sessione 360
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: PDF_STYLES.spacing.medium,
        marginBottom: PDF_STYLES.spacing.medium,
        padding: PDF_STYLES.spacing.medium,
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <div>
          <strong>Nome:</strong> {sessionInfo.userName}
        </div>
        <div>
          <strong>Sessione:</strong> {sessionInfo.name}
        </div>
        <div>
          <strong>Data:</strong> {sessionInfo.endDate}
        </div>
        <div>
          <strong>Status:</strong> {sessionInfo.status}
        </div>
      </div>
    </div>
  );
}

/**
 * Overall Results Section
 */
function PDFOverallResults({ results }: { results: OverallResults }) {
  const overallGrade = getGradeLetter(results.overall);
  const overallPercentage = scoreToPercentage(results.overall);
  
  return (
    <div style={{ marginBottom: PDF_STYLES.spacing.large }}>
      <h2 style={{ 
        fontSize: PDF_STYLES.fonts.subtitle, 
        fontWeight: 'bold',
        marginBottom: PDF_STYLES.spacing.medium,
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: PDF_STYLES.spacing.small
      }}>
        Risultati Complessivi
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: PDF_STYLES.spacing.medium,
        marginBottom: PDF_STYLES.spacing.medium
      }}>
        <ScoreCard 
          label="Overall" 
          score={results.overall} 
          grade={overallGrade}
          percentage={overallPercentage}
          isPrimary={true}
        />
        <ScoreCard 
          label="Self" 
          score={results.self} 
          grade={getGradeLetter(results.self)}
          percentage={scoreToPercentage(results.self)}
        />
        <ScoreCard 
          label="Mentor" 
          score={results.mentor} 
          grade={getGradeLetter(results.mentor)}
          percentage={scoreToPercentage(results.mentor)}
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: PDF_STYLES.spacing.medium
      }}>
        <div style={{ 
          padding: PDF_STYLES.spacing.medium,
          backgroundColor: '#f3f4f6',
          borderRadius: '6px'
        }}>
          <div><strong>Standard Livello:</strong> {formatScore(results.standard)}</div>
        </div>
        <div style={{ 
          padding: PDF_STYLES.spacing.medium,
          backgroundColor: getScoreColor(results.gap, 0) === '#10B981' ? '#ecfdf5' : 
                           getScoreColor(results.gap, 0) === '#EF4444' ? '#fef2f2' : '#f9fafb',
          borderRadius: '6px'
        }}>
          <div><strong>Gap:</strong> {formatScore(results.gap)}</div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {results.gapEvaluation}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Score Card Component
 */
function ScoreCard({ 
  label, 
  score, 
  grade, 
  percentage, 
  isPrimary = false 
}: { 
  label: string; 
  score: number; 
  grade: string; 
  percentage: number; 
  isPrimary?: boolean;
}) {
  const scoreColor = getScoreColor(score);
  
  return (
    <div style={{ 
      padding: PDF_STYLES.spacing.medium,
      backgroundColor: isPrimary ? '#f0f9ff' : '#f9fafb',
      borderRadius: '8px',
      border: isPrimary ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 'bold',
        marginBottom: '4px',
        color: '#6b7280'
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: PDF_STYLES.fonts.score, 
        fontWeight: 'bold',
        color: scoreColor,
        marginBottom: '4px'
      }}>
        {formatScore(score)}
      </div>
      <div style={{ 
        fontSize: '11px',
        color: '#6b7280'
      }}>
        {grade} ({percentage}%)
      </div>
    </div>
  );
}

/**
 * Skills Results Section
 */
function PDFSkillResults({ skills, standardLevel }: { skills: SkillResult[]; standardLevel: number }) {
  if (skills.length === 0) return null;
  
  return (
    <div style={{ marginBottom: PDF_STYLES.spacing.large }}>
      <h2 style={{ 
        fontSize: PDF_STYLES.fonts.subtitle, 
        fontWeight: 'bold',
        marginBottom: PDF_STYLES.spacing.medium,
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: PDF_STYLES.spacing.small
      }}>
        Risultati per Competenza
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gap: PDF_STYLES.spacing.medium
      }}>
        {skills.map((skill, index) => (
          <SkillRow key={index} skill={skill} standardLevel={standardLevel} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skill Row Component
 */
function SkillRow({ skill, standardLevel }: { skill: SkillResult; standardLevel: number }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
      gap: PDF_STYLES.spacing.small,
      padding: PDF_STYLES.spacing.medium,
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      borderLeft: `4px solid ${skill.color}`,
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
          {skill.displayName}
        </div>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          Peso: {skill.weight.toFixed(0)}% • {skill.feedbackCount} feedback
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', color: getScoreColor(skill.overall) }}>
          {formatScore(skill.overall)}
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280' }}>Overall</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>
          {formatScore(skill.self)}
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280' }}>Self</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>
          {formatScore(skill.mentor)}
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280' }}>Mentor</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: skill.color,
          fontSize: '14px'
        }}>
          {getGradeLetter(skill.overall)}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {scoreToPercentageRelativeToStandard(skill.overall, standardLevel)}%
        </div>
      </div>
    </div>
  );
}

/**
 * Question Details Section
 */
function PDFQuestionDetails({ questions }: { questions: QuestionDetail[] }) {
  if (questions.length === 0) return null;
  
  return (
    <div style={{ marginBottom: PDF_STYLES.spacing.large }}>
      <h2 style={{ 
        fontSize: PDF_STYLES.fonts.subtitle, 
        fontWeight: 'bold',
        marginBottom: PDF_STYLES.spacing.medium,
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: PDF_STYLES.spacing.small
      }}>
        Dettaglio Domande
      </h2>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: PDF_STYLES.spacing.small
      }}>
        {questions.map((question, index) => (
          <QuestionRow key={index} question={question} />
        ))}
      </div>
    </div>
  );
}

/**
 * Question Row Component
 */
function QuestionRow({ question }: { question: QuestionDetail }) {
  const skillColor = question.skillType === 'STRATEGY' ? '#00BFA5' :
                    question.skillType === 'SOFT' ? '#F5A623' :
                    question.skillType === 'EXECUTION' ? '#4285F4' : '#6b7280';
  
  return (
    <div style={{ 
      padding: PDF_STYLES.spacing.small,
      backgroundColor: '#fafafa',
      borderRadius: '4px',
      borderLeft: `3px solid ${skillColor}`,
      fontSize: '11px'
    }}>
      {/* Header row with question and scores */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '4fr 1fr 1fr 1fr',
        gap: PDF_STYLES.spacing.small,
        alignItems: 'center',
        marginBottom: question.initiatives.length > 0 ? '8px' : '0'
      }}>
        <div style={{ fontWeight: 'bold' }}>
          {question.description.length > 100 
            ? question.description.substring(0, 100) + '...' 
            : question.description}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {formatScore(question.overall)}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {formatScore(question.mentorValue)}
        </div>
        <div style={{ textAlign: 'center' }}>
          {question.commentCount > 0 && (
            <span style={{ 
              backgroundColor: '#e5e7eb', 
              padding: '2px 6px', 
              borderRadius: '10px',
              fontSize: '10px'
            }}>
              {question.commentCount} commenti
            </span>
          )}
        </div>
      </div>
      
      {/* Initiatives section - full width */}
      {question.initiatives.length > 0 && (
        <div style={{ 
          color: '#6b7280', 
          fontSize: '10px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '6px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Iniziative ({question.initiatives.length}):
          </div>
          {question.initiatives.slice(0, 5).map((initiative, idx) => (
            <div key={idx} style={{ 
              marginTop: '3px', 
              paddingLeft: '8px',
              lineHeight: '1.3',
              wordWrap: 'break-word'
            }}>
              • {initiative}
            </div>
          ))}
          {question.initiatives.length > 5 && (
            <div style={{ 
              marginTop: '3px', 
              paddingLeft: '8px', 
              fontStyle: 'italic',
              color: '#9ca3af'
            }}>
              ... e altre {question.initiatives.length - 5} iniziative
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * PDF Footer Component
 */
function PDFFooter() {
  const currentDate = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div style={{ 
      marginTop: 'auto',
      paddingTop: PDF_STYLES.spacing.large,
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center',
      fontSize: '10px',
      color: '#6b7280'
    }}>
      <div>
        Documento generato automaticamente il {currentDate}
      </div>
      <div style={{ marginTop: '4px' }}>
        Feedback Manager - Sistema di Valutazione delle Competenze
      </div>
    </div>
  );
}
