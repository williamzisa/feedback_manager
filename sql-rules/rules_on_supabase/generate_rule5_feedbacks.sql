
BEGIN
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT
        mentor.id AS sender,              -- Mentor come mittente
        tm.id AS receiver,                -- Team Member (Mentee) come destinatario
        q.id AS question_id,              -- Domanda EXECUTION
        sc.session_id AS session_id,      -- Sessione data in input
        NOW() AS created_at,              -- Timestamp di creazione
        5 AS rule_number,                 -- Numero della regola
        tm.company AS company             -- Azienda dell'utente
    FROM session_clusters sc
    JOIN team_clusters tc ON sc.cluster_id = tc.cluster_id
    JOIN teams t ON tc.team_id = t.id
    JOIN user_teams ut ON t.id = ut.team_id
    JOIN users tm ON ut.user_id = tm.id                      -- Team Members (Mentee)
    JOIN users mentor ON tm.mentor = mentor.id              -- Mentor associato
    JOIN user_processes up ON tm.id = up.user_id            -- Processi assegnati al TM (Mentee)
    JOIN processes p ON up.process_id = p.id
    JOIN questions q ON q.type = 'EXECUTION' AND q.id = p.linked_question_id  -- Domande EXECUTION

    -- Verifica che **sia il mentee che il mentor siano presenti nella sessione**
    WHERE sc.session_id = session_uuid
      AND EXISTS (
        SELECT 1 FROM user_teams utm
        JOIN teams tm ON utm.team_id = tm.id
        JOIN team_clusters tcm ON tm.id = tcm.team_id
        JOIN session_clusters scm ON tcm.cluster_id = scm.cluster_id
        WHERE scm.session_id = session_uuid
        AND utm.user_id = mentor.id  -- Il mentor deve essere nella sessione
      );
END;
