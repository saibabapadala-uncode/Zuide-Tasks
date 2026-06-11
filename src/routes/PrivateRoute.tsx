import React from 'react'
import { Route, Redirect, RouteProps } from 'react-router-dom'
import { useAuthStore } from '@/store'

interface PrivateRouteProps extends RouteProps {
  roles?: string[]
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles, ...rest }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Redirect to="/dashboard" />
  }

  return <Route {...rest} />
}
