import React from 'react'
import {
  IonMenu, IonHeader, IonToolbar, IonContent,
  IonItem, IonLabel, IonIcon, IonMenuToggle, IonBadge,
  IonFooter,
} from '@ionic/react'
import { useLocation, useHistory } from 'react-router-dom'
import { useIonToast } from '@ionic/react'
import {
  homeOutline, homeSharp,
  clipboardOutline, clipboardSharp,
  checkboxOutline, checkboxSharp,
  folderOpenOutline, folderOpenSharp,
  notificationsOutline, notificationsSharp,
  barChartOutline, barChartSharp,
  personOutline, personSharp,
  peopleOutline, peopleSharp,
  settingsOutline, settingsSharp,
  addOutline,
  logOutOutline,
  moonOutline, sunnyOutline,
} from 'ionicons/icons'
import { useAuthStore, useNotificationStore, useThemeStore } from '@/store'

interface NavItem {
  path:    string
  label:   string
  iosIcon: string
  mdIcon:  string
  roles?:  string[]
}

const navItems: NavItem[] = [
  { path: '/dashboard',     label: 'Dashboard',     iosIcon: homeOutline,          mdIcon: homeSharp },
  { path: '/tasks',         label: 'All Tasks',      iosIcon: clipboardOutline,     mdIcon: clipboardSharp },
  { path: '/my-tasks',      label: 'My Tasks',       iosIcon: checkboxOutline,      mdIcon: checkboxSharp },
  { path: '/projects',      label: 'Projects',       iosIcon: folderOpenOutline,    mdIcon: folderOpenSharp },
  { path: '/notifications', label: 'Notifications',  iosIcon: notificationsOutline, mdIcon: notificationsSharp },
  { path: '/reports',       label: 'Reports',        iosIcon: barChartOutline,      mdIcon: barChartSharp },
  { path: '/profile',       label: 'Profile',        iosIcon: personOutline,        mdIcon: personSharp },
  { path: '/admin',         label: 'Admin',          iosIcon: peopleOutline,        mdIcon: peopleSharp, roles: ['admin', 'manager'] },
  { path: '/settings',      label: 'Settings',       iosIcon: settingsOutline,      mdIcon: settingsSharp },
]

interface AppMenuProps { onLogout: () => void }

