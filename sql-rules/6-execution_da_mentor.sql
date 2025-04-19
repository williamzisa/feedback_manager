--bisogna TOGLIERE l'esclusione dei progetti, dato che lo facciamo a livello di mentor

-- Regola 6: Generazione Feedback EXECUTION per coppie Mentor-User

INSERT INTO feedbacks (sender_id, receiver_id, question_id, question_descr, session_id, create_date, regola)
SELECT DISTINCT 
    um.mentor_id AS sender_id, 
    um.user_id AS receiver_id, 
    q.id AS question_id, 
    q.description AS question_descr, 
    cs.session_id, 
    NOW(),
    5 AS regola
FROM user_mentor um
JOIN users_processes up ON up.user_id = um.user_id
JOIN questions q ON q.type = 'execution' 
    AND q.process_id = up.process_id 
JOIN clusters_sessions cs ON cs.session_id = '6476c0a5-2a9f-4d34-a689-94342b4b104f'  -- Specifica la sessione
WHERE q.companies_id = cs.cluster_id;  -- Filtro per la companies_id della sessione
