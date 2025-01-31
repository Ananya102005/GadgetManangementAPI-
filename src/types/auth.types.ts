export interface SigninRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "ADMIN" | "USER";
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data: { token: string } | null;
}
