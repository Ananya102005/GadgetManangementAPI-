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
  error?: string;
  data: { token: string; message: string } | null;
}
