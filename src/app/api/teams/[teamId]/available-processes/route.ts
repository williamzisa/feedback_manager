import { NextResponse } from "next/server";

// Versione semplificata e statica per risolvere i problemi di build
export function GET() {
  // Restituiamo una risposta vuota per consentire l'avvio dell'app
  return NextResponse.json([]);
} 