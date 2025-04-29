
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
  -- Seleziona le coppie di TL e le domande, poi usa UNION ALL per la bidirezionalità
  SELECT
    sender_leader,
    receiver_leader,
    q.id AS question_id,
    p_session_id AS session_id,
    NOW() AS created_at,
    7 AS rule_number,
    s.company AS company
  FROM (
      -- Prima direzione: t1.leader -> t2.leader
      SELECT DISTINCT
          t1.leader AS sender_leader,
          t2.leader AS receiver_leader,
          s.id AS session_id_ref, -- Per join con questions
          s.company AS session_company -- Per join con questions
      FROM team_teams tt
      JOIN teams t1 ON tt.first_team_id = t1.id
      JOIN teams t2 ON tt.second_team_id = t2.id
      JOIN sessions s ON s.id = p_session_id -- Assicura company e sessione
      -- Verifica che t1 sia nella sessione
      JOIN team_clusters tc1 ON t1.id = tc1.team_id
      JOIN session_clusters sc1 ON tc1.cluster_id = sc1.cluster_id AND sc1.session_id = p_session_id
      -- Verifica che t2 sia nella sessione
      JOIN team_clusters tc2 ON t2.id = tc2.team_id
      JOIN session_clusters sc2 ON tc2.cluster_id = sc2.cluster_id AND sc2.session_id = p_session_id
      WHERE t1.leader IS NOT NULL
        AND t2.leader IS NOT NULL
        AND t1.leader <> t2.leader -- Evita auto-feedback (anche se improbabile tra team diversi)
        AND t1.company = s.company -- Verifica company team 1
        AND t2.company = s.company -- Verifica company team 2

      UNION ALL

      -- Seconda direzione: t2.leader -> t1.leader
      SELECT DISTINCT
          t2.leader AS sender_leader,
          t1.leader AS receiver_leader,
          s.id AS session_id_ref,
          s.company AS session_company
      FROM team_teams tt
      JOIN teams t1 ON tt.first_team_id = t1.id
      JOIN teams t2 ON tt.second_team_id = t2.id
      JOIN sessions s ON s.id = p_session_id
      -- Verifica che t1 sia nella sessione
      JOIN team_clusters tc1 ON t1.id = tc1.team_id
      JOIN session_clusters sc1 ON tc1.cluster_id = sc1.cluster_id AND sc1.session_id = p_session_id
      -- Verifica che t2 sia nella sessione
      JOIN team_clusters tc2 ON t2.id = tc2.team_id
      JOIN session_clusters sc2 ON tc2.cluster_id = sc2.cluster_id AND sc2.session_id = p_session_id
      WHERE t1.leader IS NOT NULL
        AND t2.leader IS NOT NULL
        AND t1.leader <> t2.leader
        AND t1.company = s.company
        AND t2.company = s.company

  ) AS leader_pairs
  -- Unisci con le domande SOFT della company della sessione
  JOIN questions q ON q.company = leader_pairs.session_company AND q.type ILIKE 'soft'
  JOIN sessions s ON s.id = leader_pairs.session_id_ref; -- Join finale per ottenere la company corretta per l'INSERT

END;
