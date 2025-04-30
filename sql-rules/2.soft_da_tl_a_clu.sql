
DECLARE
  inserted_count INTEGER;
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
    p_session_id,
    NOW(),
    2 AS rule_number,
    c.company AS company
  FROM clusters c
  JOIN team_clusters tc ON c.id = tc.cluster_id
  JOIN teams t ON tc.team_id = t.id
  JOIN session_clusters sc ON c.id = sc.cluster_id
  JOIN questions q ON q.company = c.company
  WHERE sc.session_id = p_session_id
    AND q.type ILIKE 'soft'
    AND c.leader IS NOT NULL
    AND t.leader IS NOT NULL
    AND t.leader <> c.leader;
    
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
