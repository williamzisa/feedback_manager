import * as z from 'zod'

export const questionSchema = z.object({
  text: z.string().min(1, 'La domanda è obbligatoria'),
  type: z.enum(['SOFT', 'STRATEGY', 'EXECUTION'])
})

export type QuestionFormData = z.infer<typeof questionSchema>