export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}