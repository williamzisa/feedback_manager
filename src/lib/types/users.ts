import type { Database } from '../supabase/database.types'

export type DbUser = Database['public']['Tables']['users']['Row']

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  level: string | null;
  mentor: string | null;
  company: string | null;
  admin: boolean;
  status: string;
  auth_id: string | null;
  created_at: string | null;
  last_login: string | null;
}

export type UserFormData = {
  name: string;
  surname: string;
  email: string;
  level: string | null;
  mentor: string | null;
  company: string | null;
  admin: boolean;
  status: string;
  auth_id: string | null;
  processes: string[];
} 