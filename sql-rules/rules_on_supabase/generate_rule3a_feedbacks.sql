
BEGIN
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT 
        ut1.user_id AS sender,
        ut2.user_id AS receiver,
        q.id AS question_id,
        $1 AS session_id,
        NOW() AS created_at,
        3 AS rule_number,
        s.company AS company  -- CORRETTO: ora prendiamo la company direttamente dalla sessione
    FROM user_teams ut1
    JOIN user_teams ut2 ON ut1.team_id = ut2.team_id AND ut1.user_id <> ut2.user_id
    JOIN teams t ON ut1.team_id = t.id
    JOIN team_clusters tc ON t.id = tc.team_id
    JOIN session_clusters sc ON tc.cluster_id = sc.cluster_id
    JOIN sessions s ON sc.session_id = s.id  -- CORRETTO: ci agganciamo alla sessione per la company
    JOIN questions q ON q.type = 'SOFT'
    WHERE sc.session_id = $1;
END;
