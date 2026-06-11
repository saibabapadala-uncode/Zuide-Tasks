export type NotificationType =
  | 'new_task'
  | 'task_approved'
  | 'task_rejected'
  | 'comment_added'
  | 'deadline_reminder'
  | 'announcement'
  | 'task_assigned'
  | 'task_completed'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  recipientId: string
  senderId?: string
  senderName?: string
  taskId?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationPreferences {
  newTask: boolean
  approvals: boolean
  rejections: boolean
  comments: boolean
  deadlineReminders: boolean
  announcements: boolean
  browserNotifications: boolean
  pushNotifications: boolean
}
