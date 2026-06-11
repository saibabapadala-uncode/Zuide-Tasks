export interface DailyReport {
  date: string
  employeeId: string
  employeeName: string
  tasksCompleted: number
  hoursWorked: number
  tasksDetails: Array<{
    taskId: string
    title: string
    status: string
    hoursSpent: number
  }>
}

export interface WeeklyReport {
  weekStart: string
  weekEnd: string
  employeeId: string
  employeeName: string
  productivityTrend: Array<{ day: string; tasksCompleted: number; hoursWorked: number }>
  completionRate: number
  totalTasksCompleted: number
  totalHoursWorked: number
}

export interface MonthlyReport {
  month: string
  year: number
  employeeId: string
  employeeName: string
  department: string
  performanceScore: number
  tasksCompleted: number
  tasksAssigned: number
  completionRate: number
  averageTaskTime: number
  teamStats?: TeamPerformance
}

export interface TeamPerformance {
  departmentId: string
  departmentName: string
  totalEmployees: number
  totalTasks: number
  completedTasks: number
  averageProductivity: number
  topPerformer: string
}

export interface WorkLog {
  id: string
  employeeId: string
  employeeName: string
  taskId: string
  taskTitle: string
  date: string
  hoursWorked: number
  description: string
  createdAt: string
}
