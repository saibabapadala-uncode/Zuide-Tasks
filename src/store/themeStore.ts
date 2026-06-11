import { create } from 'zustand'
import { StorageManager, STORAGE_KEYS } from '@/capacitor/StorageManager'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
  setDark: (dark: boolean) => void
}

const applyTheme = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
  }
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

const getInitialTheme = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME)
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: getInitialTheme(),

  toggle: () =>
    set(state => {
      const next = !state.isDark
      StorageManager.set(STORAGE_KEYS.THEME, next ? 'dark' : 'light')
      applyTheme(next)
      return { isDark: next }
    }),

  setDark: (dark: boolean) => {
    StorageManager.set(STORAGE_KEYS.THEME, dark ? 'dark' : 'light')
    applyTheme(dark)
    set({ isDark: dark })
  },
}))
