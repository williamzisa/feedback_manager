
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
