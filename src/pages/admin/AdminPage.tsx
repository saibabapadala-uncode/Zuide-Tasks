import React, { useEffect, useState } from 'react'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  useIonToast,
} from '@ionic/react'
import { motion } from 'framer-motion'
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
      <IonHeader className="border-b border-zinc-200/50 dark:border-zinc-800/80">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton className="text-zinc-550 dark:text-zinc-400" />
          </IonButtons>
          <IonTitle>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Admin Panel</span>
          </IonTitle>
        </IonToolbar>

        {/* Tab Selection */}
        <IonToolbar style={{ '--min-height': '40px' } as any} className="bg-white dark:bg-[#09090b]">
          <div className="flex px-3 gap-2 overflow-x-auto no-scrollbar">
            {(['employees', 'approvals', 'broadcast'] as AdminTab[]).map(tab => {
              const active = activeTab === tab
              const label = tab.charAt(0).toUpperCase() + tab.slice(1)
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3 py-2 text-xs font-bold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {label}
                  {tab === 'approvals' && pendingApprovals.length > 0 && (
                    <span className="bg-rose-650 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white dark:border-[#09090b] shadow-sm animate-fade-in">
                      {pendingApprovals.length}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="activeAdminTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-zinc-55 dark:bg-[#09090b] min-h-full pb-6 max-w-3xl mx-auto">
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
            {[
              { label: 'Total Employees',   value: employees.length,                                                                                  textColor: 'text-indigo-650 dark:text-indigo-400' },
              { label: 'Pending Approvals', value: pendingApprovals.length,                                                                           textColor: 'text-amber-600 dark:text-amber-450' },
              { label: 'Active Tasks',      value: tasks.filter(t => t.status === 'in_progress').length,                                              textColor: 'text-cyan-600 dark:text-cyan-400' },
              { label: 'Completed Today',   value: tasks.filter(t => t.status === 'completed' && t.completedDate?.startsWith(new Date().toISOString().split('T')[0])).length, textColor: 'text-emerald-600 dark:text-emerald-450' },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-sm">
                <p className={`text-2xl font-black ${stat.textColor} leading-none`}>{stat.value}</p>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="p-4"><LoadingState /></div>
          ) : (
            <div className="px-4">
              {/* Employees tab */}
              {activeTab === 'employees' && (
                <motion.div key="employees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {employees.map(emp => (
                    <div key={emp.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-4 hover:border-zinc-350 dark:hover:border-zinc-750 transition-colors duration-150">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                          <img
                            src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                            alt={emp.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 truncate tracking-tight">{emp.name}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold capitalize flex-shrink-0 border ${
                              emp.role === 'admin'
                                ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-955/20 dark:border-rose-900/30 dark:text-rose-450'
                                : emp.role === 'manager'
                                ? 'bg-violet-50 border-violet-100 text-violet-750 dark:bg-violet-955/20 dark:border-violet-900/30 dark:text-violet-400'
                                : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-955/20 dark:border-blue-900/30 dark:text-blue-405'
                            }`}>{emp.role}</span>
                          </div>
                          <p className="text-xs text-zinc-405 dark:text-zinc-550 font-medium mt-0.5">{emp.designation} • {emp.department}</p>
                          <p className="text-[10px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">{emp.employeeId}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            emp.isActive
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                              : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-455'
                          }`}>
                            {emp.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400">{emp.productivityScore}% Productivity</span>
                        </div>
                      </div>

                      {/* Productivity bar */}
                      <div className="mt-3.5">
                        <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${emp.productivityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Approvals tab */}
              {activeTab === 'approvals' && (
                <motion.div key="approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {pendingApprovals.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-6 text-center text-zinc-400 dark:text-zinc-550 font-medium">
                      No pending approvals 🎉
                    </div>
                  ) : (
                    pendingApprovals.map(task => (
                      <div key={task.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 animate-fade-in">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-550">{task.taskId}</span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 tracking-tight leading-tight mb-1">{task.title}</h4>
                        <p className="text-xs text-zinc-550 dark:text-zinc-400 font-medium mb-4">{task.projectName} • <span className="font-bold text-zinc-700 dark:text-zinc-300">{task.assignedToName}</span></p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApproval(task.id, 'approve')}
                            className="flex-1 text-xs font-bold py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all duration-150"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(task.id, 'reject')}
                            className="flex-1 text-xs font-bold py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all duration-150"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Broadcast tab */}
              {activeTab === 'broadcast' && (
                <motion.div key="broadcast" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                    <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mb-4">Broadcast Announcement</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Title</label>
                        <input
                          type="text"
                          value={broadcastTitle}
                          onChange={e => setBroadcastTitle(e.target.value)}
                          placeholder="Announcement title"
                          className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all duration-150"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Message</label>
                        <textarea
                          value={broadcastMessage}
                          onChange={e => setBroadcastMessage(e.target.value)}
                          placeholder="Write your announcement here..."
                          rows={5}
                          className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all duration-150 resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">→ Sending to {employees.length} employees</p>
                        <button
                          onClick={handleBroadcast}
                          disabled={isSending || !broadcastTitle.trim() || !broadcastMessage.trim()}
                          className="text-xs font-bold py-2.5 px-5 bg-indigo-600 hover:bg-indigo-705 text-white rounded-lg shadow-sm disabled:opacity-50 transition-all duration-150"
                        >
                          {isSending ? 'Sending...' : 'Send Announcement'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
