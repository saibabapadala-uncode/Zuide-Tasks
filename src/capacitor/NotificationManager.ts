/**
 * NotificationManager — wraps @capacitor/push-notifications and @capacitor/local-notifications.
 *
 * On native (iOS/Android): uses the Capacitor plugins for full push + local notification support.
 * On web: falls back to the browser Notification API.
 */

import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'

export interface PushRegistration {
  token: string
  platform: 'ios' | 'android' | 'web'
}

export interface LocalNotificationOptions {
  title: string
  body: string
  id?: number
  scheduleAt?: Date
  extra?: Record<string, any>
}

class NotificationManagerClass {
  private token: string | null = null
  private listeners: Array<(data: any) => void> = []
  private notifIdCounter = 1

  // ── Permissions ──────────────────────────────────────────────────────

  async requestPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
    if (Capacitor.isNativePlatform()) {
      const { receive } = await PushNotifications.requestPermissions()
      return receive === 'granted' ? 'granted' : 'denied'
    }
    // Web fallback
    if (!('Notification' in window)) return 'denied'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied')  return 'denied'
    const result = await Notification.requestPermission()
    return result === 'granted' ? 'granted' : 'denied'
  }

  // ── Push registration ─────────────────────────────────────────────

  async register(): Promise<PushRegistration> {
    const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web'

    if (Capacitor.isNativePlatform()) {
      const perm = await PushNotifications.requestPermissions()
      if (perm.receive !== 'granted') {
        return { token: '', platform }
      }

      await PushNotifications.register()

      // Token is delivered asynchronously via the 'registration' event.
      // The listener in addListener() captures it when received.
      return new Promise(resolve => {
        const handler = PushNotifications.addListener('registration', token => {
          this.token = token.value
          handler.then(l => l.remove())
          resolve({ token: token.value, platform })
        })
        // Resolve with empty token after 5 s if no token arrives (e.g., simulator)
        setTimeout(() => resolve({ token: this.token ?? '', platform }), 5000)
      })
    }

    // Web fallback — request browser notification permission only
    await this.requestPermissions()
    this.token = `web_push_token_${Date.now()}`
    return { token: this.token, platform: 'web' }
  }

  async unregister(): Promise<void> {
    this.token = null
    // On native, remove the token from your backend instead of calling a Capacitor method
  }

  async getToken(): Promise<string | null> {
    return this.token
  }

  // ── Local notifications ───────────────────────────────────────────

  async showLocalNotification(options: LocalNotificationOptions): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const { display } = await LocalNotifications.requestPermissions()
      if (display !== 'granted') return

      await LocalNotifications.schedule({
        notifications: [{
          id:    options.id ?? this.notifIdCounter++,
          title: options.title,
          body:  options.body,
          ...(options.scheduleAt ? { schedule: { at: options.scheduleAt } } : {}),
          extra: options.extra ?? null,
        }],
      })
      return
    }

    // Web fallback
    const perm = await this.requestPermissions()
    if (perm !== 'granted') return
    const n = new Notification(options.title, { body: options.body, icon: '/favicon.svg' })
    setTimeout(() => n.close(), 5000)
  }

  /** Schedule a reminder 24 h before task due date */
  async scheduleDeadlineReminder(taskTitle: string, dueDate: Date): Promise<void> {
    const hoursUntil = (dueDate.getTime() - Date.now()) / 36e5
    if (hoursUntil > 0 && hoursUntil <= 24) {
      const scheduleAt = new Date(dueDate.getTime() - 30 * 60 * 1000) // 30 min before
      await this.showLocalNotification({
        title:      'Task Due Soon',
        body:       `"${taskTitle}" is due in ${Math.round(hoursUntil)} hours`,
        scheduleAt: scheduleAt > new Date() ? scheduleAt : undefined,
        extra:      { taskTitle },
      })
    }
  }

  // ── Push notification listener ────────────────────────────────────

  addListener(callback: (data: any) => void): () => void {
    if (Capacitor.isNativePlatform()) {
      const handle = PushNotifications.addListener('pushNotificationReceived', payload => {
        callback(payload)
        this.listeners.forEach(l => l(payload))
      })
      return () => { handle.then(l => l.remove()) }
    }
    // Web: manual dispatch
    this.listeners.push(callback)
    return () => { this.listeners = this.listeners.filter(l => l !== callback) }
  }
}

export const NotificationManager = new NotificationManagerClass()
