import { Role } from '../../../common/enums/role.enum';

export interface JwtPayload {
  sub: string; // user ID
  email?: string;
  phone?: string;
  role: Role; // User role for RBAC
  profiles?: {
    id: string;
    type: 'worker' | 'team_lead' | 'employer';
  }[];
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email?: string;
    phone?: string;
    role: Role;
    firstName?: string;
    lastName?: string;
    profiles?: {
      id: string;
      type: string;
      isComplete: boolean;
    }[];
  };
}

export interface OtpData {
  code: string;
  phone?: string;
  email?: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}
