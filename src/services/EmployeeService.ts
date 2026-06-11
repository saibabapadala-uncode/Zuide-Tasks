import { Employee, EmployeeStats } from '@/types'
import employeesData from '@/data/employees.json'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let mockEmployees: Employee[] = employeesData as Employee[]

class EmployeeService {
  async getEmployees(): Promise<Employee[]> {
    await delay(400)
    return mockEmployees.filter(e => e.isActive)
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    await delay(200)
    return mockEmployees.find(e => e.id === id || e.employeeId === id) || null
  }

  async getEmployeeStats(employeeId: string): Promise<EmployeeStats> {
    await delay(300)
    const employee = mockEmployees.find(e => e.id === employeeId)
    if (!employee) throw new Error('Employee not found')

    return {
      totalTasks: employee.tasksCompleted + employee.tasksPending + employee.tasksRejected,
      completedTasks: employee.tasksCompleted,
      pendingTasks: employee.tasksPending,
      inProgressTasks: Math.floor(employee.tasksPending * 0.6),
      rejectedTasks: employee.tasksRejected,
      productivityScore: employee.productivityScore,
      averageCompletionTime: 5.8,
      onTimeDeliveryRate: 92,
    }
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    await delay(500)
    const idx = mockEmployees.findIndex(e => e.id === id)
    if (idx === -1) throw new Error('Employee not found')

    mockEmployees[idx] = { ...mockEmployees[idx], ...updates }
    return mockEmployees[idx]
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<Employee> {
    return this.updateEmployee(id, { avatar: avatarUrl })
  }

  async getTeamByManager(managerId: string): Promise<Employee[]> {
    await delay(300)
    return mockEmployees.filter(e => e.managerId === managerId && e.isActive)
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    await delay(300)
    const q = query.toLowerCase()
    return mockEmployees.filter(
      e =>
        e.isActive &&
        (e.name.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q))
    )
  }
}

export const employeeService = new EmployeeService()
