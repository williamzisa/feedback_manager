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

-- Regola 2b: Generazione Feedback da TL verso gli altri TL del loro stesso Cluster per tutte le domande di tipo 'soft'
INSERT INTO feedbacks (sender_id, receiver_id, question_id, question_descr, session_id, create_date, regola)
SELECT DISTINCT 
    t1.leader_id AS sender_id, 
    t2.leader_id AS receiver_id, 
    q.id AS question_id, 
    q.description AS question_descr, 
    cs.session_id, 
    NOW(),
    2 AS regola
FROM clusters c
JOIN teams_clusters tc1 ON c.id = tc1.cluster_id
JOIN teams t1 ON tc1.team_id = t1.id
JOIN teams_clusters tc2 ON c.id = tc2.cluster_id
JOIN teams t2 ON tc2.team_id = t2.id
JOIN clusters_sessions cs ON c.id = cs.cluster_id
JOIN questions q ON q.type = 'soft' AND q.process_id IS NULL
WHERE cs.session_id = '6476c0a5-2a9f-4d34-a689-94342b4b104f'
  AND t1.leader_id <> t2.leader_id
  AND q.companies_id = c.companies_id;  -- Filtro per la companies_id del cluster

