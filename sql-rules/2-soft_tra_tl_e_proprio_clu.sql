-- Regola 2a: Generazione Feedback da TL verso il proprio CLU per tutte le domande di tipo 'soft'
INSERT INTO feedbacks (sender_id, receiver_id, question_id, question_descr, session_id, create_date, regola)
SELECT DISTINCT 
    t.leader_id AS sender_id, 
    c.cluster_leader_user_id AS receiver_id, 
    q.id AS question_id, 
    q.description AS question_descr, 
    cs.session_id, 
    NOW(),
    2 AS regola
FROM clusters c
JOIN teams_clusters tc ON c.id = tc.cluster_id
JOIN teams t ON tc.team_id = t.id
JOIN clusters_sessions cs ON c.id = cs.cluster_id
JOIN questions q ON q.type = 'soft' AND q.process_id IS NULL
WHERE cs.session_id = '6476c0a5-2a9f-4d34-a689-94342b4b104f'
  AND q.companies_id = c.companies_id;  -- Filtro per la companies_id del cluster

