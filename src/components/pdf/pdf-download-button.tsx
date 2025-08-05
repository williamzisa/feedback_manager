'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { usePDFGenerator } from './pdf-generator';
import { SessionReportData } from '@/lib/types/pdf-report';

interface PDFDownloadButtonProps {
  sessionId: string;
  userId: string;
  userName?: string;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * PDF Download Button Component
 * Handles PDF generation and download with loading states and error handling
 */
export function PDFDownloadButton({ 
  sessionId, 
  userId, 
  userName,
  disabled = false,
  className = '',
  compact = false
}: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generatePDF, isSupported } = usePDFGenerator();

  const handleDownload = async (): Promise<void> => {
    if (!sessionId || !userId) {
      setError('Missing session or user information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch session data from API route
      const params = new URLSearchParams({
        sessionId,
        userId,
        ...(userName && { userName })
      });

      const response = await fetch(`/api/pdf/session-report?${params}`);
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch session data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('PDF API Error Details:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data: SessionReportData = await response.json();

      // Generate and download PDF
      await generatePDF(data, {
        fileName: `risultati-${data.sessionInfo.name}-${data.sessionInfo.userName}.pdf`
      });

    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Errore durante la generazione del PDF. Riprova.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-2">
        <Button
          onClick={() => setError(null)}
          disabled={disabled}
          variant="outline"
          className={compact ? `text-sm ${className}` : `w-full py-4 rounded-full text-lg ${className}`}
        >
          <AlertCircle className={compact ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"} />
          {compact ? "Riprova" : "Riprova Download"}
        </Button>
        <p className="text-sm text-red-600 text-center">{error}</p>
      </div>
    );
  }

  // Show unsupported state
  if (!isSupported) {
    return (
      <Button
        disabled={true}
        variant="outline"
        className={compact ? `text-sm opacity-50 ${className}` : `w-full py-4 rounded-full text-lg opacity-50 ${className}`}
      >
        <FileText className={compact ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"} />
        {compact ? "N/A" : "PDF non supportato"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isLoading}
      className={compact 
        ? `bg-red-500 hover:bg-red-600 text-white text-sm transition-all duration-200 ${className}`
        : `w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-full text-lg mt-4 transition-all duration-200 ${className}`
      }
    >
      {isLoading ? (
        <>
          <div className={compact ? "w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" : "w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"} />
          {compact ? "PDF..." : "Generazione PDF..."}
        </>
      ) : (
        <>
          <Download className={compact ? "w-4 h-4 mr-1" : "w-5 h-5 mr-2"} />
          {compact ? "PDF" : "Scarica risultati"}
        </>
      )}
    </Button>
  );
}

/**
 * PDF Download Button with Preview
 * Extended version with preview functionality
 */
interface PDFDownloadButtonWithPreviewProps extends PDFDownloadButtonProps {
  showPreview?: boolean;
  onPreviewGenerated?: (previewUrl: string) => void;
}

export function PDFDownloadButtonWithPreview({ 
  sessionId, 
  userId, 
  userName,
  disabled = false,
  className = '',
  showPreview = false,
  onPreviewGenerated
}: PDFDownloadButtonWithPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generatePDF, generatePreview, isSupported } = usePDFGenerator();

  const handleDownload = async (): Promise<void> => {
    if (!sessionId || !userId) {
      setError('Missing session or user information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch session data from API route
      const params = new URLSearchParams({
        sessionId,
        userId,
        ...(userName && { userName })
      });

      const response = await fetch(`/api/pdf/session-report?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch session data');
      }

      const data: SessionReportData = await response.json();

      await generatePDF(data, {
        fileName: `risultati-${data.sessionInfo.name}-${data.sessionInfo.userName}.pdf`
      });

    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Errore durante la generazione del PDF. Riprova.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (): Promise<void> => {
    if (!sessionId || !userId || !onPreviewGenerated) return;

    setIsGeneratingPreview(true);
    setError(null);

    try {
      // Fetch session data from API route
      const params = new URLSearchParams({
        sessionId,
        userId,
        ...(userName && { userName })
      });

      const response = await fetch(`/api/pdf/session-report?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch session data');
      }

      const data: SessionReportData = await response.json();

      const previewUrl = await generatePreview(data);
      if (previewUrl) {
        onPreviewGenerated(previewUrl);
      }

    } catch (err) {
      console.error('Error generating preview:', err);
      setError('Errore durante la generazione dell\'anteprima');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  if (!isSupported) {
    return (
      <Button
        disabled={true}
        variant="outline"
        className={`w-full py-4 rounded-full text-lg opacity-50 ${className}`}
      >
        <FileText className="w-5 h-5 mr-2" />
        PDF non supportato
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main download button */}
      <Button
        onClick={handleDownload}
        disabled={disabled || isLoading || isGeneratingPreview}
        className={`w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-full text-lg transition-all duration-200 ${className}`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generazione PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Scarica risultati
          </>
        )}
      </Button>

      {/* Preview button */}
      {showPreview && onPreviewGenerated && (
        <Button
          onClick={handlePreview}
          disabled={disabled || isLoading || isGeneratingPreview}
          variant="outline"
          className="w-full py-2 rounded-full"
        >
          {isGeneratingPreview ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              Generazione anteprima...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Anteprima PDF
            </>
          )}
        </Button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

/**
 * Compact PDF Download Button
 * Smaller version for use in tables or compact layouts
 */
interface CompactPDFDownloadButtonProps {
  sessionId: string;
  userId: string;
  userName?: string;
  disabled?: boolean;
}

export function CompactPDFDownloadButton({ 
  sessionId, 
  userId, 
  userName,
  disabled = false
}: CompactPDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { generatePDF, isSupported } = usePDFGenerator();

  const handleDownload = async (): Promise<void> => {
    if (!sessionId || !userId) return;

    setIsLoading(true);

    try {
      // Fetch session data from API route
      const params = new URLSearchParams({
        sessionId,
        userId,
        ...(userName && { userName })
      });

      const response = await fetch(`/api/pdf/session-report?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch session data');
      }

      const data: SessionReportData = await response.json();

      await generatePDF(data);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Button
        disabled={true}
        variant="ghost"
        size="sm"
        className="opacity-50"
      >
        <FileText className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isLoading}
      variant="ghost"
      size="sm"
      className="hover:bg-red-50 hover:text-red-600"
      title="Scarica PDF risultati"
    >
      {isLoading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </Button>
  );
}
