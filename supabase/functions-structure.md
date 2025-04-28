| schema_name | function_name              | function_arguments    | return_type | security_type    | function_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | -------------------------- | --------------------- | ----------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public      | generate_rule1_feedbacks   | session_id uuid       | void        | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.generate_rule1_feedbacks(session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO feedbacks (
    sender,
    receiver,
    question_id,
    session_id,
    created_at,
    rule_number,
    company
  )
  SELECT DISTINCT 
    c.leader AS sender, 
    t.leader AS receiver, 
    q.id AS question_id, 
    sc.session_id,
    NOW(),
    1 AS rule_number,
    c.company AS company
  FROM clusters c
  JOIN team_clusters tc ON c.id = tc.cluster_id
  JOIN teams t ON tc.team_id = t.id
  JOIN session_clusters sc ON c.id = sc.cluster_id
  JOIN questions q ON q.company = c.company
  WHERE sc.session_id = $1
    AND LOWER(q.type) IN ('soft', 'strategy')  -- Case-insensitive type check
    AND q.id NOT IN (SELECT linked_question_id FROM processes)
    AND c.leader IS NOT NULL
    AND t.leader IS NOT NULL;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public      | generate_rule2_feedbacks   | session_id uuid       | void        | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.generate_rule2_feedbacks(session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Step 2a: TL → CLU
  INSERT INTO feedbacks (
    sender,
    receiver,
    question_id,
    session_id,
    created_at,
    rule_number,
    company
  )
  SELECT DISTINCT 
    t.leader AS sender, 
    c.leader AS receiver, 
    q.id AS question_id, 
    sc.session_id,
    NOW(),
    2 AS rule_number,
    c.company AS company
  FROM clusters c
  JOIN team_clusters tc ON c.id = tc.cluster_id
  JOIN teams t ON tc.team_id = t.id
  JOIN session_clusters sc ON c.id = sc.cluster_id
  JOIN questions q ON q.company = c.company
  WHERE sc.session_id = $1
    AND q.type ILIKE 'soft'  -- Case insensitive
    AND c.leader IS NOT NULL
    AND t.leader IS NOT NULL;

  -- Step 2b: TL ↔ TL (feedback bidirezionale tra TL dello stesso cluster)
  INSERT INTO feedbacks (
    sender,
    receiver,
    question_id,
    session_id,
    created_at,
    rule_number,
    company
  )
  SELECT DISTINCT 
    t1.leader AS sender, 
    t2.leader AS receiver, 
    q.id AS question_id, 
    sc.session_id,
    NOW(),
    2 AS rule_number,
    t1.company AS company
  FROM teams t1
  JOIN team_clusters tc1 ON t1.id = tc1.team_id
  JOIN clusters c ON tc1.cluster_id = c.id
  JOIN team_clusters tc2 ON c.id = tc2.cluster_id
  JOIN teams t2 ON tc2.team_id = t2.id
  JOIN session_clusters sc ON c.id = sc.cluster_id
  JOIN questions q ON q.company = c.company
  WHERE sc.session_id = $1
    AND q.type ILIKE 'soft'  -- Case insensitive
    AND t1.leader IS NOT NULL
    AND t2.leader IS NOT NULL
    AND t1.leader <> t2.leader; -- Evita feedback a se stessi
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| public      | generate_rule3a_feedbacks  | session_id uuid       | void        | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.generate_rule3a_feedbacks(session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT
        ut1.user_id AS sender,
        ut2.user_id AS receiver,
        q.id AS question_id,
        $1 AS session_id, -- Usa l'argomento originale
        NOW() AS created_at,
        3 AS rule_number,
        s.company AS company
    FROM user_teams ut1
    JOIN user_teams ut2 ON ut1.team_id = ut2.team_id AND ut1.user_id <> ut2.user_id
    JOIN teams t ON ut1.team_id = t.id
    JOIN team_clusters tc ON t.id = tc.team_id
    JOIN session_clusters sc ON tc.cluster_id = sc.cluster_id
    JOIN sessions s ON sc.session_id = s.id
    JOIN questions q ON q.type ILIKE 'soft' -- Usa ILIKE per consistenza, ma mantiene la logica originale
                     AND q.company = s.company -- CORREZIONE: Assicura che la domanda sia della stessa company della sessione
    WHERE sc.session_id = $1; -- Filtra per la sessione data
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public      | generate_rule3b_feedbacks  | session_id uuid       | void        | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.generate_rule3b_feedbacks(session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM feedbacks
    WHERE id IN (
        SELECT f3.id
        FROM feedbacks f3
        JOIN feedbacks f_other 
            ON f3.sender = f_other.sender 
            AND f3.receiver = f_other.receiver
            AND f3.question_id = f_other.question_id
            AND f3.session_id = f_other.session_id
            AND f_other.rule_number IN (1, 2)  -- Consideriamo i feedback delle Regole 1 e 2 come base
        WHERE f3.rule_number = 3
          AND f3.session_id = $1
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| public      | generate_rule4_feedbacks   | session_id_input uuid | void        | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.generate_rule4_feedbacks(session_id_input uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public      | generate_rule5_feedbacks   | session_uuid uuid     | void        | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.generate_rule5_feedbacks(session_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO feedbacks (sender, receiver, question_id, session_id, created_at, rule_number, company)
    SELECT DISTINCT
        mentor.id AS sender,              -- Mentor come mittente
        tm.id AS receiver,                -- Team Member (Mentee) come destinatario
        q.id AS question_id,              -- Domanda EXECUTION
        sc.session_id AS session_id,      -- Sessione data in input (come nell'originale)
        NOW() AS created_at,              -- Timestamp di creazione
        5 AS rule_number,                 -- Numero della regola
        s.company AS company              -- CORREZIONE: Prendi la company dalla sessione
    FROM session_clusters sc
    JOIN sessions s ON sc.session_id = s.id -- CORREZIONE: Join con sessions per ottenere la company
    JOIN team_clusters tc ON sc.cluster_id = tc.cluster_id
    JOIN teams t ON tc.team_id = t.id
    JOIN user_teams ut ON t.id = ut.team_id
    JOIN users tm ON ut.user_id = tm.id                      -- Team Members (Mentee)
    JOIN users mentor ON tm.mentor = mentor.id              -- Mentor associato
    JOIN user_processes up ON tm.id = up.user_id            -- Processi assegnati al TM (Mentee)
    JOIN processes p ON up.process_id = p.id
    JOIN questions q ON q.type ILIKE 'execution'            -- Usa ILIKE per consistenza
                     AND q.id = p.linked_question_id
                     AND q.company = s.company              -- CORREZIONE: Assicura che la domanda sia della company corretta

    WHERE sc.session_id = session_uuid -- Condizione originale sulla sessione
      -- La clausola EXISTS originale rimane invariata per verificare la presenza del mentor
      AND EXISTS (
        SELECT 1 FROM user_teams utm
        JOIN teams tm_inner ON utm.team_id = tm_inner.id -- Rinominato per evitare conflitti
        JOIN team_clusters tcm ON tm_inner.id = tcm.team_id
        JOIN session_clusters scm ON tcm.cluster_id = scm.cluster_id
        WHERE scm.session_id = session_uuid
        AND utm.user_id = mentor.id
      );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| public      | generate_rule6_feedbacks   | session_uuid uuid     | void        | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.generate_rule6_feedbacks(session_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
 |
| public      | remove_duplicate_feedbacks | session_id uuid       | integer     | SECURITY INVOKER | CREATE OR REPLACE FUNCTION public.remove_duplicate_feedbacks(session_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH duplicates AS (
        SELECT f.id,
               ROW_NUMBER() OVER (
                   PARTITION BY f.session_id, f.sender, f.receiver, f.question_id
                   ORDER BY f.rule_number ASC
               ) as row_num
        FROM feedbacks f
        WHERE f.session_id = $1
    )
    DELETE FROM feedbacks f
    USING duplicates d
    WHERE f.id = d.id 
    AND d.row_num > 1;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |