export interface JwtPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  vocalType?: string;
  experienceLevel?: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    vocalType?: string;
    experienceLevel?: string;
  };
  token: string;
}
