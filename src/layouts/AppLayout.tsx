/**
 * AppLayout — thin wrapper that simply renders children.
 * Pages own their IonPage/IonContent/IonHeader structure directly,
 * following Ionic's architecture requirement.
 *
 * This file is kept for import compatibility.
 */
import React from 'react'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => <>{children}</>

export { AppLayout }
export default AppLayout
