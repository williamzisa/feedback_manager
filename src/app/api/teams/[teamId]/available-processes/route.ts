import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser.company) {
      return NextResponse.json(
        { error: "Company non configurata per questo utente" },
        { status: 400 }
      );
    }

    const supabase = createClientComponentClient<Database>();

    // 1. Otteniamo prima i processi già associati al team
    const { data: teamProcesses } = await supabase
      .from("team_processes")
      .select("process_id")
      .eq("team_id", params.teamId);

    const existingProcessIds = teamProcesses?.map(tp => tp.process_id) || [];

    // 2. Otteniamo tutti i processi della company che non sono già associati al team
    const { data: availableProcesses, error } = await supabase
      .from("processes")
      .select(`
        id,
        name,
        questions!processes_linked_question_id_fkey (
          id,
          description
        )
      `)
      .eq("company", currentUser.company)
      .not("id", "in", existingProcessIds.length > 0 ? `(${existingProcessIds.join(",")})` : "(0)")
      .order("name");

    if (error) {
      console.error("Errore nel recupero dei processi disponibili:", error);
      return NextResponse.json(
        { error: "Errore nel recupero dei processi disponibili" },
        { status: 500 }
      );
    }

    return NextResponse.json(availableProcesses);
  } catch (error) {
    console.error("Errore nel recupero dei processi disponibili:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
} 