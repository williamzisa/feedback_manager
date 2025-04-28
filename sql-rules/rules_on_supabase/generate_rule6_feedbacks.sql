
BEGIN
    -- Autovalutazione per domande SOFT e STRATEGY
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT
        u.id AS sender,                -- Utente come mittente
        u.id AS receiver,              -- Utente come destinatario
        q.id AS question_id,           -- Domanda SOFT o STRATEGY
        sc.session_id AS session_id,   -- Sessione data in input (come nell'originale)
        NOW() AS created_at,           -- Timestamp di creazione
        6 AS rule_number,              -- Numero della regola
        s.company AS company           -- CORREZIONE: Prendi la company dalla sessione
    FROM session_clusters sc
    JOIN sessions s ON sc.session_id = s.id -- CORREZIONE: Join con sessions
    JOIN team_clusters tc ON sc.cluster_id = tc.cluster_id
    JOIN teams t ON tc.team_id = t.id
    JOIN user_teams ut ON t.id = ut.team_id
    JOIN users u ON ut.user_id = u.id
    JOIN questions q ON q.type ILIKE ANY (ARRAY['soft', 'strategy']) -- Usa ILIKE ANY per consistenza
                     AND q.company = s.company -- CORREZIONE: Assicura company domanda
    WHERE sc.session_id = session_uuid;  -- Filtro sessione originale

    -- Autovalutazione per domande EXECUTION (domande legate ai processi)
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT
        u.id AS sender,                -- Utente come mittente
        u.id AS receiver,              -- Utente come destinatario
        q.id AS question_id,           -- Domanda EXECUTION
        sc.session_id AS session_id,   -- Sessione data in input (come nell'originale)
        NOW() AS created_at,           -- Timestamp di creazione
        6 AS rule_number,              -- Numero della regola
        s.company AS company           -- CORREZIONE: Prendi la company dalla sessione
    FROM session_clusters sc
    JOIN sessions s ON sc.session_id = s.id -- CORREZIONE: Join con sessions
    JOIN team_clusters tc ON sc.cluster_id = tc.cluster_id
    JOIN teams t ON tc.team_id = t.id
    JOIN user_teams ut ON t.id = ut.team_id
    JOIN users u ON ut.user_id = u.id
    JOIN user_processes up ON u.id = up.user_id  -- Processi dell'utente
    JOIN processes p ON up.process_id = p.id
    JOIN questions q ON q.type ILIKE 'execution' -- Usa ILIKE per consistenza
                     AND q.id = p.linked_question_id
                     AND q.company = s.company -- CORREZIONE: Assicura company domanda
    WHERE sc.session_id = session_uuid;  -- Filtro sessione originale
END;
