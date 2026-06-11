export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  employeeId?: string
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
