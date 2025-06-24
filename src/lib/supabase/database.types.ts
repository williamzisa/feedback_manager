export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clusters: {
        Row: {
          company: string | null
          created_at: string
          id: string
          leader: string | null
          level: number | null
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          leader?: string | null
          level?: number | null
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string
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
          one_to_one_landing: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          one_to_one_landing?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          one_to_one_landing?: string | null
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          comment: string | null
          company: string
          created_at: string
          id: string
          is_mentor: boolean | null
          is_self: boolean | null
          question_id: string | null
          receiver: string | null
          rule_id: string | null
          rule_number: number | null
          sender: string | null
          session_id: string
          value: number | null
        }
        Insert: {
          comment?: string | null
          company: string
          created_at?: string
          id?: string
          is_mentor?: boolean | null
          is_self?: boolean | null
          question_id?: string | null
          receiver?: string | null
          rule_id?: string | null
          rule_number?: number | null
          sender?: string | null
          session_id: string
          value?: number | null
        }
        Update: {
          comment?: string | null
          company?: string
          created_at?: string
          id?: string
          is_mentor?: boolean | null
          is_self?: boolean | null
          question_id?: string | null
          receiver?: string | null
          rule_id?: string | null
          rule_number?: number | null
          sender?: string | null
          session_id?: string
          value?: number | null
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
      initiatives: {
        Row: {
          created_at: string
          description: string | null
          id: string
          question_id: string | null
          session_id: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          question_id?: string | null
          session_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          question_id?: string | null
          session_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          company: string
          created_at: string
          execution_weight: number
          id: string
          role: string | null
          soft_weight: number
          standard: number
          step: number
          strategy_weight: number
        }
        Insert: {
          company: string
          created_at?: string
          execution_weight: number
          id?: string
          role?: string | null
          soft_weight: number
          standard: number
          step: number
          strategy_weight: number
        }
        Update: {
          company?: string
          created_at?: string
          execution_weight?: number
          id?: string
          role?: string | null
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
      pcg_session_2025: {
        Row: {
          comment: string | null
          company: string
          created_at: string
          id: string
          is_mentor: boolean | null
          is_self: boolean | null
          question_description: string | null
          question_id: string | null
          receiver: string | null
          receiver_name: string | null
          rule_number: number | null
          sender: string | null
          sender_name: string | null
          session_id: string
          type: string | null
          value: number | null
        }
        Insert: {
          comment?: string | null
          company: string
          created_at?: string
          id?: string
          is_mentor?: boolean | null
          is_self?: boolean | null
          question_description?: string | null
          question_id?: string | null
          receiver?: string | null
          receiver_name?: string | null
          rule_number?: number | null
          sender?: string | null
          sender_name?: string | null
          session_id: string
          type?: string | null
          value?: number | null
        }
        Update: {
          comment?: string | null
          company?: string
          created_at?: string
          id?: string
          is_mentor?: boolean | null
          is_self?: boolean | null
          question_description?: string | null
          question_id?: string | null
          receiver?: string | null
          receiver_name?: string | null
          rule_number?: number | null
          sender?: string | null
          sender_name?: string | null
          session_id?: string
          type?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pcg_session_2025_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pcg_session_2025_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pcg_session_2025_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pcg_session_2025_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pcg_session_2025_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          company: string
          created_at: string
          id: string
          linked_question_id: string
          name: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          linked_question_id: string
          name: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          linked_question_id?: string
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
          company: string
          created_at: string
          description: string
          id: string
          question_id: string
          score: number
        }
        Insert: {
          company: string
          created_at?: string
          description: string
          id?: string
          question_id: string
          score: number
        }
        Update: {
          company?: string
          created_at?: string
          description?: string
          id?: string
          question_id?: string
          score?: number
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
          company: string
          created_at: string
          description: string
          id: string
          type: string
        }
        Insert: {
          company: string
          created_at?: string
          description: string
          id?: string
          type: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string
          id?: string
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
          company: string
          content_sql: string
          created_at: string
          description: string | null
          id: string
          name: string
          number: number
          template: boolean | null
        }
        Insert: {
          company: string
          content_sql: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          number: number
          template?: boolean | null
        }
        Update: {
          company?: string
          content_sql?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          number?: number
          template?: boolean | null
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
      session_clusters: {
        Row: {
          cluster_id: string
          created_at: string | null
          id: string
          session_id: string
        }
        Insert: {
          cluster_id: string
          created_at?: string | null
          id?: string
          session_id: string
        }
        Update: {
          cluster_id?: string
          created_at?: string | null
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_clusters_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_clusters_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_rules: {
        Row: {
          created_at: string | null
          id: string
          rule_id: string
          session_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rule_id: string
          session_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rule_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_rules_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          company: string | null
          created_at: string | null
          end_time: string | null
          id: string
          name: string
          start_time: string | null
          status: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          name: string
          start_time?: string | null
          status: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          name?: string
          start_time?: string | null
          status?: string
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
      snapshot_feedbacks: {
        Row: {
          comment: string | null
          comment_tags: Json | null
          company: string
          created_at: string
          id: string
          question_id: string | null
          questions_description: string | null
          receiver: string | null
          receiver_name_surname: string | null
          rule_number: number | null
          sender: string | null
          sender_name_surname: string | null
          session_id: string
          value: number | null
        }
        Insert: {
          comment?: string | null
          comment_tags?: Json | null
          company: string
          created_at?: string
          id?: string
          question_id?: string | null
          questions_description?: string | null
          receiver?: string | null
          receiver_name_surname?: string | null
          rule_number?: number | null
          sender?: string | null
          sender_name_surname?: string | null
          session_id: string
          value?: number | null
        }
        Update: {
          comment?: string | null
          comment_tags?: Json | null
          company?: string
          created_at?: string
          id?: string
          question_id?: string | null
          questions_description?: string | null
          receiver?: string | null
          receiver_name_surname?: string | null
          rule_number?: number | null
          sender?: string | null
          sender_name_surname?: string | null
          session_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "snapshot_feedbacks_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snapshot_feedbacks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snapshot_feedbacks_receiver_fkey"
            columns: ["receiver"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snapshot_feedbacks_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snapshot_feedbacks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      snapshot_session_questions: {
        Row: {
          comment_tags: string | null
          created_at: string
          embedding_comment_tags: string | null
          embedding_question: string | null
          id: string
          mentor_value: number | null
          overall_value: number | null
          question_description: string | null
          question_id: string | null
          receiver_id: string | null
          self_value: number | null
          session_id: string | null
          suggested_initiatives: string | null
          summary_comments: string | null
        }
        Insert: {
          comment_tags?: string | null
          created_at?: string
          embedding_comment_tags?: string | null
          embedding_question?: string | null
          id?: string
          mentor_value?: number | null
          overall_value?: number | null
          question_description?: string | null
          question_id?: string | null
          receiver_id?: string | null
          self_value?: number | null
          session_id?: string | null
          suggested_initiatives?: string | null
          summary_comments?: string | null
        }
        Update: {
          comment_tags?: string | null
          created_at?: string
          embedding_comment_tags?: string | null
          embedding_question?: string | null
          id?: string
          mentor_value?: number | null
          overall_value?: number | null
          question_description?: string | null
          question_id?: string | null
          receiver_id?: string | null
          self_value?: number | null
          session_id?: string | null
          suggested_initiatives?: string | null
          summary_comments?: string | null
        }
        Relationships: []
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
          id?: string
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
      team_processes: {
        Row: {
          created_at: string
          id: string
          process_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          process_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          process_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_processes_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_processes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_teams: {
        Row: {
          created_at: string
          first_team_id: string
          second_team_id: string
        }
        Insert: {
          created_at?: string
          first_team_id: string
          second_team_id: string
        }
        Update: {
          created_at?: string
          first_team_id?: string
          second_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_teams_first_team_id_fkey"
            columns: ["first_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_teams_second_team_id_fkey"
            columns: ["second_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          company: string
          created_at: string
          id: string
          leader: string
          name: string
          project: boolean | null
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          leader: string
          name: string
          project?: boolean | null
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          leader?: string
          name?: string
          project?: boolean | null
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
          id?: string
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
      user_sessions: {
        Row: {
          created_at: string | null
          level_name: string | null
          level_standard: number | null
          mentor_execution: number | null
          mentor_overall: number | null
          mentor_soft: number | null
          mentor_strategy: number | null
          self_execution: number | null
          self_overall: number | null
          self_soft: number | null
          self_strategy: number | null
          session_id: string
          user_id: string
          val_execution: number | null
          val_gap: number | null
          val_overall: number | null
          val_soft: number | null
          val_strategy: number | null
          weight_execution: number | null
          weight_soft: number | null
          weight_strategy: number | null
        }
        Insert: {
          created_at?: string | null
          level_name?: string | null
          level_standard?: number | null
          mentor_execution?: number | null
          mentor_overall?: number | null
          mentor_soft?: number | null
          mentor_strategy?: number | null
          self_execution?: number | null
          self_overall?: number | null
          self_soft?: number | null
          self_strategy?: number | null
          session_id: string
          user_id: string
          val_execution?: number | null
          val_gap?: number | null
          val_overall?: number | null
          val_soft?: number | null
          val_strategy?: number | null
          weight_execution?: number | null
          weight_soft?: number | null
          weight_strategy?: number | null
        }
        Update: {
          created_at?: string | null
          level_name?: string | null
          level_standard?: number | null
          mentor_execution?: number | null
          mentor_overall?: number | null
          mentor_soft?: number | null
          mentor_strategy?: number | null
          self_execution?: number | null
          self_overall?: number | null
          self_soft?: number | null
          self_strategy?: number | null
          session_id?: string
          user_id?: string
          val_execution?: number | null
          val_gap?: number | null
          val_overall?: number | null
          val_soft?: number | null
          val_strategy?: number | null
          weight_execution?: number | null
          weight_soft?: number | null
          weight_strategy?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
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
          id?: string
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
          auth_id: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          level: string | null
          mentor: string | null
          name: string
          status: string
          surname: string
        }
        Insert: {
          admin?: boolean
          auth_id?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          level?: string | null
          mentor?: string | null
          name: string
          status?: string
          surname: string
        }
        Update: {
          admin?: boolean
          auth_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          level?: string | null
          mentor?: string | null
          name?: string
          status?: string
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
      feedbacks_view: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          process_name: string | null
          question_description: string | null
          question_type: string | null
          receiver_name_surname: string | null
          rule_number: number | null
          sender_name_surname: string | null
          session_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      view_analisi_feedbacks: {
        Row: {
          id: string | null
          question_type: string | null
          receiver_name_surname: string | null
          sender_name_surname: string | null
          session_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_mentor_feedbacks: {
        Args: { session_id_input: string }
        Returns: undefined
      }
      calculate_mentor_overall: {
        Args: { session_id_input: string }
        Returns: undefined
      }
      calculate_session_values: {
        Args: { session_uuid: string }
        Returns: undefined
      }
      generate_rule1_feedbacks: {
        Args: { session_id: string }
        Returns: undefined
      }
      generate_rule2_feedbacks: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      generate_rule3a_feedbacks: {
        Args: { session_id: string }
        Returns: undefined
      }
      generate_rule4_feedbacks: {
        Args: { session_id_input: string }
        Returns: undefined
      }
      generate_rule5_feedbacks: {
        Args: { session_uuid: string }
        Returns: undefined
      }
      generate_rule6_feedbacks: {
        Args: { session_uuid: string }
        Returns: undefined
      }
      generate_rule7_feedbacks: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      remove_duplicate_feedbacks: {
        Args: { session_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
