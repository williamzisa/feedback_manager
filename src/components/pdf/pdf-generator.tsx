'use client';

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SessionReportData, PDFGenerationOptions } from '@/lib/types/pdf-report';
import { PDFTemplate } from './pdf-template';
import { generatePDFFileName } from '@/lib/pdf/pdf-utils';
import { createRoot } from 'react-dom/client';

/**
 * PDF Generator Class - Handles PDF creation and download
 */
export class PDFGenerator {
  /**
   * Generate and download session report PDF
   */
  static async generateSessionReport(
    data: SessionReportData,
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const {
      fileName,
      format = 'A4',
      orientation = 'portrait'
    } = options;

    try {
      // Create temporary container for PDF rendering
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      document.body.appendChild(container);

      // Render PDF template to container
      const root = createRoot(container);
      await new Promise<void>((resolve) => {
        root.render(<PDFTemplate data={data} isPreview={false} />);
        // Wait for rendering to complete (reduced timeout)
        setTimeout(resolve, 500);
      });

      // Convert to canvas with optimized settings
      const canvas = await html2canvas(container, {
        scale: 1, // Reduced from 2 to 1 for smaller file size
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: container.scrollWidth,
        height: container.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false, // Disable logging for better performance
        imageTimeout: 5000
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
        compress: true // Enable PDF compression
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8); // 80% quality for smaller file size
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit page
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image to PDF with pagination if needed
      if (imgHeight <= pdfHeight) {
        // Single page
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multiple pages
        let position = 0;
        const pageHeight = pdfHeight;
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            imgData, 
            'JPEG', 
            0, 
            -position, 
            imgWidth, 
            imgHeight
          );
          
          position += pageHeight;
        }
      }

      // Generate filename
      const finalFileName = fileName || generatePDFFileName(
        data.sessionInfo.name,
        data.sessionInfo.userName
      );

      // Download PDF
      pdf.save(finalFileName);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Generate PDF preview (returns blob URL)
   */
  static async generatePreview(
    data: SessionReportData,
    options: PDFGenerationOptions = {}
  ): Promise<string> {
    const {
      format = 'A4',
      orientation = 'portrait'
    } = options;

    try {
      // Create temporary container for PDF rendering
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      document.body.appendChild(container);

      // Render PDF template to container
      const root = createRoot(container);
      await new Promise<void>((resolve) => {
        root.render(<PDFTemplate data={data} isPreview={true} />);
        setTimeout(resolve, 500);
      });

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format,
        compress: true // Enable PDF compression
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8); // 80% quality for smaller file size
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));

      // Get blob URL
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);

      return blobUrl;

    } catch (error) {
      console.error('Error generating PDF preview:', error);
      throw new Error('Failed to generate PDF preview.');
    }
  }

  /**
   * Validate data before PDF generation
   */
  static validateData(data: SessionReportData): boolean {
    if (!data.sessionInfo?.name || !data.sessionInfo?.userName) {
      return false;
    }
    
    if (!data.overallResults || typeof data.overallResults.overall !== 'number') {
      return false;
    }

    return true;
  }

  /**
   * Get estimated PDF size in MB
   */
  static estimatePDFSize(data: SessionReportData): number {
    const baseSize = 0.5; // Base PDF size in MB
    const questionSize = data.questionDetails.length * 0.01; // ~10KB per question
    const skillSize = data.skillResults.length * 0.005; // ~5KB per skill
    
    return baseSize + questionSize + skillSize;
  }

  /**
   * Check if PDF generation is supported
   */
  static isSupported(): boolean {
    try {
      return !!(window && document && typeof html2canvas !== 'undefined' && typeof jsPDF !== 'undefined');
    } catch {
      return false;
    }
  }
}

/**
 * Hook for PDF generation with loading state
 */
export function usePDFGenerator() {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const generatePDF = React.useCallback(async (
    data: SessionReportData,
    options?: PDFGenerationOptions
  ) => {
    if (!PDFGenerator.isSupported()) {
      setError('PDF generation is not supported in this browser');
      return;
    }

    if (!PDFGenerator.validateData(data)) {
      setError('Invalid data provided for PDF generation');
      return;
    }

    const estimatedSize = PDFGenerator.estimatePDFSize(data);
    if (estimatedSize > 10) {
      setError('PDF would be too large. Please reduce the number of questions.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await PDFGenerator.generateSessionReport(data, options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generatePreview = React.useCallback(async (
    data: SessionReportData,
    options?: PDFGenerationOptions
  ): Promise<string | null> => {
    if (!PDFGenerator.isSupported() || !PDFGenerator.validateData(data)) {
      return null;
    }

    try {
      return await PDFGenerator.generatePreview(data, options);
    } catch {
      return null;
    }
  }, []);

  return {
    generatePDF,
    generatePreview,
    isGenerating,
    error,
    isSupported: PDFGenerator.isSupported()
  };
}


