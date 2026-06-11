export interface LoginCredentials {
  employeeId: string
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthUser {
  id: string
  employeeId: string
  name: string
  email: string
  avatar?: string
  role: 'employee' | 'manager' | 'admin'
  department: string
  designation: string
  phone?: string
  token?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
