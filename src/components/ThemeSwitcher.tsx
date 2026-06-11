import React from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useThemeStore } from '@/store'

interface ThemeSwitcherProps {
  size?: 'sm' | 'md'
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ size = 'md' }) => {
  const { isDark, toggle } = useThemeStore()
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btnSize = size === 'sm' ? 'p-1.5' : 'p-2'

  return (
    <button
      onClick={toggle}
      className={`${btnSize} rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className={iconSize} />
      ) : (
        <MoonIcon className={iconSize} />
      )}
    </button>
  )
}
