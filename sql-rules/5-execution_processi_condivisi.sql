-- Genera feedback tra tutti gli utenti che condividono uno stesso processo, considerando tutte le domande di tipo `execution` relative a quel processo.
-- Viene generato un feedback in entrambe le direzioni (`sender A → receiver B` e `sender B → receiver A`).
-- Include solo i processi che sono associati ai `clusters` della sessione.
-- Non rimuove duplicati rispetto ad altre regole, ma solo quelli interni a questa.

-- Regola 5: Generazione Feedback per coppie di utenti che condividono lo stesso processo (senza considerare duplicati di altre regole)
WITH SharedProcesses AS (
    SELECT DISTINCT 
        up1.user_id AS sender_id,
        up2.user_id AS receiver_id,
        up1.process_id,
        cs.session_id,
        c.companies_id
    FROM users_processes up1
    JOIN users_processes up2 ON up1.process_id = up2.process_id AND up1.user_id <> up2.user_id
    JOIN clusters_processes cp ON cp.process_id = up1.process_id
    JOIN clusters_sessions cs ON cs.cluster_id = cp.cluster_id
    JOIN clusters c ON c.id = cp.cluster_id
    WHERE cs.session_id = '6476c0a5-2a9f-4d34-a689-94342b4b104f'
)
INSERT INTO feedbacks (sender_id, receiver_id, question_id, question_descr, session_id, create_date, question_type, regola)
SELECT DISTINCT 
    sp.sender_id,
    sp.receiver_id,
    q.id AS question_id,
    q.description AS question_descr,
    sp.session_id,
    NOW(),
    'execution' AS question_type,
    4 AS regola
FROM SharedProcesses sp
JOIN questions q ON q.type = 'execution' 
    AND q.process_id = sp.process_id 
    AND q.companies_id = sp.companies_id;
