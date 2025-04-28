| table_name             | column_name                 | data_type                   | column_default          | is_nullable |
| ---------------------- | --------------------------- | --------------------------- | ----------------------- | ----------- |
| clusters               | id                          | uuid                        | gen_random_uuid()       | NO          |
| clusters               | name                        | text                        | null                    | NO          |
| clusters               | leader                      | uuid                        | null                    | YES         |
| clusters               | company                     | uuid                        | null                    | YES         |
| clusters               | created_at                  | timestamp with time zone    | now()                   | NO          |
| clusters               | level                       | integer                     | null                    | YES         |
| companies              | id                          | uuid                        | gen_random_uuid()       | NO          |
| companies              | name                        | text                        | null                    | NO          |
| companies              | created_at                  | timestamp with time zone    | now()                   | YES         |
| feedbacks              | id                          | uuid                        | gen_random_uuid()       | NO          |
| feedbacks              | sender                      | uuid                        | null                    | YES         |
| feedbacks              | receiver                    | uuid                        | null                    | YES         |
| feedbacks              | question_id                 | uuid                        | null                    | YES         |
| feedbacks              | value                       | integer                     | null                    | YES         |
| feedbacks              | session_id                  | uuid                        | null                    | NO          |
| feedbacks              | rule_id                     | uuid                        | null                    | YES         |
| feedbacks              | company                     | uuid                        | null                    | NO          |
| feedbacks              | created_at                  | timestamp with time zone    | now()                   | NO          |
| feedbacks              | comment                     | text                        | null                    | YES         |
| feedbacks              | rule_number                 | integer                     | null                    | YES         |
| initiatives            | id                          | uuid                        | gen_random_uuid()       | NO          |
| initiatives            | created_at                  | timestamp with time zone    | now()                   | NO          |
| initiatives            | user_id                     | uuid                        | null                    | YES         |
| initiatives            | session_id                  | uuid                        | null                    | YES         |
| initiatives            | question_id                 | uuid                        | null                    | YES         |
| initiatives            | type                        | text                        | null                    | YES         |
| initiatives            | description                 | text                        | null                    | YES         |
| levels                 | id                          | uuid                        | gen_random_uuid()       | NO          |
| levels                 | role                        | text                        | null                    | YES         |
| levels                 | step                        | integer                     | null                    | NO          |
| levels                 | execution_weight            | integer                     | null                    | NO          |
| levels                 | soft_weight                 | integer                     | null                    | NO          |
| levels                 | strategy_weight             | integer                     | null                    | NO          |
| levels                 | standard                    | numeric                     | null                    | NO          |
| levels                 | company                     | uuid                        | null                    | NO          |
| levels                 | created_at                  | timestamp with time zone    | now()                   | NO          |
| processes              | id                          | uuid                        | gen_random_uuid()       | NO          |
| processes              | name                        | text                        | null                    | NO          |
| processes              | linked_question_id          | uuid                        | null                    | NO          |
| processes              | company                     | uuid                        | null                    | NO          |
| processes              | created_at                  | timestamp with time zone    | now()                   | NO          |
| question_tags          | id                          | uuid                        | gen_random_uuid()       | NO          |
| question_tags          | question_id                 | uuid                        | null                    | NO          |
| question_tags          | score                       | integer                     | null                    | NO          |
| question_tags          | description                 | text                        | null                    | NO          |
| question_tags          | company                     | uuid                        | null                    | NO          |
| question_tags          | created_at                  | timestamp with time zone    | now()                   | NO          |
| questions              | id                          | uuid                        | gen_random_uuid()       | NO          |
| questions              | description                 | text                        | null                    | NO          |
| questions              | type                        | text                        | null                    | NO          |
| questions              | company                     | uuid                        | null                    | NO          |
| questions              | created_at                  | timestamp with time zone    | now()                   | NO          |
| rules                  | id                          | uuid                        | gen_random_uuid()       | NO          |
| rules                  | number                      | integer                     | null                    | NO          |
| rules                  | content_sql                 | text                        | null                    | NO          |
| rules                  | company                     | uuid                        | null                    | NO          |
| rules                  | created_at                  | timestamp with time zone    | now()                   | NO          |
| rules                  | name                        | text                        | ''::text                | NO          |
| rules                  | description                 | text                        | null                    | YES         |
| rules                  | template                    | boolean                     | null                    | YES         |
| session_clusters       | id                          | uuid                        | gen_random_uuid()       | NO          |
| session_clusters       | session_id                  | uuid                        | null                    | NO          |
| session_clusters       | cluster_id                  | uuid                        | null                    | NO          |
| session_clusters       | created_at                  | timestamp with time zone    | now()                   | YES         |
| session_rules          | id                          | uuid                        | gen_random_uuid()       | NO          |
| session_rules          | session_id                  | uuid                        | null                    | NO          |
| session_rules          | rule_id                     | uuid                        | null                    | NO          |
| session_rules          | created_at                  | timestamp with time zone    | now()                   | YES         |
| sessions               | id                          | uuid                        | null                    | NO          |
| sessions               | id                          | uuid                        | gen_random_uuid()       | NO          |
| sessions               | user_id                     | uuid                        | null                    | NO          |
| sessions               | name                        | text                        | null                    | NO          |
| sessions               | created_at                  | timestamp with time zone    | null                    | YES         |
| sessions               | updated_at                  | timestamp with time zone    | null                    | YES         |
| sessions               | factor_id                   | uuid                        | null                    | YES         |
| sessions               | aal                         | USER-DEFINED                | null                    | YES         |
| sessions               | not_after                   | timestamp with time zone    | null                    | YES         |
| sessions               | status                      | text                        | null                    | NO          |
| sessions               | refreshed_at                | timestamp without time zone | null                    | YES         |
| sessions               | user_agent                  | text                        | null                    | YES         |
| sessions               | company                     | uuid                        | null                    | YES         |
| sessions               | start_time                  | timestamp with time zone    | null                    | YES         |
| sessions               | ip                          | inet                        | null                    | YES         |
| sessions               | tag                         | text                        | null                    | YES         |
| sessions               | end_time                    | timestamp with time zone    | null                    | YES         |
| sessions               | created_at                  | timestamp with time zone    | now()                   | YES         |
| team_clusters          | id                          | uuid                        | gen_random_uuid()       | NO          |
| team_clusters          | team_id                     | uuid                        | null                    | YES         |
| team_clusters          | cluster_id                  | uuid                        | null                    | YES         |
| team_clusters          | created_at                  | timestamp with time zone    | now()                   | YES         |
| team_processes         | id                          | uuid                        | gen_random_uuid()       | NO          |
| team_processes         | created_at                  | timestamp with time zone    | now()                   | NO          |
| team_processes         | team_id                     | uuid                        | null                    | NO          |
| team_processes         | process_id                  | uuid                        | null                    | NO          |
| team_teams             | first_team_id               | uuid                        | null                    | NO          |
| team_teams             | second_team_id              | uuid                        | null                    | NO          |
| team_teams             | created_at                  | timestamp with time zone    | now()                   | NO          |
| teams                  | id                          | uuid                        | gen_random_uuid()       | NO          |
| teams                  | name                        | text                        | null                    | NO          |
| teams                  | leader                      | uuid                        | null                    | NO          |
| teams                  | company                     | uuid                        | null                    | NO          |
| teams                  | created_at                  | timestamp with time zone    | now()                   | NO          |
| teams                  | project                     | boolean                     | false                   | YES         |
| user_processes         | id                          | uuid                        | gen_random_uuid()       | NO          |
| user_processes         | user_id                     | uuid                        | null                    | YES         |
| user_processes         | process_id                  | uuid                        | null                    | YES         |
| user_processes         | created_at                  | timestamp with time zone    | now()                   | YES         |
| user_sessions          | user_id                     | uuid                        | null                    | NO          |
| user_sessions          | session_id                  | uuid                        | null                    | NO          |
| user_sessions          | level_name                  | text                        | null                    | YES         |
| user_sessions          | level_standard              | double precision            | null                    | YES         |
| user_sessions          | weight_execution            | double precision            | null                    | YES         |
| user_sessions          | weight_soft                 | double precision            | null                    | YES         |
| user_sessions          | weight_strategy             | double precision            | null                    | YES         |
| user_sessions          | val_overall                 | double precision            | null                    | YES         |
| user_sessions          | val_execution               | double precision            | null                    | YES         |
| user_sessions          | val_soft                    | double precision            | null                    | YES         |
| user_sessions          | val_strategy                | double precision            | null                    | YES         |
| user_sessions          | self_overall                | double precision            | null                    | YES         |
| user_sessions          | self_execution              | double precision            | null                    | YES         |
| user_sessions          | self_soft                   | double precision            | null                    | YES         |
| user_sessions          | self_strategy               | double precision            | null                    | YES         |
| user_sessions          | val_gap                     | double precision            | null                    | YES         |
| user_sessions          | created_at                  | timestamp with time zone    | now()                   | YES         |
| user_teams             | id                          | uuid                        | gen_random_uuid()       | NO          |
| user_teams             | user_id                     | uuid                        | null                    | YES         |
| user_teams             | team_id                     | uuid                        | null                    | YES         |
| user_teams             | created_at                  | timestamp with time zone    | CURRENT_TIMESTAMP       | YES         |
| users                  | id                          | uuid                        | gen_random_uuid()       | NO          |
| users                  | instance_id                 | uuid                        | null                    | YES         |
| users                  | id                          | uuid                        | null                    | NO          |
| users                  | name                        | text                        | null                    | NO          |
| users                  | aud                         | character varying           | null                    | YES         |
| users                  | surname                     | text                        | null                    | NO          |
| users                  | role                        | character varying           | null                    | YES         |
| users                  | email                       | text                        | null                    | NO          |
| users                  | email                       | character varying           | null                    | YES         |
| users                  | level                       | uuid                        | null                    | YES         |
| users                  | encrypted_password          | character varying           | null                    | YES         |
| users                  | admin                       | boolean                     | false                   | NO          |
| users                  | company                     | uuid                        | null                    | YES         |
| users                  | email_confirmed_at          | timestamp with time zone    | null                    | YES         |
| users                  | invited_at                  | timestamp with time zone    | null                    | YES         |
| users                  | mentor                      | uuid                        | null                    | YES         |
| users                  | confirmation_token          | character varying           | null                    | YES         |
| users                  | created_at                  | timestamp with time zone    | now()                   | YES         |
| users                  | auth_id                     | uuid                        | null                    | YES         |
| users                  | confirmation_sent_at        | timestamp with time zone    | null                    | YES         |
| users                  | status                      | text                        | 'active'::text          | NO          |
| users                  | recovery_token              | character varying           | null                    | YES         |
| users                  | recovery_sent_at            | timestamp with time zone    | null                    | YES         |
| users                  | last_login                  | timestamp with time zone    | null                    | YES         |
| users                  | email_change_token_new      | character varying           | null                    | YES         |
| users                  | email_change                | character varying           | null                    | YES         |
| users                  | email_change_sent_at        | timestamp with time zone    | null                    | YES         |
| users                  | last_sign_in_at             | timestamp with time zone    | null                    | YES         |
| users                  | raw_app_meta_data           | jsonb                       | null                    | YES         |
| users                  | raw_user_meta_data          | jsonb                       | null                    | YES         |
| users                  | is_super_admin              | boolean                     | null                    | YES         |
| users                  | created_at                  | timestamp with time zone    | null                    | YES         |
| users                  | updated_at                  | timestamp with time zone    | null                    | YES         |
| users                  | phone                       | text                        | NULL::character varying | YES         |
| users                  | phone_confirmed_at          | timestamp with time zone    | null                    | YES         |
| users                  | phone_change                | text                        | ''::character varying   | YES         |
| users                  | phone_change_token          | character varying           | ''::character varying   | YES         |
| users                  | phone_change_sent_at        | timestamp with time zone    | null                    | YES         |
| users                  | confirmed_at                | timestamp with time zone    | null                    | YES         |
| users                  | email_change_token_current  | character varying           | ''::character varying   | YES         |
| users                  | email_change_confirm_status | smallint                    | 0                       | YES         |
| users                  | banned_until                | timestamp with time zone    | null                    | YES         |
| users                  | reauthentication_token      | character varying           | ''::character varying   | YES         |
| users                  | reauthentication_sent_at    | timestamp with time zone    | null                    | YES         |
| users                  | is_sso_user                 | boolean                     | false                   | NO          |
| users                  | deleted_at                  | timestamp with time zone    | null                    | YES         |
| users                  | is_anonymous                | boolean                     | false                   | NO          |
| view_analisi_feedbacks | id                          | uuid                        | null                    | YES         |
| view_analisi_feedbacks | sender_name_surname         | text                        | null                    | YES         |
| view_analisi_feedbacks | receiver_name_surname       | text                        | null                    | YES         |
| view_analisi_feedbacks | question_type               | text                        | null                    | YES         |
| view_analisi_feedbacks | value                       | integer                     | null                    | YES         |
| view_analisi_feedbacks | session_id                  | uuid                        | null                    | YES         |