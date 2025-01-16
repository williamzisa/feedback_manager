export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clusters: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          leader: string | null
          level: number | null
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id: string
          leader?: string | null
          level?: number | null
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          leader?: string | null
          level?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clusters_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_leader_fkey"
            columns: ["leader"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          question_id: string | null
          receiver: string | null
          response_tag: string | null
          response_value: number | null
          rule_id: string | null
          sender: string | null
          session_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id: string
          question_id?: string | null
          receiver?: string | null
          response_tag?: string | null
          response_value?: number | null
          rule_id?: string | null
          sender?: string | null
          session_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          receiver?: string | null
          response_tag?: string | null
          response_value?: number | null
          rule_id?: string | null
          sender?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          company: string | null
          created_at: string | null
          execution_weight: number
          id: string
          role: string
          soft_weight: number
          standard: number
          step: number
          strategy_weight: number
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          execution_weight: number
          id: string
          role: string
          soft_weight: number
          standard: number
          step: number
          strategy_weight: number
        }
        Update: {
          company?: string | null
          created_at?: string | null
          execution_weight?: number
          id?: string
          role?: string
          soft_weight?: number
          standard?: number
          step?: number
          strategy_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "levels_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          linked_question_id: string | null
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id: string
          linked_question_id?: string | null
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          linked_question_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processes_linked_question_id_fkey"
            columns: ["linked_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_tags: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          question_id: string | null
          score: number
          tag: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id: string
          question_id?: string | null
          score: number
          tag: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          question_id?: string | null
          score?: number
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_tags_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          text: string
          type: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id: string
          text: string
          type: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          company: string | null
          content_sql: string
          created_at: string | null
          id: string
          number: number
        }
        Insert: {
          company?: string | null
          content_sql: string
          created_at?: string | null
          id: string
          number: number
        }
        Update: {
          company?: string | null
          content_sql?: string
          created_at?: string | null
          id?: string
          number?: number
        }
        Relationships: [
          {
            foreignKeyName: "rules_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          cluster_participants: number
          company: string | null
          created_at: string | null
          end_time: string | null
          feedback_generated: number
          id: string
          name: string
          rules_applied: number[]
          start_time: string | null
          status: string
          team_participants: number
          user_participants: number
        }
        Insert: {
          cluster_participants: number
          company?: string | null
          created_at?: string | null
          end_time?: string | null
          feedback_generated: number
          id: string
          name: string
          rules_applied: number[]
          start_time?: string | null
          status: string
          team_participants: number
          user_participants: number
        }
        Update: {
          cluster_participants?: number
          company?: string | null
          created_at?: string | null
          end_time?: string | null
          feedback_generated?: number
          id?: string
          name?: string
          rules_applied?: number[]
          start_time?: string | null
          status?: string
          team_participants?: number
          user_participants?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_clusters: {
        Row: {
          cluster_id: string | null
          created_at: string | null
          id: string
          team_id: string | null
        }
        Insert: {
          cluster_id?: string | null
          created_at?: string | null
          id: string
          team_id?: string | null
        }
        Update: {
          cluster_id?: string | null
          created_at?: string | null
          id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_clusters_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_clusters_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          leader: string | null
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id: string
          leader?: string | null
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          leader?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_leader_fkey"
            columns: ["leader"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_processes: {
        Row: {
          created_at: string | null
          id: string
          process_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          process_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          process_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_processes_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_processes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_teams: {
        Row: {
          created_at: string | null
          id: string
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          admin: boolean
          company: string | null
          created_at: string | null
          email: string
          id: string
          level: number | null
          mentor: string | null
          name: string
          surname: string
        }
        Insert: {
          admin?: boolean
          company?: string | null
          created_at?: string | null
          email: string
          id: string
          level?: number | null
          mentor?: string | null
          name: string
          surname: string
        }
        Update: {
          admin?: boolean
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          level?: number | null
          mentor?: string | null
          name?: string
          surname?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_level_fkey"
            columns: ["level"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_mentor_fkey"
            columns: ["mentor"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
