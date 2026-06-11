import { AppManager } from '@/capacitor/AppManager'
import { offlineQueueService } from './OfflineQueueService'
import { taskService } from './TaskService'

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

type StatusListener = (status: SyncStatus, pendingCount: number) => void

class SyncService {
  private status: SyncStatus = 'idle'
  private listeners: StatusListener[] = []
  private syncInterval: ReturnType<typeof setInterval> | null = null

  async initialize(): Promise<void> {
    await offlineQueueService.initialize()

    // Listen for network changes
    window.addEventListener('online', () => this.sync())
    window.addEventListener('offline', () => this.setStatus('offline'))

    // Initial status
    const online = await AppManager.isOnline()
    if (!online) this.setStatus('offline')
  }

  /** Start automatic background sync every 30 seconds */
  startAutoSync(intervalMs = 30_000): void {
    if (this.syncInterval) return
    this.syncInterval = setInterval(() => this.sync(), intervalMs)
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /** Manually trigger a sync */
  async sync(): Promise<void> {
    const online = await AppManager.isOnline()
    if (!online) {
      this.setStatus('offline')
      return
    }

    const pending = offlineQueueService.getPendingCount()
    if (pending === 0) {
      this.setStatus('idle')
      return
    }

    this.setStatus('syncing')

    try {
      await offlineQueueService.processQueue({
        UPDATE_TASK_STATUS: async payload => {
          await taskService.updateTaskStatus(payload.taskId, payload.status, payload.comment)
        },
        ADD_COMMENT: async payload => {
          await taskService.addComment(
            payload.taskId, payload.content,
            payload.authorId, payload.authorName, payload.authorAvatar
          )
        },
        UPDATE_PROGRESS: async payload => {
          await taskService.updateTaskProgress(payload.taskId, payload.progress)
        },
        SUBMIT_DAILY_WORK: async payload => {
          await taskService.submitDailyWork(payload)
        },
      })
      this.setStatus('idle')
    } catch {
      this.setStatus('error')
    }
  }

  getStatus(): SyncStatus {
    return this.status
  }

  getPendingCount(): number {
    return offlineQueueService.getPendingCount()
  }

  addListener(listener: StatusListener): () => void {
    this.listeners.push(listener)
    return () => { this.listeners = this.listeners.filter(l => l !== listener) }
  }

  private setStatus(status: SyncStatus): void {
    this.status = status
    this.listeners.forEach(l => l(status, this.getPendingCount()))
  }
}

export const syncService = new SyncService()
