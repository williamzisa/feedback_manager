[
  {
    "table_name": "clusters",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "clusters",
    "column_name": "name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "clusters",
    "column_name": "leader",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "clusters",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "clusters",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "clusters",
    "column_name": "level",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "companies",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "companies",
    "column_name": "name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "companies",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "feedbacks",
    "column_name": "sender",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks",
    "column_name": "receiver",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks",
    "column_name": "question_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks",
    "column_name": "value",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "feedbacks",
    "column_name": "rule_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "feedbacks",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "feedbacks",
    "column_name": "comment",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks",
    "column_name": "rule_number",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "rule_number",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "value",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "comment",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "sender_name_surname",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "receiver_name_surname",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "question_type",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "question_description",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "feedbacks_view",
    "column_name": "process_name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "initiatives",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "initiatives",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "initiatives",
    "column_name": "user_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "initiatives",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "initiatives",
    "column_name": "question_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "initiatives",
    "column_name": "type",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "initiatives",
    "column_name": "description",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "levels",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "levels",
    "column_name": "role",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "levels",
    "column_name": "step",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "levels",
    "column_name": "execution_weight",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "levels",
    "column_name": "soft_weight",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "levels",
    "column_name": "strategy_weight",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "levels",
    "column_name": "standard",
    "data_type": "numeric",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "levels",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "levels",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "processes",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "processes",
    "column_name": "name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "processes",
    "column_name": "linked_question_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "processes",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "processes",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "question_tags",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "question_tags",
    "column_name": "question_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "question_tags",
    "column_name": "score",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "question_tags",
    "column_name": "description",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "question_tags",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "question_tags",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "questions",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "questions",
    "column_name": "description",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "questions",
    "column_name": "type",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "questions",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "questions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "rules",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "rules",
    "column_name": "number",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "rules",
    "column_name": "content_sql",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "rules",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "rules",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "rules",
    "column_name": "name",
    "data_type": "text",
    "column_default": "''::text",
    "is_nullable": "NO"
  },
  {
    "table_name": "rules",
    "column_name": "description",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "rules",
    "column_name": "template",
    "data_type": "boolean",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "session_clusters",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "session_clusters",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "session_clusters",
    "column_name": "cluster_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "session_clusters",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "session_rules",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "session_rules",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "session_rules",
    "column_name": "rule_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "session_rules",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "sessions",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "sessions",
    "column_name": "user_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "sessions",
    "column_name": "name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "sessions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "factor_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "aal",
    "data_type": "USER-DEFINED",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "not_after",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "refreshed_at",
    "data_type": "timestamp without time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "status",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "sessions",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "user_agent",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "start_time",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "ip",
    "data_type": "inet",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "end_time",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "tag",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "sessions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "sender",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "receiver",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "question_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "value",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "comment",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "rule_number",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "comment_tags",
    "data_type": "jsonb",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "sender_name_surname",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "receiver_name_surname",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_feedbacks",
    "column_name": "questions_description",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "question_description",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "receiver_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "comment_tags",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "embedding_comment_tags",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "summary_comments",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "suggested_initiatives",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "overall_value",
    "data_type": "bigint",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "mentor_value",
    "data_type": "bigint",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "self_value",
    "data_type": "bigint",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "embedding_question",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "snapshot_session_questions",
    "column_name": "question_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "team_clusters",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "team_clusters",
    "column_name": "team_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "team_clusters",
    "column_name": "cluster_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "team_clusters",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "team_processes",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "team_processes",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "team_processes",
    "column_name": "team_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "team_processes",
    "column_name": "process_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "team_teams",
    "column_name": "first_team_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "team_teams",
    "column_name": "second_team_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "team_teams",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "teams",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "teams",
    "column_name": "name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "teams",
    "column_name": "leader",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "teams",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "teams",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "NO"
  },
  {
    "table_name": "teams",
    "column_name": "project",
    "data_type": "boolean",
    "column_default": "false",
    "is_nullable": "YES"
  },
  {
    "table_name": "user_processes",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "user_processes",
    "column_name": "user_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_processes",
    "column_name": "process_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_processes",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "user_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "user_sessions",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "user_sessions",
    "column_name": "level_name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "level_standard",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "weight_execution",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "weight_soft",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "weight_strategy",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "val_overall",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "val_execution",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "val_soft",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "val_strategy",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "self_overall",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "self_execution",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "self_soft",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "self_strategy",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "val_gap",
    "data_type": "double precision",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_sessions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "user_teams",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "user_teams",
    "column_name": "user_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_teams",
    "column_name": "team_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "user_teams",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "CURRENT_TIMESTAMP",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "instance_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": "gen_random_uuid()",
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "name",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "surname",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "aud",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "email",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "role",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "level",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "email",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "encrypted_password",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "admin",
    "data_type": "boolean",
    "column_default": "false",
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "email_confirmed_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "company",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "mentor",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "invited_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": "now()",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "confirmation_token",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "auth_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "confirmation_sent_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "recovery_token",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "status",
    "data_type": "text",
    "column_default": "'active'::text",
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "recovery_sent_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "last_login",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "email_change_token_new",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "email_change",
    "data_type": "character varying",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "email_change_sent_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "last_sign_in_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "raw_app_meta_data",
    "data_type": "jsonb",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "raw_user_meta_data",
    "data_type": "jsonb",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "is_super_admin",
    "data_type": "boolean",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "phone",
    "data_type": "text",
    "column_default": "NULL::character varying",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "phone_confirmed_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "phone_change",
    "data_type": "text",
    "column_default": "''::character varying",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "phone_change_token",
    "data_type": "character varying",
    "column_default": "''::character varying",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "phone_change_sent_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "confirmed_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "email_change_token_current",
    "data_type": "character varying",
    "column_default": "''::character varying",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "email_change_confirm_status",
    "data_type": "smallint",
    "column_default": "0",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "banned_until",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "reauthentication_token",
    "data_type": "character varying",
    "column_default": "''::character varying",
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "reauthentication_sent_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "is_sso_user",
    "data_type": "boolean",
    "column_default": "false",
    "is_nullable": "NO"
  },
  {
    "table_name": "users",
    "column_name": "deleted_at",
    "data_type": "timestamp with time zone",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "users",
    "column_name": "is_anonymous",
    "data_type": "boolean",
    "column_default": "false",
    "is_nullable": "NO"
  },
  {
    "table_name": "view_analisi_feedbacks",
    "column_name": "id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "view_analisi_feedbacks",
    "column_name": "sender_name_surname",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "view_analisi_feedbacks",
    "column_name": "receiver_name_surname",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "view_analisi_feedbacks",
    "column_name": "question_type",
    "data_type": "text",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "view_analisi_feedbacks",
    "column_name": "value",
    "data_type": "integer",
    "column_default": null,
    "is_nullable": "YES"
  },
  {
    "table_name": "view_analisi_feedbacks",
    "column_name": "session_id",
    "data_type": "uuid",
    "column_default": null,
    "is_nullable": "YES"
  }
]