import { create } from 'zustand'
import { Task, TaskFilters } from '@/types'
import { taskService } from '@/services'

interface TaskStore {
  tasks: Task[]
  currentTask: Task | null
  isLoading: boolean
  error: string | null
  filters: TaskFilters
  dashboardStats: {
    total: number
    pending: number
    inProgress: number
    submitted: number
    approved: number
    rejected: number
    completed: number
    todaysTasks: number
  } | null

  fetchTasks: (filters?: TaskFilters) => Promise<void>
  fetchTaskById: (id: string) => Promise<void>
  updateStatus: (taskId: string, status: Task['status'], comment?: string) => Promise<void>
  updateProgress: (taskId: string, progress: number) => Promise<void>
  addComment: (taskId: string, content: string, authorId: string, authorName: string, authorAvatar?: string) => Promise<void>
  editComment: (taskId: string, commentId: string, content: string) => Promise<void>
  deleteComment: (taskId: string, commentId: string) => Promise<void>
  setFilters: (filters: TaskFilters) => void
  clearFilters: () => void
  refreshStats: (employeeId?: string) => void
  clearError: () => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {},
  dashboardStats: null,

  fetchTasks: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const activeFilters = filters || get().filters
      const tasks = await taskService.getTasks(activeFilters)
      set({ tasks, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchTaskById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const task = await taskService.getTaskById(id)
      set({ currentTask: task, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  updateStatus: async (taskId, status, comment) => {
    try {
      const updated = await taskService.updateTaskStatus(taskId, status, comment)
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updated : t),
        currentTask: state.currentTask?.id === taskId ? updated : state.currentTask,
      }))
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  updateProgress: async (taskId, progress) => {
    try {
      const updated = await taskService.updateTaskProgress(taskId, progress)
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updated : t),
        currentTask: state.currentTask?.id === taskId ? updated : state.currentTask,
      }))
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  addComment: async (taskId, content, authorId, authorName, authorAvatar) => {
    try {
      await taskService.addComment(taskId, content, authorId, authorName, authorAvatar)
      const updated = await taskService.getTaskById(taskId)
      if (updated) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? updated : t),
          currentTask: state.currentTask?.id === taskId ? updated : state.currentTask,
        }))
      }
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  editComment: async (taskId, commentId, content) => {
    try {
      await taskService.editComment(taskId, commentId, content)
      const updated = await taskService.getTaskById(taskId)
      if (updated) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? updated : t),
          currentTask: state.currentTask?.id === taskId ? updated : state.currentTask,
        }))
      }
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  deleteComment: async (taskId, commentId) => {
    try {
      await taskService.deleteComment(taskId, commentId)
      const updated = await taskService.getTaskById(taskId)
      if (updated) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === taskId ? updated : t),
          currentTask: state.currentTask?.id === taskId ? updated : state.currentTask,
        }))
      }
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  refreshStats: (employeeId) => {
    const stats = taskService.getDashboardStats(employeeId)
    set({ dashboardStats: stats })
  },

  clearError: () => set({ error: null }),
}))
