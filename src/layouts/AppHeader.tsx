import React from 'react'
import { useHistory } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { IonToolbar, IonButtons, IonTitle, IonMenuToggle } from '@ionic/react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { NotificationBell } from '@/components/NotificationBell'
import { useAuthStore, useNotificationStore } from '@/store'

interface AppHeaderProps {
  title?: string
  showNotifications?: boolean
  showThemeToggle?: boolean
  endSlot?: React.ReactNode
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Zuide Tasks',
  showNotifications = true,
  showThemeToggle = true,
  endSlot,
}) => {
  const { user } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const history = useHistory()

  const triggerLogout = () => {
    window.dispatchEvent(new CustomEvent('trigger-logout'))
  }

  return (
    <>
      {/* ── Desktop Header (visible only on lg screens and above) ── */}
      <IonToolbar className="hidden lg:block border-b border-zinc-200/50 dark:border-zinc-800/80" style={{ '--border-style': 'none', '--padding-start': '0', '--padding-end': '0' } as any}>
        <div className="flex items-center justify-between px-6 h-14 bg-white dark:bg-[#09090b] w-full">
          {/* Left: Search input mockup */}
          <div className="relative w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects or tasks..."
              readOnly
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350 rounded-lg border border-zinc-250/80 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-indigo-500/30"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Support */}
            <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
              <QuestionMarkCircleIcon className="w-4.5 h-4.5" />
              <span>Support</span>
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Theme switcher */}
            {showThemeToggle && <ThemeSwitcher size="sm" />}

            {/* Custom End Slot */}
            {endSlot && (
              <>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center">{endSlot}</div>
              </>
            )}

            {/* Divider */}
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

            {/* User profile details */}
            <button
              onClick={() => history.push('/profile')}
              className="flex items-center gap-3 text-right text-xs"
            >
              <div className="hidden xl:block">
                <p className="font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{user?.name}</p>
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Manager' : 'Employee'}
                </p>
              </div>
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover bg-zinc-150 border border-zinc-200 dark:border-zinc-800"
              />
            </button>

            {/* Logout */}
            <button
              onClick={triggerLogout}
              title="Log Out"
              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </IonToolbar>

      {/* ── Mobile Header (visible only below lg screens) ── */}
      <IonToolbar className="lg:hidden border-b border-zinc-200/50 dark:border-zinc-800/80">
        <IonButtons slot="start">
          <IonMenuToggle>
            <button className="flex items-center ml-2">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
                className="w-7 h-7 rounded-full object-cover bg-zinc-150 border border-zinc-200/50 dark:border-zinc-800"
              />
            </button>
          </IonMenuToggle>
        </IonButtons>

        <IonTitle>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</span>
        </IonTitle>

        <IonButtons slot="end">
          {showThemeToggle && <ThemeSwitcher size="sm" />}
          {showNotifications && (
            <button
              onClick={() => history.push('/notifications')}
              className="relative p-1.5 text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mr-1"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-600 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white dark:border-[#09090b] shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          {endSlot}
        </IonButtons>
      </IonToolbar>
    </>
  )
}


