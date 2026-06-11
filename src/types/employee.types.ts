export interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  phone?: string
  avatar?: string
  department: string
  designation: string
  role: 'employee' | 'manager' | 'admin'
  managerId?: string
  managerName?: string
  joinDate: string
  isActive: boolean
  productivityScore: number
  tasksCompleted: number
  tasksPending: number
  tasksRejected: number
  skills: string[]
}

export interface Department {
  id: string
  name: string
  managerId: string
  managerName: string
  employeeCount: number
}

export interface EmployeeStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  rejectedTasks: number
  productivityScore: number
  averageCompletionTime: number
  onTimeDeliveryRate: number
}
