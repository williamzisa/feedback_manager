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
  SELECT
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
    AND c.leader IS NOT NULL
    AND t.leader IS NOT NULL;
END;