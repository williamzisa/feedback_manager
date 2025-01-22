export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      levels: {
        Row: {
          id: string
          created_at: string
          ruolo: string | null
          step: string | null
          execution: number | null
          soft: number | null
          strategy: number | null
          standard: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          ruolo?: string | null
          step?: string | null
          execution?: number | null
          soft?: number | null
          strategy?: number | null
          standard?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          ruolo?: string | null
          step?: string | null
          execution?: number | null
          soft?: number | null
          strategy?: number | null
          standard?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reload_schema_cache: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
