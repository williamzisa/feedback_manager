[
  {
    "schemaname": "public",
    "tablename": "companies",
    "policyname": "Accesso pubblico in lettura",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "companies",
    "policyname": "Modifica solo per admin",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.auth_id = auth.uid()) AND (users.admin = true) AND (users.company = users.id))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "initiatives",
    "policyname": "initiatives_all_operations",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "ALL",
    "qual": "true",
    "with_check": "true"
  },
  {
    "schemaname": "public",
    "tablename": "levels",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(company = ( SELECT users.company\n   FROM users\n  WHERE (users.auth_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "processes",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(company = ( SELECT users.company\n   FROM users\n  WHERE (users.auth_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "questions",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(company = ( SELECT users.company\n   FROM users\n  WHERE (users.auth_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "rules",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(company = ( SELECT users.company\n   FROM users\n  WHERE (users.auth_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "sessions",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(company = ( SELECT users.company\n   FROM users\n  WHERE (users.auth_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "team_clusters",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM (teams t\n     JOIN users u ON ((u.company = t.company)))\n  WHERE ((t.id = team_clusters.team_id) AND (u.auth_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "teams",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(company = ( SELECT users.company\n   FROM users\n  WHERE (users.auth_id = auth.uid())))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_sessions",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM (sessions s\n     JOIN users u ON ((u.company = s.company)))\n  WHERE ((s.id = user_sessions.session_id) AND (u.auth_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "user_teams",
    "policyname": "Isolamento per company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM (teams t\n     JOIN users u ON ((u.company = t.company)))\n  WHERE ((t.id = user_teams.team_id) AND (u.auth_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Accesso in base a company",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "((auth.uid() IS NULL) OR (company = ( SELECT users_1.company\n   FROM users users_1\n  WHERE (users_1.auth_id = auth.uid()))))",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Aggiornamento auth_id",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "UPDATE",
    "qual": "((auth_id IS NULL) AND (NOT (EXISTS ( SELECT 1\n   FROM users users_1\n  WHERE (users_1.auth_id = auth.uid())))))",
    "with_check": "(auth_id IS NOT NULL)"
  },
  {
    "schemaname": "public",
    "tablename": "users",
    "policyname": "Inserimento durante registrazione",
    "permissive": "PERMISSIVE",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth_id IS NULL)"
  }
]