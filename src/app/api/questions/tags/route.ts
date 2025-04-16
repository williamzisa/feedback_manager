import { NextResponse } from "next/server"
import { createQuestionTag, updateQuestionTag, deleteQuestionTag } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { question_id, score, description } = body

    if (!question_id || !score || !description) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      )
    }

    const result = await createQuestionTag({
      question_id,
      score,
      description
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore nella creazione del tag:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, score, description } = body

    if (!id || (!score && !description)) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      )
    }

    const result = await updateQuestionTag(id, {
      ...(score !== undefined && { score }),
      ...(description !== undefined && { description })
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore nell'aggiornamento del tag:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID mancante" },
        { status: 400 }
      )
    }

    const result = await deleteQuestionTag(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore nell'eliminazione del tag:", error)
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    )
  }
} 