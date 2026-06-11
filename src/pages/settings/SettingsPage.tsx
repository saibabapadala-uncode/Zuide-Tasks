import React, { useState } from 'react'
import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonToggle,
  IonListHeader, IonNote, useIonToast,
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
        <div className="bg-gray-50 dark:bg-gray-900 min-h-full pb-6">
          {/* Appearance section */}
          <IonList inset className="mt-4">
            <IonListHeader>
              <IonLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Appearance
              </IonLabel>
            </IonListHeader>

            <IonItem
              lines="inset"
              style={{ '--background': 'var(--ion-card-background)' } as any}
            >
              <IonLabel>
                <h2 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h2>
              </IonLabel>
              <div slot="end" className="flex gap-2">
                <button
                  onClick={() => setDark(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !isDark
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setDark(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isDark
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  Auto
                </button>
              </div>
            </IonItem>
          </IonList>

          {/* Notification preferences */}
          <IonList inset className="mt-4">
            <IonListHeader>
              <IonLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Notifications
              </IonLabel>
            </IonListHeader>

            {notifPrefs.map(pref => (
              <IonItem
                key={pref.key}
                lines="inset"
                style={{ '--background': 'var(--ion-card-background)' } as any}
              >
                <IonLabel>
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white">{pref.label}</h2>
                  <IonNote className="text-xs text-gray-500 dark:text-gray-400">{pref.description}</IonNote>
                </IonLabel>
                <IonToggle
                  slot="end"
                  checked={pref.enabled}
                  onIonChange={() => togglePref(pref.key)}
                  color="primary"
                />
              </IonItem>
            ))}
          </IonList>

          {/* App info */}
          <IonList inset className="mt-4">
            <IonListHeader>
              <IonLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                About
              </IonLabel>
            </IonListHeader>

            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Platform', value: 'Ionic PWA + Capacitor' },
              { label: 'Build', value: '2026.06.11' },
              { label: 'Environment', value: 'Production' },
            ].map(item => (
              <IonItem
                key={item.label}
                lines="inset"
                style={{ '--background': 'var(--ion-card-background)' } as any}
              >
                <IonLabel>
                  <span className="text-sm text-gray-900 dark:text-white">{item.label}</span>
                </IonLabel>
                <IonNote slot="end" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.value}
                </IonNote>
              </IonItem>
            ))}
          </IonList>

          {/* Save button */}
          <div className="px-4 mt-6">
            <button
              onClick={handleSave}
              className="w-full btn-primary py-3 font-semibold"
            >
              Save Settings
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
