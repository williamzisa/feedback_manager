
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
    FROM sessions s
    -- MODIFICA: Assicura che sender (up1.user_id) sia nella sessione
    JOIN session_clusters sc1 ON s.id = sc1.session_id
    JOIN team_clusters tc1 ON sc1.cluster_id = tc1.cluster_id
    JOIN teams t1 ON tc1.team_id = t1.id
    JOIN user_teams ut1 ON t1.id = ut1.team_id
    JOIN user_processes up1 ON ut1.user_id = up1.user_id -- L'utente deve essere in un team della sessione E avere il processo
    -- MODIFICA: Assicura che receiver (up2.user_id) sia nella sessione (potrebbe essere lo stesso team/cluster o un altro)
    JOIN session_clusters sc2 ON s.id = sc2.session_id -- Join separato per receiver
    JOIN team_clusters tc2 ON sc2.cluster_id = tc2.cluster_id
    JOIN teams t2 ON tc2.team_id = t2.id
    JOIN user_teams ut2 ON t2.id = ut2.team_id
    JOIN user_processes up2 ON ut2.user_id = up2.user_id -- L'utente deve essere in un team della sessione E avere il processo
    -- Join per processi e domande (filtrate correttamente per company)
    JOIN processes p ON up1.process_id = p.id -- Processo comune
    JOIN questions q ON p.linked_question_id = q.id
                     AND q.type ILIKE 'execution'
                     AND q.company = s.company -- Filtro company domanda già corretto
    WHERE s.id = session_id_input
      AND up1.process_id = up2.process_id -- Stesso processo
      AND up1.user_id <> up2.user_id; -- No auto-feedback
END;
