import type { Database } from "../supabase/database.types"

export type Rule = Database["public"]["Tables"]["rules"]["Row"]
export type RuleInsert = Database["public"]["Tables"]["rules"]["Insert"]
export type RuleUpdate = Database["public"]["Tables"]["rules"]["Update"]

export interface RuleFormData {
  name: string
  description: string
  content_sql: string
  number: number
  template?: boolean
} 