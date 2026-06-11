/**
 * DesktopLayout — used on ≥lg breakpoints via IonSplitPane.
 * The AppMenu is already always-visible in IonSplitPane; this is a placeholder
 * for desktop-specific layout wrappers like breadcrumbs or sub-nav.
 */
import React from 'react'

interface DesktopLayoutProps {
  children: React.ReactNode
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => (
  <>{children}</>
)

export default DesktopLayout
