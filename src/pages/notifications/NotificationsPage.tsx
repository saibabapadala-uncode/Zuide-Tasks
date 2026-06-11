import React, { useEffect } from 'react'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItemSliding, IonItem, IonItemOptions, IonItemOption,
  IonIcon, useIonToast,
} from '@ionic/react'
import { trashOutline, checkmarkOutline } from 'ionicons/icons'
import { formatDistanceToNow } from 'date-fns'
import { MobileLayout } from '@/layouts/MobileLayout'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { useNotificationStore, useAuthStore } from '@/store'
import { BellIcon } from '@heroicons/react/24/outline'

const typeColors: Record<string, string> = {
  new_task:          'bg-indigo-50 border-indigo-150 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400',
  task_approved:     'bg-emerald-50 border-emerald-150 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400',
  task_rejected:     'bg-rose-50 border-rose-150 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450',
  comment_added:     'bg-violet-50 border-violet-150 text-violet-750 dark:bg-violet-950/20 dark:border-violet-900/30 dark:text-violet-400',
  deadline_reminder: 'bg-amber-50 border-amber-150 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
  announcement:      'bg-indigo-50 border-indigo-150 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400',
  task_assigned:     'bg-indigo-50 border-indigo-150 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400',
  task_completed:    'bg-emerald-50 border-emerald-150 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400',
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
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mr-2 hover:underline"
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

        <div className="bg-zinc-50 dark:bg-[#09090b] min-h-full pb-8">
          {/* Header info */}
          <div className="px-4 pt-3.5 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up'}
            </span>
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
            <IonList className="space-y-2 px-4 py-2" style={{ background: 'transparent' }}>
              {notifications.map(notif => {
                const config = typeColors[notif.type] || 'bg-zinc-50 border-zinc-100 text-zinc-705 dark:bg-zinc-950/20 dark:border-zinc-900/30 dark:text-zinc-400'
                const isUnread = !notif.isRead
                return (
                  <IonItemSliding key={notif.id} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                    <IonItem
                      lines="none"
                      onClick={() => isUnread && markAsRead(notif.id)}
                      style={{
                        '--background': isUnread ? 'rgba(79,70,229,0.02)' : 'var(--ion-card-background)',
                        '--min-height': 'auto',
                        '--padding-start': '16px',
                        '--padding-end': '16px',
                      } as any}
                    >
                      <div className="flex items-start gap-3 w-full py-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full border border-black/5 dark:border-white/5 ${
                            notif.type.includes('approved') || notif.type.includes('completed') ? 'bg-emerald-500' :
                            notif.type.includes('rejected') ? 'bg-rose-500' :
                            notif.type.includes('reminder') ? 'bg-amber-500' :
                            'bg-indigo-550'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${config}`}>
                              {typeLabels[notif.type] || notif.type}
                            </span>
                            {isUnread && (
                              <span className="text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-955/30 dark:text-rose-400 px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider flex-shrink-0">
                                New
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 tracking-tight leading-tight">{notif.title}</p>
                          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 whitespace-normal leading-relaxed font-medium">{notif.message}</p>
                          
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-zinc-455 dark:text-zinc-500">
                            <span>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                            {notif.senderName && (
                              <>
                                <span>·</span>
                                <span>from {notif.senderName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </IonItem>

                    <IonItemOptions side="end">
                      {isUnread && (
                        <IonItemOption color="primary" onClick={() => markAsRead(notif.id)} className="bg-indigo-600">
                          <IonIcon slot="icon-only" icon={checkmarkOutline} />
                        </IonItemOption>
                      )}
                      <IonItemOption color="danger" onClick={() => handleDelete(notif.id)} className="bg-rose-600">
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonItemOption>
                    </IonItemOptions>
                  </IonItemSliding>
                )
              })}
            </IonList>
          )}

          <div className="pb-6" />
        </div>
      </IonContent>
    </IonPage>
  )
}
