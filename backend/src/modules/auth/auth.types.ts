// Defines the shape of the tokens returned after a successful login or register
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Defines the safe user object returned to the client — no password hash
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
}

// Combines the user and tokens into a single auth response
export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}