BEGIN
    -- Insert feedback for EXECUTION questions (original functionality)
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT
        mentor.id AS sender,              -- Mentor come mittente
        tm.id AS receiver,                -- Team Member (Mentee) come destinatario
        q.id AS question_id,              -- Domanda EXECUTION
        sc.session_id AS session_id,      -- Sessione data in input (come nell'originale)
        NOW() AS created_at,              -- Timestamp di creazione
        5 AS rule_number,                 -- Numero della regola
        s.company AS company              -- Prendi la company dalla sessione
    FROM session_clusters sc
    JOIN sessions s ON sc.session_id = s.id
    JOIN team_clusters tc ON sc.cluster_id = tc.cluster_id
    JOIN teams t ON tc.team_id = t.id
    JOIN user_teams ut ON t.id = ut.team_id
    JOIN users tm ON ut.user_id = tm.id                      -- Team Members (Mentee)
    JOIN users mentor ON tm.mentor = mentor.id              -- Mentor associato
    JOIN user_processes up ON tm.id = up.user_id            -- Processi assegnati al TM (Mentee)
    JOIN processes p ON up.process_id = p.id
    JOIN questions q ON q.type ILIKE 'execution'            -- Usa ILIKE per consistenza
                     AND q.id = p.linked_question_id
                     AND q.company = s.company

    WHERE sc.session_id = session_uuid
      AND EXISTS (
        SELECT 1 FROM user_teams utm
        JOIN teams tm_inner ON utm.team_id = tm_inner.id
        JOIN team_clusters tcm ON tm_inner.id = tcm.team_id
        JOIN session_clusters scm ON tcm.cluster_id = scm.cluster_id
        WHERE scm.session_id = session_uuid
        AND utm.user_id = mentor.id
      );

    -- Insert feedback for STRATEGY and SOFT questions (similar to rule 1)
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT
        mentor.id AS sender,              -- Mentor come mittente (equivalente al CL della regola 1)
        tm.id AS receiver,                -- Team Member (Mentee) come destinatario
        q.id AS question_id,              -- Domande STRATEGY e SOFT
        sc.session_id AS session_id,      
        NOW() AS created_at,
        5 AS rule_number,                 -- Manteniamo lo stesso numero di regola
        s.company AS company              
    FROM session_clusters sc
    JOIN sessions s ON sc.session_id = s.id
    JOIN team_clusters tc ON sc.cluster_id = tc.cluster_id
    JOIN teams t ON tc.team_id = t.id
    JOIN user_teams ut ON t.id = ut.team_id
    JOIN users tm ON ut.user_id = tm.id                      -- Team Members (Mentee)
    JOIN users mentor ON tm.mentor = mentor.id              -- Mentor associato
    JOIN questions q ON LOWER(q.type) IN ('soft', 'strategy') -- Filtro per domande SOFT e STRATEGY
                     AND q.company = s.company

    WHERE sc.session_id = session_uuid
      AND EXISTS (
        SELECT 1 FROM user_teams utm
        JOIN teams tm_inner ON utm.team_id = tm_inner.id
        JOIN team_clusters tcm ON tm_inner.id = tcm.team_id
        JOIN session_clusters scm ON tcm.cluster_id = scm.cluster_id
        WHERE scm.session_id = session_uuid
        AND utm.user_id = mentor.id
      );
END;
