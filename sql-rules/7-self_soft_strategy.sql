-- Crea un feedback di autovalutazione per ciascun utente che ha un Mentor.
-- Viene generato un feedback di autovalutazione per tutte le domande di tipo `soft` e `strategy` .
-- In caso di valutazione parziale su alcuni Cluster, le coppie Mentor-User devono contenere solo User che hanno un ruolo di TL o TM (esclusi i team di PRJ) all’interno della sessione (DA DEPRECARE!!)

-- Genera i feedback per ogni user_id nella tabella users_mentors
INSERT INTO feedbacks (sender_id, receiver_id, question_id, question_descr, question_type, regola)
SELECT 
    u.user_id AS sender_id,
    u.user_id AS receiver_id,
    q.id AS question_id,
    q.description AS question_descr,
    q.type AS question_type,
    6 AS regola
FROM 
    user_mentor u
CROSS JOIN 
    questions q
WHERE 
    q.type IN ('soft', 'strategy');
