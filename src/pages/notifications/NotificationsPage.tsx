import React, { useEffect } from 'react'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItemSliding, IonItem, IonItemOptions, IonItemOption,
  IonLabel, IonBadge, IonIcon, useIonToast,
} from '@ionic/react'
import { trashOutline, checkmarkOutline } from 'ionicons/icons'
import { formatDistanceToNow } from 'date-fns'
import { MobileLayout } from '@/layouts/MobileLayout'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { useNotificationStore, useAuthStore } from '@/store'
import { BellIcon } from '@heroicons/react/24/outline'

const typeColors: Record<string, string> = {
  new_task:          'bg-blue-500',
  task_approved:     'bg-green-500',
  task_rejected:     'bg-red-500',
  comment_added:     'bg-purple-500',
  deadline_reminder: 'bg-yellow-500',
  announcement:      'bg-indigo-500',
  task_assigned:     'bg-blue-500',
  task_completed:    'bg-green-500',
}

const typeLabels: Record<string, string> = {
  new_task:          'New Task',
  task_approved:     'Approved',
  task_rejected:     'Rejected',
  comment_added:     'Comment',
  deadline_reminder: 'Reminder',
  announcement:      'Announcement',
  task_assigned:     'Assigned',
  task_completed:    'Completed',
}

export const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore()
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore()
  const [presentToast] = useIonToast()

  useEffect(() => {
    if (user) fetchNotifications(user.id)
  }, [user])

  const handleRefresh = (ev: any) => {
    if (user) {
      fetchNotifications(user.id).finally(() => ev.detail.complete())
    } else {
      ev.detail.complete()
    }
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
    presentToast({ message: 'Notification deleted', duration: 1500, color: 'medium', position: 'bottom' })
  }

  const handleMarkAllRead = () => {
    if (user) {
      markAllAsRead(user.id)
      presentToast({ message: 'All notifications marked as read', duration: 1500, color: 'success', position: 'bottom' })
    }
  }

  return (
    <IonPage>
      <MobileLayout
        title="Notifications"
        showNotifications={false}
        endSlot={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-primary-600 dark:text-primary-300 font-medium mr-2"
            >
              Mark all read
            </button>
          ) : undefined
        }
      />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
          {/* Header info */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>

          {isLoading ? (
            <div className="p-4"><LoadingState /></div>
          ) : notifications.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No notifications"
                description="You're all caught up. No notifications at this time."
                icon={BellIcon}
              />
            </div>
          ) : (
            <IonList className="bg-transparent">
              {notifications.map(notif => (
                <IonItemSliding key={notif.id}>
                  <IonItem
                    lines="full"
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={!notif.isRead ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''}
                    style={{
                      '--background': notif.isRead ? 'var(--ion-card-background)' : 'rgba(79,70,229,0.04)',
                      '--inner-border-width': '0',
                      '--border-color': 'var(--ion-border-color)',
                    } as any}
                  >
                    {/* Color dot */}
                    <div slot="start" className="mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full mt-2 ${typeColors[notif.type] || 'bg-gray-400'}`} />
                    </div>

                    <IonLabel className="py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium text-white ${typeColors[notif.type] || 'bg-gray-500'}`}>
                          {typeLabels[notif.type] || notif.type}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 whitespace-normal">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                        {notif.senderName && (
                          <span className="text-xs text-gray-400">from {notif.senderName}</span>
                        )}
                      </div>
                    </IonLabel>

                    {!notif.isRead && (
                      <IonBadge slot="end" color="primary" style={{ borderRadius: '50%', width: 8, height: 8, padding: 0 }} />
                    )}
                  </IonItem>

                  <IonItemOptions side="end">
                    {!notif.isRead && (
                      <IonItemOption color="primary" onClick={() => markAsRead(notif.id)}>
                        <IonIcon slot="icon-only" icon={checkmarkOutline} />
                      </IonItemOption>
                    )}
                    <IonItemOption color="danger" onClick={() => handleDelete(notif.id)}>
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </IonList>
          )}

          <div className="pb-6" />
        </div>
      </IonContent>
    </IonPage>
  )
}
