import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase/database.types";

export async function POST(
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
    const body = await request.json();

    // Se stiamo collegando un processo esistente
    if (body.isExisting) {
      // Verifichiamo che il processo esista e appartenga alla stessa company
      const { data: process, error: processError } = await supabase
        .from("processes")
        .select("id")
        .eq("id", body.processId)
        .eq("company", currentUser.company)
        .single();

      if (processError || !process) {
        return NextResponse.json(
          { error: "Processo non trovato o non accessibile" },
          { status: 404 }
        );
      }

      // Colleghiamo il processo esistente al team
      const { error: teamProcessError } = await supabase
        .from("team_processes")
        .insert([{
          team_id: params.teamId,
          process_id: process.id,
        }]);

      if (teamProcessError) {
        console.error(
          "Errore nell'associazione del processo al team:",
          teamProcessError
        );
        return NextResponse.json(
          { error: "Errore nell'associazione del processo al team" },
          { status: 500 }
        );
      }

      return NextResponse.json(process);
    }
    
    // Altrimenti creiamo un nuovo processo
    const { data: process, error: processError } = await supabase
      .from("processes")
      .insert([{
        name: body.name,
        linked_question_id: body.linked_question_id,
        company: currentUser.company,
      }])
      .select()
      .single();

    if (processError) {
      console.error("Errore nella creazione del processo:", processError);
      return NextResponse.json(
        { error: "Errore nella creazione del processo" },
        { status: 500 }
      );
    }

    // Associamo il processo al team
    const { error: teamProcessError } = await supabase
      .from("team_processes")
      .insert([{
        team_id: params.teamId,
        process_id: process.id,
      }]);

    if (teamProcessError) {
      console.error(
        "Errore nell'associazione del processo al team:",
        teamProcessError
      );
      return NextResponse.json(
        { error: "Errore nell'associazione del processo al team" },
        { status: 500 }
      );
    }

    return NextResponse.json(process);
  } catch (error) {
    console.error("Errore nella creazione del processo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
} 