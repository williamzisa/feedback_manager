export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
        }
        Update: {
          id?: string
          email?: string
        }
      }
      // Aggiungi qui le altre tabelle del tuo schema
    }
  }
}
