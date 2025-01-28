import * as z from "zod"

export const ruleSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  description: z.string().optional(),
  content_sql: z.string().min(1, "Il codice SQL è obbligatorio"),
  number: z.number().min(1, "Il numero deve essere maggiore di 0")
})

export type RuleSchema = z.infer<typeof ruleSchema> 