export const AppMenu: React.FC<AppMenuProps> = ({ onLogout }) => {
  const location        = useLocation()
  const history         = useHistory()
  const { user }        = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { isDark, toggle } = useThemeStore()
  const [presentToast]  = useIonToast()

  const filteredItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  )

  const workspaceItems = filteredItems.filter(item =>
    ['/dashboard', '/tasks', '/projects', '/reports'].includes(item.path)
  )
  const personalItems = filteredItems.filter(item =>
    ['/my-tasks', '/notifications'].includes(item.path)
  )
  const managementItems = filteredItems.filter(item =>
    ['/admin'].includes(item.path)
  )
  const settingsItems = filteredItems.filter(item =>
    ['/profile', '/settings'].includes(item.path)
  )

  const renderItem = (item: NavItem) => {
    const isActive = location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
    const badge = item.path === '/notifications' ? unreadCount : 0

    return (
      <IonMenuToggle key={item.path} autoHide={false}>
        <div className="relative px-2">
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-0.75 bg-indigo-600 dark:bg-indigo-400 rounded-r z-20" />
          )}
          <IonItem
            routerLink={item.path}
            routerDirection="none"
            detail={false}
            lines="none"
            className={`rounded-lg mb-0.5 transition-all ${
              isActive
                ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-50 font-bold'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/30 text-zinc-650 dark:text-zinc-400 font-semibold'
            }`}
            style={{
              '--background': 'transparent',
              '--color': 'inherit',
              '--border-radius': '0.5rem',
              '--min-height': '34px',
              '--padding-start': '8px',
              '--padding-end': '8px',
              '--inner-padding-end': '0',
            } as any}
          >
            <IonIcon
              slot="start"
              ios={item.iosIcon}
              md={item.mdIcon}
              style={{ fontSize: '15px', marginRight: '10px' }}
              className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}
            />
            <IonLabel className="text-xs">
              {item.label}
            </IonLabel>
            {badge > 0 && (
              <IonBadge
                color="danger"
                slot="end"
                style={{
                  fontSize: '9px',
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                {badge > 9 ? '9+' : badge}
              </IonBadge>
            )}
          </IonItem>
        </div>
      </IonMenuToggle>
    )
  }

  return (
    <IonMenu
      contentId="main-content"
      type="overlay"
      swipeGesture
      style={{
        '--width': '240px',
        '--border': 'none',
        '--background': 'var(--ion-background-color)',
      } as any}
    >
      {/* Workspace Switcher Header */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--ion-background-color)', '--border-style': 'none' } as any}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-150 dark:border-zinc-800/80 bg-white dark:bg-[#09090b]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/10">
                <span className="text-white font-black text-sm">W</span>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none tracking-tight">WorkStream Pro</p>
                <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1.5 uppercase tracking-wider leading-none">Enterprise Edition</p>
              </div>
            </div>
            {/* Subtle workspace drop down arrow mockup to make it look like enterprise SaaS */}
            <div className="w-5 h-5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/60 flex items-center justify-center text-zinc-400 cursor-pointer transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .55.24l3.25 3.5a.75.75 0 1 1-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 0 1-1.1-1.02l3.25-3.5A.75.75 0 0 1 10 3zm-3.76 9.2a.75.75 0 0 1 1.06.04l2.7 2.908 2.7-2.908a.75.75 0 1 1 1.1 1.02l-3.25 3.5a.75.75 0 0 1-1.1 0l-3.25-3.5a.75.75 0 0 1 .04-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* Scrollable Navigation Area */}
      <IonContent style={{ '--background': 'var(--ion-background-color)' } as any} className="bg-white dark:bg-[#09090b]">
        <div className="py-4 px-2 space-y-5.5 bg-white dark:bg-[#09090b] min-h-full">
          {/* Workspace Group */}
          {workspaceItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Workspace</p>
              {workspaceItems.map(renderItem)}
            </div>
          )}

          {/* Personal Group */}
          {personalItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Personal</p>
              {personalItems.map(renderItem)}
            </div>
          )}

          {/* Management Group */}
          {managementItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Management</p>
              {managementItems.map(renderItem)}
            </div>
          )}

          {/* System Settings Group */}
          {settingsItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Settings</p>
              {settingsItems.map(renderItem)}
            </div>
          )}

          {/* Quick Action Button */}
          <div className="px-4 pt-2">
            <button
              onClick={() => {
                presentToast({
                  message: 'Quick action: select a project to assign tasks.',
                  duration: 2500,
                  color: 'primary',
                  position: 'bottom',
                })
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-750 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-all duration-150 shadow-sm shadow-indigo-650/15"
            >
              <IonIcon icon={addOutline} style={{ fontSize: '15px' }} />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </IonContent>

      {/* Sticky Footer */}
      <IonFooter className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--ion-background-color)', '--border-style': 'none' } as any}>
          <div className="border-t border-zinc-150 dark:border-zinc-800/80 bg-white dark:bg-[#09090b]">
            {/* User Profile Info Card */}
            {user && (
              <div className="px-3.5 pt-3.5 pb-2.5">
                <div
                  onClick={() => history.push('/profile')}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150/40 dark:border-zinc-800/30 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors group"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover bg-zinc-200/60 border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-850 dark:text-zinc-250 truncate leading-none group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate capitalize mt-1.5 leading-none">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Toggler & Logout */}
            <div className="px-4.5 pb-4.5 pt-1 flex items-center justify-between">
              {/* Light/Dark Toggle */}
              <button
                onClick={toggle}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-550 dark:text-zinc-450 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors"
              >
                <IonIcon icon={isDark ? sunnyOutline : moonOutline} style={{ fontSize: '15px' }} />
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>

              {/* Logout Trigger */}
              <IonMenuToggle>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-405 dark:hover:text-rose-350 transition-colors"
                >
                  <IonIcon icon={logOutOutline} style={{ fontSize: '15px' }} />
                  <span>Logout</span>
                </button>
              </IonMenuToggle>
            </div>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  )
}

