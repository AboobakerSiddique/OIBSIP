export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface AuthAdmin {
  id: string;
  name: string;
  email: string;
}
