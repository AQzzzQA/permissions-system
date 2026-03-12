export interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'disabled' | 'pending';
  is_superuser?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  description: string | null;
  config: any;
  created_at: string;
  updated_at: string;
  owner?: User;
  members?: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role_id: string;
  joined_at: string;
  user?: User;
  role?: Role;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  scopes: string[];
  created_at: string;
}

export interface Permission {
  id: string;
  resource_type: 'workspace' | 'session' | 'skill' | 'channel' | 'config';
  resource_id: string | null;
  user_id: string | null;
  role_id: string | null;
  actions: string[];
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const SCOPE_OPTIONS = [
  { label: '工作空间 - 读取', value: 'workspace.read' },
  { label: '工作空间 - 写入', value: 'workspace.write' },
  { label: '工作空间 - 管理', value: 'workspace.admin' },
  { label: '会话 - 读取', value: 'session.read' },
  { label: '会话 - 写入', value: 'session.write' },
  { label: '会话 - 删除', value: 'session.delete' },
  { label: '技能 - 读取', value: 'skill.read' },
  { label: '技能 - 写入', value: 'skill.write' },
  { label: '技能 - 删除', value: 'skill.delete' },
  { label: '频道 - 读取', value: 'channel.read' },
  { label: '频道 - 写入', value: 'channel.write' },
  { label: '频道 - 删除', value: 'channel.delete' },
  { label: '配置 - 读取', value: 'config.read' },
  { label: '配置 - 写入', value: 'config.write' },
  { label: '配置 - 删除', value: 'config.delete' },
  { label: '用户 - 读取', value: 'user.read' },
  { label: '用户 - 写入', value: 'user.write' },
  { label: '用户 - 删除', value: 'user.delete' },
];

export const SCOPE_GROUPS = [
  {
    label: '工作空间权限',
    options: ['workspace.read', 'workspace.write', 'workspace.admin'],
  },
  {
    label: '会话权限',
    options: ['session.read', 'session.write', 'session.delete'],
  },
  {
    label: '技能权限',
    options: ['skill.read', 'skill.write', 'skill.delete'],
  },
  {
    label: '频道权限',
    options: ['channel.read', 'channel.write', 'channel.delete'],
  },
  {
    label: '配置权限',
    options: ['config.read', 'config.write', 'config.delete'],
  },
  {
    label: '用户权限',
    options: ['user.read', 'user.write', 'user.delete'],
  },
];
