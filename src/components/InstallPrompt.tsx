import React, { useEffect, useState } from 'react'

let deferredPrompt: any = null

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pwa-install-dismissed')
    if (stored) return

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      setShowPrompt(true)
    }
    const handleInstalled = () => {
      setShowPrompt(false)
      deferredPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    if (outcome === 'accepted') setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  if (!showPrompt || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <div className="max-w-sm mx-auto pointer-events-auto">
        <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
            <span className="text-white font-extrabold text-base">Z</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Install Zuide Tasks</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Add to your home screen for quick access</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
