import axios from 'axios';

// Rebuilt at Thu Mar 12 08:57:21 AM CST 2026
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/admin/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 使用路由导航而不是硬编码路径（此处暂不处理，因为响应拦截器中无法访问路由）
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  getCurrentUser: () => api.get('/auth/me'),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/auth/password', { oldPassword, newPassword }),
};

export const usersAPI = {
  list: (params?: any) => api.get('/users', { params }),

  stats: () => api.get('/users/stats'),

  getById: (id: string) => api.get(`/users/${id}`),

  getWorkspaces: (id: string) => api.get(`/users/${id}/workspaces`),

  create: (data: any) => api.post('/users', data),

  update: (id: string, data: any) => api.put(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  resetPassword: (id: string, password: string) =>
    api.post(`/users/${id}/reset-password`, { password }),
};

export const workspacesAPI = {
  list: (params?: any) => api.get('/workspaces', { params }),

  getById: (id: string) => api.get(`/workspaces/${id}`),

  create: (data: any) => api.post('/workspaces', data),

  update: (id: string, data: any) => api.put(`/workspaces/${id}`, data),

  delete: (id: string) => api.delete(`/workspaces/${id}`),

  getMembers: (id: string) => api.get(`/workspaces/${id}/members`),

  addMember: (id: string, data: any) => api.post(`/workspaces/${id}/members`, data),

  removeMember: (id: string, userId: string) =>
    api.delete(`/workspaces/${id}/members/${userId}`),

  updateMember: (id: string, userId: string, roleId: string) =>
    api.put(`/workspaces/${id}/members/${userId}`, { role_id: roleId }),
};

export const rolesAPI = {
  list: () => api.get('/roles'),

  getScopes: () => api.get('/roles/scopes'),

  getById: (id: string) => api.get(`/roles/${id}`),

  getUsage: (id: string) => api.get(`/roles/${id}/usage`),

  getUsers: (id: string) => api.get(`/roles/${id}/users`),

  create: (data: any) => api.post('/roles', data),

  update: (id: string, data: any) => api.put(`/roles/${id}`, data),

  delete: (id: string) => api.delete(`/roles/${id}`),
};

export const permissionsAPI = {
  list: (params?: any) => api.get('/permissions', { params }),

  check: (data: any) => api.post('/permissions/check', data),

  getUserPermissions: (userId: string) => api.get(`/permissions/user/${userId}`),

  getRolePermissions: (roleId: string) => api.get(`/permissions/role/${roleId}`),

  getWorkspacePermissions: (workspaceId: string) =>
    api.get(`/permissions/workspace/${workspaceId}`),

  create: (data: any) => api.post('/permissions', data),

  getById: (id: string) => api.get(`/permissions/${id}`),

  update: (id: string, data: any) => api.put(`/permissions/${id}`, data),

  delete: (id: string) => api.delete(`/permissions/${id}`),
};

export default api;
