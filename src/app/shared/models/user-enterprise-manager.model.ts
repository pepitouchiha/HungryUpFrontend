export type UserRole = 'Admin' | 'Cashier' | 'Waiter';

export interface UserEnterpriseManager {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
  tokenExpiration: string;
  enterpriseId: number;
  enterpriseName: string;
}

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
