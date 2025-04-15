import { getCurrentUser } from "@/lib/supabase/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function GET() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const currentUser = await getCurrentUser()

    if (!currentUser.company) {
      throw new Error("Company non configurata per questo utente")
    }

    const { data, error } = await supabase
      .from("questions")
      .select("id, description")
      .eq("company", currentUser.company)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Errore nel recupero delle domande:", error)
    return NextResponse.json(
      { error: "Errore nel recupero delle domande" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser.company) {
      return NextResponse.json(
        { error: "Company non configurata per questo utente" },
        { status: 400 }
      );
    }

    const supabase = createClientComponentClient<Database>();
    const body = await request.json();

    const { data: question, error } = await supabase
      .from("questions")
      .insert([{
        description: body.description,
        type: body.type,
        company: currentUser.company,
      }])
      .select()
      .single();

    if (error) {
      console.error("Errore nella creazione della domanda:", error);
      return NextResponse.json(
        { error: "Errore nella creazione della domanda" },
        { status: 500 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Errore nella creazione della domanda:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
} 