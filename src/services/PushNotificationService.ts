import { NotificationManager } from '@/capacitor/NotificationManager'
import { notificationService } from './NotificationService'

class PushNotificationService {
  private removeListener: (() => void) | null = null

  async initialize(userId: string): Promise<void> {
    const perm = await NotificationManager.requestPermissions()
    if (perm !== 'granted') {
      console.info('[PushNotifications] Permission not granted')
      return
    }

    try {
      const registration = await NotificationManager.register()
      console.info('[PushNotifications] Registered with token:', registration.token)

      // In a real app, send this token to your backend:
      // await apiService.registerPushToken(userId, registration.token, registration.platform)

      this.removeListener = NotificationManager.addListener(async data => {
        console.info('[PushNotifications] Received:', data)
        // Refresh notification list when a push is received
        await notificationService.getNotifications(userId)
      })
    } catch (err) {
      console.error('[PushNotifications] Registration failed:', err)
    }
  }

  async scheduleTaskReminders(tasks: Array<{ id: string; title: string; dueDate: string }>): Promise<void> {
    for (const task of tasks) {
      const due = new Date(task.dueDate)
      await NotificationManager.scheduleDeadlineReminder(task.title, due)
    }
  }

  async sendTestNotification(): Promise<void> {
    await NotificationManager.showLocalNotification({
      title: 'Zuide Tasks',
      body: 'Push notifications are working!',
    })
  }

  cleanup(): void {
    if (this.removeListener) {
      this.removeListener()
      this.removeListener = null
    }
    NotificationManager.unregister()
  }
}

export const pushNotificationService = new PushNotificationService()
