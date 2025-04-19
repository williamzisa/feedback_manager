-- Regola 3a: Generazione Feedback tra membri dello stesso team per domande di tipo 'soft'
INSERT INTO feedbacks (sender_id, receiver_id, question_id, question_descr, session_id, create_date, regola)
SELECT DISTINCT 
    ut1.user_id AS sender_id,
    ut2.user_id AS receiver_id,
    q.id AS question_id,
    q.description AS question_descr,
    cs.session_id,
    NOW(),
    3 AS regola
FROM users_teams ut1
JOIN users_teams ut2 ON ut1.team_id = ut2.team_id AND ut1.user_id <> ut2.user_id
JOIN teams t ON ut1.team_id = t.id
JOIN teams_clusters tc ON t.id = tc.team_id
JOIN clusters_sessions cs ON tc.cluster_id = cs.cluster_id
JOIN questions q ON q.type = 'soft' AND q.process_id IS NULL
WHERE cs.session_id = '1e167f13-35fe-4655-b77c-c3c167ca81c3'
  AND q.companies_id = cs.company_id;  -- Filtro per la companies_id della sessione


