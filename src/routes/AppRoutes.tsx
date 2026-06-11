import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { TaskListPage } from '@/pages/tasks/TaskListPage'
import { TaskDetailPage } from '@/pages/tasks/TaskDetailPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { AdminPage } from '@/pages/admin/AdminPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'

export const AppRoutes: React.FC = () => (
  <Switch>
    {/* Public routes */}
    <Route exact path="/login" component={LoginPage} />
    <Route exact path="/forgot-password" component={ForgotPasswordPage} />

    {/* Protected routes */}
    <PrivateRoute exact path="/dashboard" component={DashboardPage} />
    <PrivateRoute exact path="/tasks" component={TaskListPage} />
    <PrivateRoute exact path="/tasks/:id" component={TaskDetailPage} />
    <PrivateRoute exact path="/projects" component={ProjectsPage} />
    <PrivateRoute exact path="/notifications" component={NotificationsPage} />
    <PrivateRoute exact path="/reports" component={ReportsPage} />
    <PrivateRoute exact path="/profile" component={ProfilePage} />
    <PrivateRoute exact path="/settings" component={SettingsPage} />
    <PrivateRoute
      exact path="/admin"
      component={AdminPage}
      roles={['admin', 'manager']}
    />

    {/* Default redirects */}
    <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
    <Route render={() => <Redirect to="/dashboard" />} />
  </Switch>
)
