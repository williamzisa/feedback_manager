| schemaname | tablename     | policyname                        | permissive | roles           | cmd    | qual                                                                                                                                                              | with_check            |
| ---------- | ------------- | --------------------------------- | ---------- | --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| public     | companies     | Accesso pubblico in lettura       | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                              | null                  |
| public     | companies     | Modifica solo per admin           | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM users
  WHERE ((users.auth_id = auth.uid()) AND (users.admin = true) AND (users.company = users.id))))                                 | null                  |
| public     | initiatives   | initiatives_all_operations        | PERMISSIVE | {authenticated} | ALL    | true                                                                                                                                                              | true                  |
| public     | levels        | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (company = ( SELECT users.company
   FROM users
  WHERE (users.auth_id = auth.uid())))                                                                            | null                  |
| public     | processes     | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (company = ( SELECT users.company
   FROM users
  WHERE (users.auth_id = auth.uid())))                                                                            | null                  |
| public     | questions     | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (company = ( SELECT users.company
   FROM users
  WHERE (users.auth_id = auth.uid())))                                                                            | null                  |
| public     | rules         | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (company = ( SELECT users.company
   FROM users
  WHERE (users.auth_id = auth.uid())))                                                                            | null                  |
| public     | sessions      | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (company = ( SELECT users.company
   FROM users
  WHERE (users.auth_id = auth.uid())))                                                                            | null                  |
| public     | team_clusters | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM (teams t
     JOIN users u ON ((u.company = t.company)))
  WHERE ((t.id = team_clusters.team_id) AND (u.auth_id = auth.uid()))))       | null                  |
| public     | teams         | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (company = ( SELECT users.company
   FROM users
  WHERE (users.auth_id = auth.uid())))                                                                            | null                  |
| public     | user_sessions | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM (sessions s
     JOIN users u ON ((u.company = s.company)))
  WHERE ((s.id = user_sessions.session_id) AND (u.auth_id = auth.uid())))) | null                  |
| public     | user_teams    | Isolamento per company            | PERMISSIVE | {public}        | ALL    | (EXISTS ( SELECT 1
   FROM (teams t
     JOIN users u ON ((u.company = t.company)))
  WHERE ((t.id = user_teams.team_id) AND (u.auth_id = auth.uid()))))          | null                  |
| public     | users         | Accesso in base a company         | PERMISSIVE | {public}        | SELECT | ((auth.uid() IS NULL) OR (company = ( SELECT users_1.company
   FROM users users_1
  WHERE (users_1.auth_id = auth.uid()))))                                      | null                  |
| public     | users         | Aggiornamento auth_id             | PERMISSIVE | {public}        | UPDATE | ((auth_id IS NULL) AND (NOT (EXISTS ( SELECT 1
   FROM users users_1
  WHERE (users_1.auth_id = auth.uid())))))                                                   | (auth_id IS NOT NULL) |
| public     | users         | Inserimento durante registrazione | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                              | (auth_id IS NULL)     |