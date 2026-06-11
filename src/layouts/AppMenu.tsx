import React from 'react'
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonLabel, IonIcon, IonMenuToggle, IonAvatar, IonBadge,
  IonFooter, IonButton, IonNote, IonListHeader,
} from '@ionic/react'
import { useLocation } from 'react-router-dom'
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
  logOutOutline, logOutSharp,
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
  { path: '/dashboard',     label: 'Dashboard',      iosIcon: homeOutline,          mdIcon: homeSharp },
  { path: '/tasks',         label: 'All Tasks',       iosIcon: clipboardOutline,     mdIcon: clipboardSharp },
  { path: '/my-tasks',      label: 'My Tasks',        iosIcon: checkboxOutline,      mdIcon: checkboxSharp },
  { path: '/projects',      label: 'Projects',        iosIcon: folderOpenOutline,    mdIcon: folderOpenSharp },
  { path: '/notifications', label: 'Notifications',   iosIcon: notificationsOutline, mdIcon: notificationsSharp },
  { path: '/reports',       label: 'Reports',         iosIcon: barChartOutline,      mdIcon: barChartSharp },
  { path: '/profile',       label: 'My Profile',      iosIcon: personOutline,        mdIcon: personSharp },
  { path: '/admin',         label: 'Admin',           iosIcon: peopleOutline,        mdIcon: peopleSharp, roles: ['admin', 'manager'] },
  { path: '/settings',      label: 'Settings',        iosIcon: settingsOutline,      mdIcon: settingsSharp },
]

interface AppMenuProps {
  onLogout: () => void
}

export const AppMenu: React.FC<AppMenuProps> = ({ onLogout }) => {
  const location = useLocation()
  const { user } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { isDark, toggle } = useThemeStore()

  const filteredItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <IonMenu contentId="main-content" type="overlay" swipeGesture>
      {/* Branded header */}
      <IonHeader>
        <IonToolbar color="primary">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-base">Z</span>
            </div>
            <div>
              <IonTitle className="text-white font-bold text-base p-0">Zuide Tasks</IonTitle>
              <p className="text-white/70 text-xs">Employee Platform</p>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* User info card */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <IonAvatar style={{ width: 44, height: 44 }}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                />
              </IonAvatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.designation}</p>
                <span className={`text-xs font-medium capitalize px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${
                  user.role === 'admin'   ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  user.role === 'manager' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>{user.role}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <IonList lines="none" className="px-2 py-2">
          <IonListHeader className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1 pt-2">
            Navigation
          </IonListHeader>

          {filteredItems.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            const badge = item.path === '/notifications' ? unreadCount : 0

            return (
              <IonMenuToggle key={item.path} autoHide={false}>
                <IonItem
                  routerLink={item.path}
                  routerDirection="none"
                  detail={false}
                  lines="none"
                  className={`rounded-xl mb-0.5 transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  style={{
                    '--background': 'transparent',
                    '--border-radius': '0.75rem',
                  } as any}
                >
                  <IonIcon
                    slot="start"
                    ios={item.iosIcon}
                    md={item.mdIcon}
                    className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}
                  />
                  <IonLabel className={`text-sm font-medium ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.label}
                  </IonLabel>
                  {badge > 0 && (
                    <IonBadge color="danger" slot="end">
                      {badge > 9 ? '9+' : badge}
                    </IonBadge>
                  )}
                </IonItem>
              </IonMenuToggle>
            )
          })}
        </IonList>
      </IonContent>

      {/* Footer: theme toggle + logout */}
      <IonFooter>
        <IonToolbar>
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={toggle}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <IonIcon icon={isDark ? sunnyOutline : moonOutline} className="text-lg" />
              <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <IonMenuToggle>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 dark:text-red-400 transition-colors"
              >
                <IonIcon icon={logOutOutline} className="text-lg" />
                <span>Logout</span>
              </button>
            </IonMenuToggle>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  )
}
