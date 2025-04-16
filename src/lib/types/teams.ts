/* 
  Questi tipi verranno utilizzati quando integreremo Supabase
  Per ora li teniamo commentati per evitare errori di ESLint
*/

export interface User {
  id: string;
  name: string;
  surname: string;
}

export interface TeamCluster {
  id: string;
  cluster: {
    id: string;
    name: string;
  };
}

export interface UserTeam {
  id: string;
  user_id: string | null;
  team_id: string;
  created_at: string | null;
}

export interface TeamConnection {
  first_team_id: string;
  second_team_id: string;
  created_at: string;
}

export interface ConnectedTeam {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  is_project: boolean;
  leader: { id: string; name: string; surname: string } | null;
  company?: string;
  team_clusters: Array<{
    id: string;
    cluster: { id: string; name: string };
  }>;
  user_teams: Array<{
    id: string;
    user: { id: string; name: string; surname: string } | null;
  }>;
  connections_count: number;
  connected_teams?: ConnectedTeam[];
  connections?: Array<{
    first_team_id: string;
    second_team_id: string;
  }>;
  reverse_connections?: Array<{
    first_team_id: string;
    second_team_id: string;
  }>;
}

export interface TeamWithConnections extends Team {
  connected_teams: ConnectedTeam[];
}

export type TeamFormData = {
  name: string;
  clusterId: string | null;
  leaderId: string;
  project: boolean;
};

export type TeamCreateData = {
  name: string;
  leaderId: string;
  is_project: boolean;
  company: string;
};

export type TeamUpdateData = {
  name: string;
  leaderId: string;
  is_project: boolean;
};

export type TeamConnectionResponse = {
  success: boolean;
  error?: string;
};
