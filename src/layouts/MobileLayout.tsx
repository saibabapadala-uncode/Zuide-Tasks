import React from 'react'
import { AppHeader } from './AppHeader'

interface MobileLayoutProps {
  title: string
  endSlot?: React.ReactNode
  showNotifications?: boolean
  showThemeToggle?: boolean
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  title,
  endSlot,
  showNotifications = true,
  showThemeToggle = true,
}) => {
  return (
    <AppHeader
      title={title}
      showNotifications={showNotifications}
      showThemeToggle={showThemeToggle}
      endSlot={endSlot}
    />
  )
}


