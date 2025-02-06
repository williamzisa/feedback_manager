import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/database.types';
import { PostgrestError } from '@supabase/supabase-js';

const handleSupabaseError = (error: PostgrestError) => {
  console.error('Supabase error:', error);
  return null;
};

export const queries = {
  // ... existing code ...

  // Initiatives
  initiatives: {
    getBySessionAndQuestion: async (sessionId: string, questionId: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('initiatives')
          .select(`
            *,
            user:users!initiatives_user_id_fkey (
              name,
              surname
            )
          `)
          .eq('session_id', sessionId)
          .eq('question_id', questionId)
          .order('created_at', { ascending: false });

        if (error) return handleSupabaseError(error);
        return data || [];
      } catch (err) {
        console.error('Errore nel recupero delle iniziative:', err);
        return [];
      }
    },

    delete: async (id: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { error } = await supabase
          .from('initiatives')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Errore nell\'eliminazione:', error);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Errore nell\'eliminazione dell\'iniziativa:', err);
        return false;
      }
    },

    update: async (id: string, description: string) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('initiatives')
          .update({ 
            description
          })
          .eq('id', id)
          .select(`
            *,
            user:users!initiatives_user_id_fkey (
              name,
              surname
            )
          `)
          .single();

        if (error) {
          console.error('Errore nell\'aggiornamento:', error);
          return null;
        }
        return data;
      } catch (err) {
        console.error('Errore nell\'aggiornamento dell\'iniziativa:', err);
        return null;
      }
    },

    create: async (initiative: {
      description: string;
      session_id: string;
      user_id: string;
      question_id: string;
      type: string;
    }) => {
      const supabase = createClientComponentClient<Database>();
      try {
        const { data, error } = await supabase
          .from('initiatives')
          .insert({
            ...initiative,
            created_at: new Date().toISOString()
          })
          .select(`
            *,
            user:users!initiatives_user_id_fkey (
              name,
              surname
            )
          `)
          .single();

        if (error) {
          console.error('Errore nella creazione:', error);
          return null;
        }
        return data;
      } catch (err) {
        console.error('Errore nella creazione dell\'iniziativa:', err);
        return null;
      }
    }
  },

  // ... rest of the code ...
} 