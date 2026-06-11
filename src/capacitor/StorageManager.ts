/**
 * StorageManager — abstraction over Capacitor Preferences (native: NSUserDefaults/SharedPreferences)
 * with an automatic localStorage fallback for web/browser environments.
 *
 * The Capacitor Preferences plugin ships its own web implementation that mirrors
 * the native API, so a single code path works on all three platforms (iOS, Android, Web).
 */

import { Preferences } from '@capacitor/preferences'

export const StorageManager = {
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value })
  },

  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key })
    return value
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key })
  },

  async clear(): Promise<void> {
    await Preferences.clear()
  },

  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys()
    return keys
  },

  // ── Typed helpers ──────────────────────────────────────────────────

  async setJSON<T>(key: string, value: T): Promise<void> {
    await StorageManager.set(key, JSON.stringify(value))
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await StorageManager.get(key)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
}

export const STORAGE_KEYS = {
  AUTH_USER:   'zuide_auth_user',
  AUTH_TOKEN:  'zuide_auth_token',
  THEME:       'zuide_theme',
  NOTIF_PREFS: 'zuide_notif_prefs',
  OFFLINE_Q:   'zuide_offline_queue',
} as const
