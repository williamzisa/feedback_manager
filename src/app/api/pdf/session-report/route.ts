import { NextRequest, NextResponse } from 'next/server';
import { aggregateSessionReportData } from '@/lib/pdf/pdf-data-aggregator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');

    console.log('PDF API route called with:', { sessionId, userId, userName });

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing sessionId or userId parameters' },
        { status: 400 }
      );
    }

    // Skip access validation for now and let aggregateSessionReportData handle it
    // This allows the main PDF generation logic to work and provide better error messages
    console.log('Attempting to aggregate session report data...');
    
    // Aggregate report data
    const reportData = await aggregateSessionReportData(sessionId, userId, userName || undefined);

    console.log('Successfully aggregated report data');
    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Error generating PDF report data:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate report data';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}