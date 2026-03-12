export interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'disabled' | 'pending';
  is_superuser: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  status?: 'active' | 'disabled' | 'pending';
  is_superuser?: boolean;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  status?: 'active' | 'disabled' | 'pending';
  is_superuser?: boolean;
}
