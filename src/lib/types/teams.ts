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
  id: string;
  first_team_id: string;
  second_team_id: string;
  created_at: string;
}

export interface ConnectedTeam {
  id: string;
  name: string;
}

export type Team = {
  id: string;
  name: string;
  is_project: boolean;
  leader: {
    id: string;
    name: string;
    surname: string;
  };
  team_clusters?: {
    id: string;
    cluster: {
      id: string;
      name: string;
    };
  }[];
  user_teams?: {
    id: string;
    user_id: string | null;
    created_at: string | null;
    user?: {
      id: string;
      name: string;
      surname: string;
    } | null;
  }[];
  connected_teams?: ConnectedTeam[];
  team_teams?: {
    second_team: ConnectedTeam;
  }[];
  other_teams?: {
    first_team: ConnectedTeam;
  }[];
};

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
