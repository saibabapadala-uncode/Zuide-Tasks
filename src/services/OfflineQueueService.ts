import { StorageManager, STORAGE_KEYS } from '@/capacitor/StorageManager'

export type OperationType = 'UPDATE_TASK_STATUS' | 'ADD_COMMENT' | 'UPDATE_PROGRESS' | 'SUBMIT_DAILY_WORK'

export interface QueuedOperation {
  id: string
  type: OperationType
  payload: Record<string, any>
  timestamp: string
  retries: number
  maxRetries: number
}

class OfflineQueueService {
  private queue: QueuedOperation[] = []
  private isProcessing = false

  async initialize(): Promise<void> {
    const stored = await StorageManager.getJSON<QueuedOperation[]>(STORAGE_KEYS.OFFLINE_Q)
    this.queue = stored || []
  }

  async enqueue(type: OperationType, payload: Record<string, any>): Promise<void> {
    const op: QueuedOperation = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3,
    }
    this.queue.push(op)
    await this.persist()
    console.info(`[OfflineQueue] Enqueued: ${type}`, payload)
  }

  async processQueue(executors: Partial<Record<OperationType, (payload: any) => Promise<void>>>): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return
    this.isProcessing = true

    const toProcess = [...this.queue]

    for (const op of toProcess) {
      const executor = executors[op.type]
      if (!executor) continue

      try {
        await executor(op.payload)
        this.queue = this.queue.filter(q => q.id !== op.id)
        console.info(`[OfflineQueue] Processed: ${op.type}`)
      } catch (err) {
        op.retries++
        if (op.retries >= op.maxRetries) {
          console.error(`[OfflineQueue] Max retries reached for ${op.type}, dropping`)
          this.queue = this.queue.filter(q => q.id !== op.id)
        } else {
          console.warn(`[OfflineQueue] Retry ${op.retries}/${op.maxRetries} for ${op.type}`)
        }
      }
    }

    await this.persist()
    this.isProcessing = false
  }

  getQueue(): QueuedOperation[] {
    return [...this.queue]
  }

  getPendingCount(): number {
    return this.queue.length
  }

  async clearQueue(): Promise<void> {
    this.queue = []
    await this.persist()
  }

  private async persist(): Promise<void> {
    await StorageManager.setJSON(STORAGE_KEYS.OFFLINE_Q, this.queue)
  }
}

export const offlineQueueService = new OfflineQueueService()
