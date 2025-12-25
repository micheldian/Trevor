export interface JwtPayload {
  sub: string; // user ID
  email?: string;
  phone?: string;
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
