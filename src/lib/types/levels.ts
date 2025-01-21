import { z } from "zod"

export const levelSchema = z.object({
  role: z.string().min(1, "Il ruolo è obbligatorio"),
  step: z.number().min(0, "Lo step deve essere un numero positivo"),
  execution_weight: z.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  soft_weight: z.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  strategy_weight: z.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  standard: z.number().min(0, "Lo standard deve essere un numero positivo")
})

export type LevelFormData = z.infer<typeof levelSchema>

export interface Level extends LevelFormData {
  id: string
  created_at?: string
  company?: string | null
} 