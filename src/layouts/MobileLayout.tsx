/**
 * MobileLayout — shared header component for mobile pages.
 * Provides IonHeader + IonToolbar with menu button, title, and optional actions.
 */
import React from 'react'
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonButton, IonIcon, IonBadge,
} from '@ionic/react'
import { notificationsOutline, moonOutline, sunnyOutline } from 'ionicons/icons'
import { useNotificationStore, useThemeStore } from '@/store'
import { useHistory } from 'react-router-dom'

interface MobileLayoutProps {
  title: string
  endSlot?: React.ReactNode
  showNotifications?: boolean
  showThemeToggle?: boolean
  color?: string
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  title,
  endSlot,
  showNotifications = true,
  showThemeToggle = true,
  color,
}) => {
  const history = useHistory()
  const { unreadCount } = useNotificationStore()
  const { isDark, toggle } = useThemeStore()

  return (
    <IonHeader translucent>
      <IonToolbar color={color}>
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>

        <IonTitle>{title}</IonTitle>

        <IonButtons slot="end">
          {showThemeToggle && (
            <IonButton onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'}>
              <IonIcon slot="icon-only" icon={isDark ? sunnyOutline : moonOutline} />
            </IonButton>
          )}
          {showNotifications && (
            <IonButton
              onClick={() => history.push('/notifications')}
              title="Notifications"
              className="relative"
            >
              <IonIcon slot="icon-only" icon={notificationsOutline} />
              {unreadCount > 0 && (
                <IonBadge
                  color="danger"
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    fontSize: '10px',
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </IonBadge>
              )}
            </IonButton>
          )}
          {endSlot}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}
