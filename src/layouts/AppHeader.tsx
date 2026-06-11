import React, { useState, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { IonToolbar, IonButtons, IonTitle, IonMenuToggle } from '@ionic/react'
import { NotificationBell } from '@/components/NotificationBell'
import { useAuthStore, useNotificationStore, useThemeStore } from '@/store'

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
  const { isDark, toggle } = useThemeStore()
  const history = useHistory()
  const [profileOpen, setProfileOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const triggerLogout = () => {
    setProfileOpen(false)
    window.dispatchEvent(new CustomEvent('trigger-logout'))
  }

  const roleLabel =
    user?.role === 'admin' ? 'Admin' :
    user?.role === 'manager' ? 'Team Lead' : 'Employee'

  return (
    <>
      {/* ── Desktop Header (lg+) ── */}
      <IonToolbar
        className="hidden lg:block border-b border-zinc-200/50 dark:border-zinc-800/80"
        style={{ '--border-style': 'none', '--padding-start': '0', '--padding-end': '0' } as any}
      >
        <div className="flex items-center justify-between px-6 h-14 bg-white dark:bg-[#09090b] w-full">
          {/* Left: Search */}
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
          <div className="flex items-center gap-3">
            {/* Support */}
            <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
              <QuestionMarkCircleIcon className="w-4.5 h-4.5" />
              <span>Support</span>
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Theme Toggle */}
            {showThemeToggle && (
              <button
                onClick={toggle}
                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark
                  ? <SunIcon className="w-4.5 h-4.5" />
                  : <MoonIcon className="w-4.5 h-4.5" />
                }
              </button>
            )}

            {endSlot && (
              <>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center">{endSlot}</div>
              </>
            )}

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2.5 group"
              >
                <div className="hidden xl:block text-right">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{user?.name}</p>
                  <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">{roleLabel}</p>
                </div>
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover bg-zinc-150 border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-indigo-300 dark:group-hover:border-indigo-600 transition-colors"
                />
                <ChevronDownIcon className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-fade-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate">{user?.name}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">{roleLabel}</span>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <button
                      onClick={() => { setProfileOpen(false); history.push('/profile') }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      View Profile
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); history.push('/settings') }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                      </svg>
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 p-1.5">
                    <button
                      onClick={triggerLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left"
                    >
                      <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonToolbar>

      {/* ── Mobile Header (below lg) ── */}
      <IonToolbar
        className="lg:hidden border-b border-zinc-200/50 dark:border-zinc-800/80"
        style={{ '--background': 'var(--ion-background-color)', '--border-style': 'none' } as any}
      >
        {/* Left: Hamburger */}
        <IonButtons slot="start">
          <IonMenuToggle>
            <button className="flex items-center justify-center w-9 h-9 ml-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Bars3Icon className="w-5 h-5" />
            </button>
          </IonMenuToggle>
        </IonButtons>

        {/* Center: Title */}
        <IonTitle>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</span>
        </IonTitle>

        {/* Right: Notifications + Theme + Avatar */}
        <IonButtons slot="end">
          {showThemeToggle && (
            <button
              onClick={toggle}
              className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {isDark
                ? <SunIcon className="w-[18px] h-[18px]" />
                : <MoonIcon className="w-[18px] h-[18px]" />
              }
            </button>
          )}
          {showNotifications && (
            <button
              onClick={() => history.push('/notifications')}
              className="relative p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-600 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white dark:border-[#09090b] shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          {/* Avatar → Profile */}
          <button
            onClick={() => history.push('/profile')}
            className="flex items-center mr-2 ml-0.5"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover bg-zinc-150 border-2 border-zinc-200 dark:border-zinc-700"
            />
          </button>
          {endSlot}
        </IonButtons>
      </IonToolbar>
    </>
  )
}
