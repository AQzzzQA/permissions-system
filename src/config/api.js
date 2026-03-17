// API 配置
export const API_BASE_URL = 'http://43.156.131.98:8001/api';

// API 端点
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
  },
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    UPDATE: '/roles/:id',
    DELETE: '/roles/:id',
  },
  PERMISSIONS: {
    LIST: '/permissions',
    CREATE: '/permissions',
    UPDATE: '/permissions/:id',
    DELETE: '/permissions/:id',
  },
  MENUS: {
    LIST: '/menus',
    CREATE: '/menus',
    UPDATE: '/menus/:id',
    DELETE: '/menus/:id',
  },
};

// 创建 API 请求
export const createAPI = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// 导出 API 配置
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  createAPI,
};
