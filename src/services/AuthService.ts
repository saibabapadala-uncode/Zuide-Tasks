import type { LoginCredentials, AuthUser, ChangePasswordRequest } from '@/types'
import { StorageManager, STORAGE_KEYS } from '@/capacitor/StorageManager'
import employeesData from '@/data/employees.json'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay(800)

    const employee = (employeesData as any[]).find(
      emp =>
        emp.employeeId === credentials.employeeId &&
        emp.email === credentials.email
    )

    if (!employee) {
      throw new Error('Invalid Employee ID or Email. Please check your credentials.')
    }

    if (credentials.password.length < 4) {
      throw new Error('Invalid password.')
    }

    const user: AuthUser = {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      avatar: employee.avatar,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      phone: employee.phone,
      token: `mock_token_${employee.id}_${Date.now()}`,
    }

    // Uses StorageManager (localStorage now, Capacitor Preferences in native builds)
    await StorageManager.setJSON(STORAGE_KEYS.AUTH_USER, user)
    await StorageManager.set(STORAGE_KEYS.AUTH_TOKEN, user.token!)

    return user
  }

  async logout(): Promise<void> {
    await StorageManager.remove(STORAGE_KEYS.AUTH_USER)
    await StorageManager.remove(STORAGE_KEYS.AUTH_TOKEN)
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return StorageManager.getJSON<AuthUser>(STORAGE_KEYS.AUTH_USER)
  }

  getCurrentUserSync(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  async forgotPassword(email: string): Promise<void> {
    await delay(1000)
    const employee = (employeesData as any[]).find(emp => emp.email === email)
    if (!employee) throw new Error('No account found with this email address.')
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await delay(800)
    if (request.newPassword !== request.confirmPassword) {
      throw new Error('New passwords do not match.')
    }
    if (request.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.')
    }
  }
}

export const authService = new AuthService()
