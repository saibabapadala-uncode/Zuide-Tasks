import { Task, TaskFilters, Comment, ApprovalAction, DailyWorkSubmission } from '@/types'
import tasksData from '@/data/tasks.json'
import employeesData from '@/data/employees.json'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let mockTasks: Task[] = tasksData as Task[]
let mockWorkSubmissions: DailyWorkSubmission[] = []

class TaskService {
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    await delay(400)
    let tasks = [...mockTasks]

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      tasks = tasks.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.taskId.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }

    if (filters?.status?.length) {
      tasks = tasks.filter(t => filters.status!.includes(t.status))
    }

    if (filters?.priority?.length) {
      tasks = tasks.filter(t => filters.priority!.includes(t.priority))
    }

    if (filters?.assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === filters.assignedTo)
    }

    if (filters?.teamOf) {
      const teamIds = new Set([
        filters.teamOf,
        ...(employeesData as any[])
          .filter((e: any) => e.managerId === filters.teamOf)
          .map((e: any) => e.id),
      ])
      tasks = tasks.filter(t => teamIds.has(t.assignedTo))
    }

    if (filters?.projectId) {
      tasks = tasks.filter(t => t.projectId === filters.projectId)
    }

    if (filters?.sortBy) {
      tasks.sort((a, b) => {
        const aVal = (a as any)[filters.sortBy!]
        const bVal = (b as any)[filters.sortBy!]
        const order = filters.sortOrder === 'desc' ? -1 : 1
        return aVal > bVal ? order : -order
      })
    }

    return tasks
  }

  async getTasksByEmployee(employeeId: string): Promise<Task[]> {
    await delay(300)
    return mockTasks.filter(t => t.assignedTo === employeeId)
  }

  async getTaskById(id: string): Promise<Task | null> {
    await delay(200)
    return mockTasks.find(t => t.id === id || t.taskId === id) || null
  }

  async updateTaskStatus(taskId: string, status: Task['status'], comment?: string): Promise<Task> {
    await delay(500)
    const idx = mockTasks.findIndex(t => t.id === taskId)
    if (idx === -1) throw new Error('Task not found')

    const task = { ...mockTasks[idx] }
    const oldStatus = task.status
    task.status = status
    task.updatedAt = new Date().toISOString()

    if (status === 'in_progress' && !task.startDate) {
      task.startDate = new Date().toISOString()
    }
    if (status === 'completed') {
      task.completedDate = new Date().toISOString()
      task.progress = 100
    }

    const activityItem = {
      id: `act-${Date.now()}`,
      taskId,
      action: 'status_changed',
      description: `Status changed from ${oldStatus} to ${status}`,
      performedBy: 'current_user',
      performedByName: 'Current User',
      timestamp: new Date().toISOString(),
      oldValue: oldStatus,
      newValue: status,
    }

    task.activityHistory = [...(task.activityHistory || []), activityItem]

    if (comment) {
      const commentItem: Comment = {
        id: `cmt-${Date.now()}`,
        taskId,
        content: comment,
        authorId: 'current_user',
        authorName: 'Current User',
        createdAt: new Date().toISOString(),
        isEdited: false,
      }
      task.comments = [...(task.comments || []), commentItem]
    }

    mockTasks[idx] = task
    return task
  }

  async updateTaskProgress(taskId: string, progress: number): Promise<Task> {
    await delay(300)
    const idx = mockTasks.findIndex(t => t.id === taskId)
    if (idx === -1) throw new Error('Task not found')

    mockTasks[idx] = {
      ...mockTasks[idx],
      progress,
      updatedAt: new Date().toISOString(),
    }
    return mockTasks[idx]
  }

  async approveTask(action: ApprovalAction): Promise<Task> {
    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      request_rework: 'in_progress' as const,
    }
    return this.updateTaskStatus(action.taskId, statusMap[action.action], action.comment)
  }

  async addComment(taskId: string, content: string, authorId: string, authorName: string, authorAvatar?: string): Promise<Comment> {
    await delay(400)
    const idx = mockTasks.findIndex(t => t.id === taskId)
    if (idx === -1) throw new Error('Task not found')

    const comment: Comment = {
      id: `cmt-${Date.now()}`,
      taskId,
      content,
      authorId,
      authorName,
      authorAvatar,
      createdAt: new Date().toISOString(),
      isEdited: false,
    }

    mockTasks[idx] = {
      ...mockTasks[idx],
      comments: [...(mockTasks[idx].comments || []), comment],
      updatedAt: new Date().toISOString(),
    }

    return comment
  }

  async editComment(taskId: string, commentId: string, content: string): Promise<Comment> {
    await delay(300)
    const taskIdx = mockTasks.findIndex(t => t.id === taskId)
    if (taskIdx === -1) throw new Error('Task not found')

    const comments = [...(mockTasks[taskIdx].comments || [])]
    const cIdx = comments.findIndex(c => c.id === commentId)
    if (cIdx === -1) throw new Error('Comment not found')

    comments[cIdx] = {
      ...comments[cIdx],
      content,
      updatedAt: new Date().toISOString(),
      isEdited: true,
    }

    mockTasks[taskIdx] = { ...mockTasks[taskIdx], comments, updatedAt: new Date().toISOString() }
    return comments[cIdx]
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    await delay(300)
    const taskIdx = mockTasks.findIndex(t => t.id === taskId)
    if (taskIdx === -1) throw new Error('Task not found')

    mockTasks[taskIdx] = {
      ...mockTasks[taskIdx],
      comments: (mockTasks[taskIdx].comments || []).filter(c => c.id !== commentId),
      updatedAt: new Date().toISOString(),
    }
  }

  async submitDailyWork(submission: Omit<DailyWorkSubmission, 'id' | 'submittedAt'>): Promise<DailyWorkSubmission> {
    await delay(600)
    const newSubmission: DailyWorkSubmission = {
      ...submission,
      id: `dws-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    }
    mockWorkSubmissions.push(newSubmission)
    return newSubmission
  }

  async getDailySubmissionByEmployee(employeeId: string, date: string): Promise<DailyWorkSubmission | null> {
    await delay(200)
    return (
      mockWorkSubmissions.find(s => s.employeeId === employeeId && s.date === date) || null
    )
  }

  getDashboardStats(employeeId?: string, teamOf?: string) {
    let tasks = mockTasks
    if (employeeId) {
      tasks = mockTasks.filter(t => t.assignedTo === employeeId)
    } else if (teamOf) {
      const teamIds = new Set([
        teamOf,
        ...(employeesData as any[])
          .filter((e: any) => e.managerId === teamOf)
          .map((e: any) => e.id),
      ])
      tasks = mockTasks.filter(t => teamIds.has(t.assignedTo))
    }

    const today = new Date().toISOString().split('T')[0]

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      submitted: tasks.filter(t => t.status === 'submitted').length,
      approved: tasks.filter(t => t.status === 'approved').length,
      rejected: tasks.filter(t => t.status === 'rejected').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      todaysTasks: tasks.filter(t => t.dueDate === today).length,
    }
  }
}

export const taskService = new TaskService()
