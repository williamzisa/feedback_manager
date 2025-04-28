
BEGIN
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT 
        up1.user_id AS sender,
        up2.user_id AS receiver,
        q.id AS question_id,
        session_id_input AS session_id,
        NOW() AS created_at,
        4 AS rule_number,
        s.company AS company
    FROM user_processes up1
    JOIN user_processes up2 
        ON up1.process_id = up2.process_id 
        AND up1.user_id <> up2.user_id
    JOIN questions q 
        ON q.type = 'EXECUTION'
    JOIN sessions s 
        ON s.id = session_id_input
    WHERE q.company = s.company;
END;
