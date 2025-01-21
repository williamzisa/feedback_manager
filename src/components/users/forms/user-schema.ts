import * as z from "zod"
import { Level } from "@/lib/types/users"

const levelEnum: [Level, ...Level[]] = ['Junior', 'Mid', 'Senior']

export const userSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  surname: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Email non valida"),
  role: z.string().min(1, "Il ruolo è obbligatorio"),
  isMentor: z.boolean().default(false),
  isActive: z.boolean().default(true),
  processes: z.array(z.string()).default([]),
  level: z.enum(levelEnum).default('Junior'),
  mentorId: z.string().nullable().default(null)
}) 