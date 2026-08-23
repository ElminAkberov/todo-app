export interface User {
  id: string
  email: string
  createdAt: string
}

export interface Credentials {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RefreshResponse {
  accessToken: string
}
