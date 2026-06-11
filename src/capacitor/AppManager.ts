/**
 * AppManager — wraps @capacitor/app, @capacitor/status-bar, @capacitor/splash-screen,
 * and @capacitor/network for app lifecycle, UI chrome, and connectivity.
 *
 * Status bar and splash screen calls are no-ops on web — they're guarded by
 * Capacitor.isNativePlatform() so the browser never sees them.
 */

import { Capacitor } from '@capacitor/core'
import { App, type AppInfo }      from '@capacitor/app'
import { StatusBar, Style }       from '@capacitor/status-bar'
import { SplashScreen }           from '@capacitor/splash-screen'
import { Network }                from '@capacitor/network'

export interface AppState {
  isActive: boolean
}

export interface AppUrlOpen {
  url: string
}

type BackButtonCallback  = () => void | boolean
type StateChangeCallback = (state: AppState) => void

class AppManagerClass {
  private backButtonHandlers: BackButtonCallback[]  = []
  private stateListeners:     StateChangeCallback[] = []
  private isInitialized = false

  // ── Boot ─────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    this.isInitialized = true

    if (Capacitor.isNativePlatform()) {
      // Hardware back button (Android)
      App.addListener('backButton', ({ canGoBack }) => {
        this.handleBackButton(canGoBack)
      })

      // App foreground / background state
      App.addListener('appStateChange', ({ isActive }) => {
        this.stateListeners.forEach(l => l({ isActive }))
      })

      // Hide splash screen after the web layer has mounted
      await SplashScreen.hide({ fadeOutDuration: 300 })
    } else {
      // Web fallbacks
      document.addEventListener('visibilitychange', () => {
        const isActive = !document.hidden
        this.stateListeners.forEach(l => l({ isActive }))
      })
      window.addEventListener('popstate', () => {
        this.handleBackButton(window.history.length > 1)
      })
    }
  }

  // ── Status bar ───────────────────────────────────────────────────

  async setStatusBarColor(color: string, isDark = false): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setBackgroundColor({ color })
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
      return
    }
    // Web: update <meta name="theme-color">
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) meta.content = color
  }

  async showStatusBar(): Promise<void> {
    if (Capacitor.isNativePlatform()) await StatusBar.show()
  }

  async hideStatusBar(): Promise<void> {
    if (Capacitor.isNativePlatform()) await StatusBar.hide()
  }

  // ── Splash screen ────────────────────────────────────────────────

  async hideSplashScreen(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await SplashScreen.hide({ fadeOutDuration: 300 })
    }
  }

  async showSplashScreen(duration = 2000): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await SplashScreen.show({ showDuration: duration, autoHide: true })
    }
  }

  // ── Back button ──────────────────────────────────────────────────

  addBackButtonListener(callback: BackButtonCallback): () => void {
    this.backButtonHandlers.push(callback)
    return () => {
      this.backButtonHandlers = this.backButtonHandlers.filter(h => h !== callback)
    }
  }

  // ── App state ────────────────────────────────────────────────────

  addStateChangeListener(callback: StateChangeCallback): () => void {
    this.stateListeners.push(callback)
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== callback)
    }
  }

  // ── Exit app ─────────────────────────────────────────────────────

  async exitApp(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await App.exitApp()
      return
    }
    if (window.confirm('Exit Zuide Tasks?')) window.close()
  }

  // ── Network ──────────────────────────────────────────────────────

  async isOnline(): Promise<boolean> {
    try {
      const { connected } = await Network.getStatus()
      return connected
    } catch {
      return navigator.onLine
    }
  }

  addNetworkListener(callback: (online: boolean) => void): () => void {
    const handle = Network.addListener('networkStatusChange', ({ connected }) => {
      callback(connected)
    })
    return () => { handle.then(l => l.remove()) }
  }

  // ── App info ─────────────────────────────────────────────────────

  async getAppInfo(): Promise<AppInfo | { id: string; name: string; build: string; version: string }> {
    if (Capacitor.isNativePlatform()) {
      return await App.getInfo()
    }
    return { id: 'com.zuide.tasks', name: 'Zuide Tasks', build: '20260611', version: '1.0.0' }
  }

  // ── Private ──────────────────────────────────────────────────────

  private handleBackButton(canGoBack: boolean): void {
    for (const handler of [...this.backButtonHandlers].reverse()) {
      const result = handler()
      if (result !== false) return
    }
    if (!canGoBack) {
      this.exitApp()
    } else {
      window.history.back()
    }
  }
}

export const AppManager = new AppManagerClass()
