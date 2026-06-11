import React, { useEffect, useState } from 'react'
import { IonApp, IonRouterOutlet, IonSplitPane, useIonToast } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect, Switch } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AppMenu } from './layouts/AppMenu'
import { PrivateRoute } from './routes/PrivateRoute'
import { PageLoader } from './components/LoadingState'
import { DailyWorkSubmissionModal } from './components/DailyWorkSubmissionModal'
import { ConfirmDialog } from './components/ConfirmDialog'

import { LoginPage }           from './pages/auth/LoginPage'
import { ForgotPasswordPage }  from './pages/auth/ForgotPasswordPage'
import { DashboardPage }       from './pages/dashboard/DashboardPage'
import { TaskListPage }        from './pages/tasks/TaskListPage'
import { TaskDetailPage }      from './pages/tasks/TaskDetailPage'
import { MyTasksPage }         from './pages/tasks/MyTasksPage'
import { ProjectsPage }        from './pages/projects/ProjectsPage'
import { ProjectDetailPage }   from './pages/projects/ProjectDetailPage'
import { NotificationsPage }   from './pages/notifications/NotificationsPage'
import { ReportsPage }         from './pages/reports/ReportsPage'
import { ProfilePage }         from './pages/profile/ProfilePage'
import { AdminPage }           from './pages/admin/AdminPage'
import { SettingsPage }        from './pages/settings/SettingsPage'

import { useAuthStore, useThemeStore, useTaskStore } from './store'
import { AppManager } from './capacitor/AppManager'
import { syncService } from './services/SyncService'
import { pushNotificationService } from './services/PushNotificationService'
import { InstallPrompt } from './components/InstallPrompt'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const AppInner: React.FC = () => {
  const { initialize, isAuthenticated, user, logout } = useAuthStore()
  const { isDark, setDark } = useThemeStore()
  const { tasks } = useTaskStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [showDailyModal, setShowDailyModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [presentToast] = useIonToast()

  useEffect(() => {
    const boot = async () => {
      // Initialize app manager (back button, status bar, etc.)
      await AppManager.initialize()
      AppManager.setStatusBarColor(isDark ? '#1e293b' : '#ffffff', isDark)

      // Initialize auth from storage
      await initialize()

      // Apply saved theme (themeStore already loaded the value from storage on init)
      setDark(isDark)

      // Initialize sync service
      await syncService.initialize()
      syncService.startAutoSync()

      setIsInitialized(true)
    }
    boot()

    return () => syncService.stopAutoSync()
  }, [])

  // Initialize push notifications when user logs in
  useEffect(() => {
    if (user) {
      pushNotificationService.initialize(user.id)
    }
    return () => pushNotificationService.cleanup()
  }, [user?.id])

  // Apply theme changes
  useEffect(() => {
    AppManager.setStatusBarColor(isDark ? '#1e293b' : '#ffffff', isDark)
  }, [isDark])

  // Offline/online indicator
  useEffect(() => {
    const handleOnline = () =>
      presentToast({ message: 'Back online — syncing...', duration: 2000, color: 'success', position: 'top' })
    const handleOffline = () =>
      presentToast({ message: 'You are offline. Changes will sync when reconnected.', duration: 3000, color: 'warning', position: 'top' })
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    setShowDailyModal(true)
  }

  if (!isInitialized) return <PageLoader />

  const completedTaskIds = tasks.filter(t => t.status === 'completed' || t.status === 'approved').map(t => t.id)
  const pendingTaskIds   = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').map(t => t.id)

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main-content" when="lg" disabled={!isAuthenticated}>
          {isAuthenticated && <AppMenu onLogout={handleLogout} />}

          <IonRouterOutlet id="main-content" animated>
            {/* Public routes */}
            <Route exact path="/login"            component={LoginPage} />
            <Route exact path="/forgot-password"  component={ForgotPasswordPage} />

            {/* Protected routes */}
            <PrivateRoute exact path="/dashboard"         component={DashboardPage} />
            <PrivateRoute exact path="/tasks"             component={TaskListPage} />
            <PrivateRoute       path="/tasks/:id"         component={TaskDetailPage} />
            <PrivateRoute exact path="/my-tasks"          component={MyTasksPage} />
            <PrivateRoute exact path="/projects"          component={ProjectsPage} />
            <PrivateRoute       path="/projects/:projectId" component={ProjectDetailPage} />
            <PrivateRoute exact path="/notifications"     component={NotificationsPage} />
            <PrivateRoute exact path="/reports"           component={ReportsPage} />
            <PrivateRoute exact path="/profile"           component={ProfilePage} />
            <PrivateRoute exact path="/settings"          component={SettingsPage} />
            <PrivateRoute exact path="/admin"             component={AdminPage} roles={['admin', 'manager']} />

            {/* Default */}
            <Route exact path="/" render={() => <Redirect to={isAuthenticated ? '/dashboard' : '/login'} />} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>

      <InstallPrompt />
      <DailyWorkSubmissionModal
        isOpen={showDailyModal}
        completedTaskIds={completedTaskIds}
        pendingTaskIds={pendingTaskIds}
        onClose={() => setShowDailyModal(false)}
        onSubmitted={async () => {
          setShowDailyModal(false)
          await logout()
        }}
      />
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of WorkStream Pro?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </IonApp>
  )
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppInner />
  </QueryClientProvider>
)

export default App
