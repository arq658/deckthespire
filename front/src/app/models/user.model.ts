export interface UserResponse {
  data: {
    id: string;
    type: string;
    attributes: User;
  };
}

export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  favoriteCards?: string[];
  favoriteRelics?: string[];
  decks?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Para compatibilidad con la respuesta del backend
export interface JwtResponse {
  token: string;
  type: string; // "Bearer"
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  roles: string[];
}
