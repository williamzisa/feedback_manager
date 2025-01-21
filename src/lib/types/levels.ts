import { z } from "zod"

export const levelSchema = z.object({
  ruolo: z.string().min(1, "Il ruolo è obbligatorio"),
  step: z.string().min(1, "Lo step è obbligatorio"),
  execution: z.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  soft: z.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  strategy: z.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  standard: z.string().min(1, "Lo standard è obbligatorio")
})

export type LevelFormData = z.infer<typeof levelSchema>

export interface Level extends LevelFormData {
  id: string
} 