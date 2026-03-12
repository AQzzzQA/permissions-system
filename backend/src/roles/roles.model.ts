export interface Role {
  id: string;
  name: string;
  description: string | null;
  scopes: string[];
  created_at: Date;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  scopes: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  scopes?: string[];
}

// 预定义权限作用域
export const AVAILABLE_SCOPES = [
  'workspace.read',
  'workspace.write',
  'workspace.admin',
  'session.read',
  'session.write',
  'session.delete',
  'skill.read',
  'skill.write',
  'skill.delete',
  'channel.read',
  'channel.write',
  'channel.delete',
  'config.read',
  'config.write',
  'config.delete',
  'user.read',
  'user.write',
  'user.delete',
];
