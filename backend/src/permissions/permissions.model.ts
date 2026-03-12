export type ResourceType = 'workspace' | 'session' | 'skill' | 'channel' | 'config';

export type ActionType = 'read' | 'write' | 'delete' | 'admin';

export interface Permission {
  id: string;
  resource_type: ResourceType;
  resource_id: string | null;
  user_id: string | null;
  role_id: string | null;
  actions: ActionType[];
  created_at: Date;
}

export interface CreatePermissionInput {
  resource_type: ResourceType;
  resource_id?: string;
  user_id?: string;
  role_id?: string;
  actions: ActionType[];
}

export interface UpdatePermissionInput {
  actions?: ActionType[];
}

export interface CheckPermissionInput {
  resource_type: ResourceType;
  resource_id?: string;
  required_actions: ActionType[];
}
