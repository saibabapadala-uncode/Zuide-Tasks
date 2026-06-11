import type { LoginCredentials, AuthUser, ChangePasswordRequest } from '@/types'
import { StorageManager, STORAGE_KEYS } from '@/capacitor/StorageManager'
import employeesData from '@/data/employees.json'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Demo accounts: email → employee id mapping
const DEMO_USERS: Record<string, string> = {
  'manager@zuide.com':  'emp-001', // Alex Johnson — Admin
  'lead@zuide.com':     'emp-002', // Sarah Chen — Manager
  'employee@zuide.com': 'emp-005', // James Martinez — Employee
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay(800)

    let employee: any = null

    // Demo account: email + any password >= 4 chars
    const demoId = DEMO_USERS[credentials.email.toLowerCase().trim()]
    if (demoId) {
      employee = (employeesData as any[]).find(e => e.id === demoId)
    }

    // Regular login: match by email
    if (!employee) {
      employee = (employeesData as any[]).find(
        e => e.email.toLowerCase() === credentials.email.toLowerCase().trim()
      )
    }

    if (!employee) {
      throw new Error('No account found with this email address.')
    }

    if (credentials.password.length < 4) {
      throw new Error('Invalid password. Must be at least 4 characters.')
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
    const lower = email.toLowerCase().trim()
    const isDemo = !!DEMO_USERS[lower]
    const inEmployees = (employeesData as any[]).some(e => e.email.toLowerCase() === lower)
    if (!isDemo && !inEmployees) throw new Error('No account found with this email address.')
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
