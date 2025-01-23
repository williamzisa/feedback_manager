import * as z from "zod"
import { Level } from "@/lib/types/users"

const levelEnum: [Level, ...Level[]] = [
  'Junior 1', 'Junior 2', 'Junior 3',
  'Mid 1', 'Mid 2', 'Mid 3',
  'Senior 1', 'Senior 2', 'Senior 3',
  'Manager (F) 1', 'PCG Manager 1'
]

export const userSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  surname: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Email non valida"),
  role: z.string().default('user'),
  isMentor: z.boolean().default(false),
  isActive: z.boolean().default(true),
  processes: z.array(z.string()).default([]),
  level: z.enum(levelEnum as [string, ...string[]]).nullable(),
  mentorId: z.string().nullable().default(null)
}) 