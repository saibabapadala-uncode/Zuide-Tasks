import type { Notification, NotificationPreferences } from '@/types'
import notificationsData from '@/data/notifications.json'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let mockNotifications: Notification[] = notificationsData as Notification[]

class NotificationService {
  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(300)
    return mockNotifications
      .filter(n => n.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async getUnreadCount(userId: string): Promise<number> {
    await delay(100)
    return mockNotifications.filter(n => n.recipientId === userId && !n.isRead).length
  }

  async markAsRead(notificationId: string): Promise<void> {
    await delay(200)
    const idx = mockNotifications.findIndex(n => n.id === notificationId)
    if (idx !== -1) {
      mockNotifications[idx] = { ...mockNotifications[idx], isRead: true }
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await delay(300)
    mockNotifications = mockNotifications.map(n =>
      n.recipientId === userId ? { ...n, isRead: true } : n
    )
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await delay(200)
    mockNotifications = mockNotifications.filter(n => n.id !== notificationId)
  }

  async broadcastAnnouncement(title: string, message: string, recipientIds: string[], senderId: string, senderName: string): Promise<void> {
    await delay(500)
    const notifications: Notification[] = recipientIds.map(recipientId => ({
      id: `notif-${Date.now()}-${recipientId}`,
      type: 'announcement' as const,
      title,
      message,
      recipientId,
      senderId,
      senderName,
      isRead: false,
      createdAt: new Date().toISOString(),
    }))
    mockNotifications = [...mockNotifications, ...notifications]
  }

  async sendTaskNotification(
    type: Notification['type'],
    title: string,
    message: string,
    recipientId: string,
    taskId: string,
    senderId?: string,
    senderName?: string
  ): Promise<void> {
    await delay(200)
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      recipientId,
      senderId,
      senderName,
      taskId,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    mockNotifications.push(notification)
  }

  async getPreferences(): Promise<NotificationPreferences> {
    return {
      newTask: true,
      approvals: true,
      rejections: true,
      comments: true,
      deadlineReminders: true,
      announcements: true,
      browserNotifications: false,
      pushNotifications: true,
    }
  }

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    await delay(400)
    const current = await this.getPreferences()
    return { ...current, ...prefs }
  }

  async requestBrowserPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
}

export const notificationService = new NotificationService()
