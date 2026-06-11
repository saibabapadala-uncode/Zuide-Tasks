import { Priority, TaskStatus } from './common.types'

export interface Task {
  id: string
  taskId: string
  title: string
  description: string
  priority: Priority
  status: TaskStatus
  progress: number
  assignedTo: string
  assignedToName: string
  assignedBy: string
  assignedByName: string
  projectId: string
  projectName: string
  dueDate: string
  startDate?: string
  completedDate?: string
  estimatedHours: number
  actualHours?: number
  tags: string[]
  attachments: Attachment[]
  comments: Comment[]
  activityHistory: ActivityItem[]
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  taskId: string
  filename: string
  originalName: string
  fileSize: number
  fileType: string
  url: string
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
}

export interface Comment {
  id: string
  taskId: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: string
  updatedAt?: string
  isEdited: boolean
}

export interface ActivityItem {
  id: string
  taskId: string
  action: string
  description: string
  performedBy: string
  performedByName: string
  timestamp: string
  oldValue?: string
  newValue?: string
}

export interface TaskFilters {
  search?: string
  status?: TaskStatus[]
  priority?: Priority[]
  assignedTo?: string
  teamOf?: string
  projectId?: string
  dueDateFrom?: string
  dueDateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApprovalAction {
  taskId: string
  action: 'approve' | 'reject' | 'request_rework'
  comment: string
}

export interface DailyWorkSubmission {
  id: string
  employeeId: string
  date: string
  completedTasks: string[]
  pendingTasks: string[]
  workSummary: string
  blockers: string
  tomorrowPlan: string
  workingHours: number
  submittedAt: string
}
