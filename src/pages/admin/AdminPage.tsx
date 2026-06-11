import React, { useEffect, useState } from 'react'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonSegment, IonSegmentButton, IonLabel, IonBadge,
  IonList, IonItem, IonAvatar, IonCard, IonCardContent,
  useIonToast,
} from '@ionic/react'
import { motion } from 'framer-motion'
import { MobileLayout } from '@/layouts/MobileLayout'
import { PriorityBadge } from '@/components/StatusBadge'
import { LoadingState } from '@/components/LoadingState'
import { useAuthStore, useTaskStore } from '@/store'
import { employeeService, notificationService, taskService } from '@/services'
import { Employee } from '@/types'

type AdminTab = 'employees' | 'approvals' | 'broadcast'

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore()
  const { tasks, fetchTasks } = useTaskStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('employees')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [presentToast] = useIonToast()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [emps] = await Promise.all([
        employeeService.getEmployees(),
        fetchTasks(),
      ])
      setEmployees(emps)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleRefresh = (ev: any) => {
    loadData().finally(() => ev.detail.complete())
  }

  const pendingApprovals = tasks.filter(t => t.status === 'submitted')

  const handleApproval = async (taskId: string, action: 'approve' | 'reject') => {
    try {
      await taskService.updateTaskStatus(taskId, (action === 'approve' ? 'approved' : 'rejected') as any, `${action}d by ${user?.name}`)
      await fetchTasks()
      presentToast({ message: `Task ${action}d successfully`, duration: 2000, color: action === 'approve' ? 'success' : 'danger', position: 'bottom' })
    } catch {
      presentToast({ message: 'Failed to process approval', duration: 2000, color: 'danger', position: 'bottom' })
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      presentToast({ message: 'Please fill in both title and message', duration: 2000, color: 'warning', position: 'bottom' })
      return
    }
    setIsSending(true)
    try {
      const recipientIds = employees.map(e => e.id)
      await notificationService.broadcastAnnouncement(broadcastTitle, broadcastMessage, recipientIds, user!.id, user!.name)
      presentToast({ message: `Announcement sent to ${employees.length} employees`, duration: 2500, color: 'success', position: 'bottom' })
      setBroadcastTitle('')
      setBroadcastMessage('')
    } catch {
      presentToast({ message: 'Failed to send announcement', duration: 2000, color: 'danger', position: 'bottom' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <IonPage>
      <MobileLayout title="Admin Panel" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-gray-50 dark:bg-gray-900 min-h-full pb-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 p-4">
            {[
              { label: 'Total Employees',   value: employees.length,                                                                                  color: 'from-primary-500 to-primary-600' },
              { label: 'Pending Approvals', value: pendingApprovals.length,                                                                           color: 'from-yellow-500 to-yellow-600' },
              { label: 'Active Tasks',      value: tasks.filter(t => t.status === 'in_progress').length,                                              color: 'from-blue-500 to-blue-600' },
              { label: 'Completed Today',   value: tasks.filter(t => t.status === 'completed' && t.completedDate?.startsWith(new Date().toISOString().split('T')[0])).length, color: 'from-green-500 to-green-600' },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white`}>
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-xs text-white/80 mt-1 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="px-4 mb-4">
            <IonSegment value={activeTab} onIonChange={ev => setActiveTab(ev.detail.value as AdminTab)}>
              <IonSegmentButton value="employees">
                <IonLabel>
                  Employees
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="approvals">
                <IonLabel>
                  Approvals
                  {pendingApprovals.length > 0 && (
                    <IonBadge color="danger" style={{ marginLeft: 4, fontSize: '10px' }}>
                      {pendingApprovals.length}
                    </IonBadge>
                  )}
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="broadcast">
                <IonLabel>Broadcast</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          {isLoading ? (
            <div className="p-4"><LoadingState /></div>
          ) : (
            <div className="px-4">
              {/* Employees tab */}
              {activeTab === 'employees' && (
                <motion.div key="employees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {employees.map(emp => (
                    <IonCard key={emp.id} className="m-0">
                      <IonCardContent>
                        <div className="flex items-center gap-3">
                          <IonAvatar style={{ width: 44, height: 44, flexShrink: 0 }}>
                            <img
                              src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                              alt={emp.name}
                            />
                          </IonAvatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{emp.name}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${
                                emp.role === 'admin' ? 'bg-red-100 text-red-700' :
                                emp.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{emp.role}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{emp.designation} • {emp.department}</p>
                            <p className="text-xs font-mono text-gray-400">{emp.employeeId}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {emp.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs font-semibold text-primary-600">{emp.productivityScore}%</span>
                          </div>
                        </div>

                        {/* Productivity bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 rounded-full"
                              style={{ width: `${emp.productivityScore}%` }}
                            />
                          </div>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </motion.div>
              )}

              {/* Approvals tab */}
              {activeTab === 'approvals' && (
                <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {pendingApprovals.length === 0 ? (
                    <IonCard className="m-0">
                      <IonCardContent className="text-center py-8 text-gray-500">
                        No pending approvals 🎉
                      </IonCardContent>
                    </IonCard>
                  ) : (
                    pendingApprovals.map(task => (
                      <IonCard key={task.id} className="m-0">
                        <IonCardContent>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-gray-400">{task.taskId}</span>
                            <PriorityBadge priority={task.priority} />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{task.title}</h4>
                          <p className="text-xs text-gray-500 mb-3">{task.projectName} • {task.assignedToName}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproval(task.id, 'approve')}
                              className="flex-1 text-sm font-medium py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(task.id, 'reject')}
                              className="flex-1 text-sm font-medium py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                              Reject
                            </button>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    ))
                  )}
                </motion.div>
              )}

              {/* Broadcast tab */}
              {activeTab === 'broadcast' && (
                <motion.div key="broadcast" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <IonCard className="m-0">
                    <IonCardContent>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Broadcast Announcement</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Title</label>
                          <input
                            type="text"
                            value={broadcastTitle}
                            onChange={e => setBroadcastTitle(e.target.value)}
                            placeholder="Announcement title"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Message</label>
                          <textarea
                            value={broadcastMessage}
                            onChange={e => setBroadcastMessage(e.target.value)}
                            placeholder="Write your announcement here..."
                            rows={5}
                            className="input-field resize-none"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">→ {employees.length} employees</p>
                          <button
                            onClick={handleBroadcast}
                            disabled={isSending || !broadcastTitle.trim() || !broadcastMessage.trim()}
                            className="btn-primary text-sm disabled:opacity-60"
                          >
                            {isSending ? 'Sending...' : 'Send Announcement'}
                          </button>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
