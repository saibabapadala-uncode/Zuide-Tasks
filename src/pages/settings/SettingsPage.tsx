import React, { useState } from 'react'
import {
  IonPage, IonContent, IonToggle, useIonToast,
} from '@ionic/react'
import { MobileLayout } from '@/layouts/MobileLayout'
import { useThemeStore } from '@/store'

interface NotifPref {
  key: string
  label: string
  description: string
  enabled: boolean
}

export const SettingsPage: React.FC = () => {
  const { isDark, setDark } = useThemeStore()
  const [presentToast] = useIonToast()

  const [notifPrefs, setNotifPrefs] = useState<NotifPref[]>([
    { key: 'newTask',       label: 'New Task Assigned',    description: 'Get notified when a task is assigned to you', enabled: true },
    { key: 'approvals',     label: 'Task Approvals',       description: 'Get notified when your task is approved',     enabled: true },
    { key: 'rejections',    label: 'Task Rejections',      description: 'Get notified when your task is rejected',     enabled: true },
    { key: 'comments',      label: 'New Comments',         description: 'Get notified when someone comments on your task', enabled: true },
    { key: 'deadlines',     label: 'Deadline Reminders',   description: 'Get reminded 24h before task due dates',      enabled: true },
    { key: 'announcements', label: 'Announcements',        description: 'Receive company-wide announcements',          enabled: true },
    { key: 'browser',       label: 'Push Notifications',   description: 'Enable device push notifications',            enabled: false },
  ])

  const togglePref = (key: string) => {
    setNotifPrefs(prev => prev.map(p => p.key === key ? { ...p, enabled: !p.enabled } : p))
  }

  const handleSave = () => {
    presentToast({ message: 'Settings saved successfully', duration: 2000, color: 'success', position: 'bottom' })
  }

  return (
    <IonPage>
      <MobileLayout title="Settings" showNotifications={false} />

      <IonContent>
        <div className="bg-zinc-55 dark:bg-[#09090b] min-h-full pb-6">
          <div className="p-4 space-y-4 max-w-2xl mx-auto">
            
            {/* Appearance Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
              <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest mb-4">Appearance</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-250">Theme</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setDark(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      !isDark
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-50 border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-850 text-zinc-505 hover:text-zinc-700 dark:text-zinc-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setDark(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      isDark
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-50 border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-850 text-zinc-505 hover:text-zinc-700 dark:text-zinc-400'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-50 border border-zinc-150 dark:bg-zinc-950 dark:border-zinc-850 text-zinc-505 hover:text-zinc-700 dark:text-zinc-400"
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Prefs Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
              <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest mb-4">Notifications</h3>
              <div className="space-y-4">
                {notifPrefs.map(pref => (
                  <div key={pref.key} className="flex justify-between items-center gap-4 pb-4 border-b border-zinc-100/50 dark:border-zinc-850/40 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{pref.label}</h4>
                      <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 leading-relaxed">{pref.description}</p>
                    </div>
                    <IonToggle
                      checked={pref.enabled}
                      onIonChange={() => togglePref(pref.key)}
                      style={{ '--background-checked': '#4f46e5' } as any}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* App Info Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
              <h3 className="text-xs font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-widest mb-4">About</h3>
              <div className="space-y-3">
                {[
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Platform', value: 'Ionic PWA + Capacitor' },
                  { label: 'Build', value: '2026.06.11' },
                  { label: 'Environment', value: 'Production' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-zinc-100/50 dark:border-zinc-850/40 last:border-0 pb-2 last:pb-0">
                    <span className="text-xs font-semibold text-zinc-405 dark:text-zinc-500">{item.label}</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="w-full text-xs font-bold py-3 px-4 bg-indigo-600 hover:bg-indigo-705 text-white rounded-lg shadow-sm transition-all duration-150"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
