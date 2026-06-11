import { create } from 'zustand'
import { Notification } from '@/types'
import { notificationService } from '@/services'

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refreshUnreadCount: (userId: string) => Promise<void>
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId) => {
    set({ isLoading: true })
    try {
      const notifications = await notificationService.getNotifications(userId)
      const unreadCount = notifications.filter(n => !n.isRead).length
      set({ notifications, unreadCount, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  markAsRead: async (id) => {
    await notificationService.markAsRead(id)
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: async (userId) => {
    await notificationService.markAllAsRead(userId)
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },

  deleteNotification: async (id) => {
    await notificationService.deleteNotification(id)
    set(state => {
      const notif = state.notifications.find(n => n.id === id)
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: notif && !notif.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    })
  },

  refreshUnreadCount: async (userId) => {
    const count = await notificationService.getUnreadCount(userId)
    set({ unreadCount: count })
  },
}))
