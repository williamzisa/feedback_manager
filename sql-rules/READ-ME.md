--https://www.notion.so/riskhub/Regole-SQL-Feedbacks-Generator-11cda54d973c80a8b8e5db89d432a70d?pvs=4


Note:
- (5-execution_processi_condivisi.sql) gia semplificata in (rules_on_supabase/generate_rule4_feedbacks.sql)
- (6-execution_da_mentor.sql) non esclude i processi, in  (rules_on_supabase/generate_rule5_feedbacks.sql) verifica che sia mentor che mentee siano inclusi nella sessione
- (rules_on_supabase/remove_duplicate_feedbacks.sql) rimuove direttamente tutti i duplicati, restituendone il count