export type UserRole = 'Admin' | 'Cashier' | 'Waiter';

export interface UserEnterpriseManager {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  enterpriseId: number;
  enterpriseName: string;
}

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  rol: UserRole;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  rol: UserRole;
  activo: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
