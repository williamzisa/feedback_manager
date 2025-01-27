import { z } from "zod"

export const levelSchema = z.object({
  role: z.string().nullable().refine((val) => val !== null, "Il ruolo è obbligatorio"),
  step: z.coerce.number().min(0, "Lo step deve essere un numero positivo"),
  execution_weight: z.coerce.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  soft_weight: z.coerce.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  strategy_weight: z.coerce.number().min(0).max(100, "La percentuale deve essere tra 0 e 100"),
  standard: z.coerce.number().min(0, "Lo standard deve essere un numero positivo")
})

export type LevelFormData = z.infer<typeof levelSchema>

export type Level = {
  id: string;
  role: string | null;
  step: number;
  execution_weight: number;
  soft_weight: number;
  strategy_weight: number;
  standard: number;
  company: string;
  created_at?: string;
}; 