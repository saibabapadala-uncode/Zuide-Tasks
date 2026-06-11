import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonBadge,
  IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardContent, IonProgressBar,
  IonAvatar, IonRefresher, IonRefresherContent,
} from '@ionic/react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { taskService } from '@/services'
import { Task } from '@/types'
import projectsData from '@/data/projects.json'
import employeesData from '@/data/employees.json'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

type ProjectTab = 'overview' | 'tasks' | 'team' | 'activity'

interface ActivityWithTask {
  id: string
  taskId: string
  taskTitle: string
  action: string
  description: string
  performedBy: string
  performedByName: string
  timestamp: string
  oldValue?: string
  newValue?: string
}

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const history = useHistory()
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview')
  const [tasks, setTasks]         = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const project     = (projectsData as any[]).find(p => p.id === projectId)
  const teamMembers = (employeesData as any[]).filter(e => project?.teamMembers?.includes(e.id))

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const t = await taskService.getTasks({ projectId })
      setTasks(t)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadTasks() }, [projectId])

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'approved').length
    return {
      total:      tasks.length,
      pending:    tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      submitted:  tasks.filter(t => t.status === 'submitted').length,
      completed,
      rejected:   tasks.filter(t => t.status === 'rejected').length,
      progress:   tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    }
  }, [tasks])

  const allActivity: ActivityWithTask[] = useMemo(() =>
    tasks
      .flatMap(t =>
        (t.activityHistory || []).map(a => ({
          ...a,
          taskId:    t.taskId,
          taskTitle: t.title,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 40),
    [tasks]
  )

  if (!project) return (
    <IonPage>
      <IonContent>
        <div className="p-4 text-center pt-16">
          <p className="text-gray-500 mb-4">Project not found.</p>
          <button onClick={() => history.push('/projects')} className="btn-primary">Back to Projects</button>
        </div>
      </IonContent>
    </IonPage>
  )

  const statusColor = project.status === 'completed' ? 'success'
    : project.priority === 'critical' ? 'danger' : 'primary'
  const statusLabel = project.status === 'completed' ? 'Completed'
    : project.status === 'in_progress' ? 'Active' : 'Planning'

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/projects" />
          </IonButtons>
          <IonTitle className="text-sm">{project.name}</IonTitle>
          <IonButtons slot="end">
            <IonBadge color={statusColor} style={{ marginRight: 12, fontSize: '11px' }}>
              {statusLabel}
            </IonBadge>
          </IonButtons>
        </IonToolbar>

        <IonToolbar>
          <IonSegment
            scrollable
            value={activeTab}
            onIonChange={ev => setActiveTab(ev.detail.value as ProjectTab)}
            style={{ '--background': 'transparent' }}
          >
            <IonSegmentButton value="overview" style={{ minWidth: 'auto' }}>
              <IonLabel>Overview</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="tasks" style={{ minWidth: 'auto' }}>
              <IonLabel>Tasks</IonLabel>
              <IonBadge color="medium" style={{ fontSize: '10px' }}>{stats.total}</IonBadge>
            </IonSegmentButton>
            <IonSegmentButton value="team" style={{ minWidth: 'auto' }}>
              <IonLabel>Team</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="activity" style={{ minWidth: 'auto' }}>
              <IonLabel>Activity</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={ev => loadTasks().finally(() => ev.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-gray-50 dark:bg-gray-900 min-h-full pb-8">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
              {/* Project header card */}
              <IonCard className="m-0 overflow-hidden">
                <div className="h-2 rounded-t-xl" style={{ backgroundColor: project.color }} />
                <IonCardContent>
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      📁
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">{project.name}</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {project.managerName} · {(project.tags || []).join(', ')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{project.description}</p>

                  {/* Progress bar */}
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm font-bold text-primary-600">{stats.progress}%</span>
                  </div>
                  <IonProgressBar
                    value={stats.progress / 100}
                    color="primary"
                    style={{ '--background': '#e2e8f0', borderRadius: 4, height: 8 } as any}
                  />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400">{stats.completed} completed</span>
                    <span className="text-xs text-gray-400">{stats.total} total tasks</span>
                  </div>
                </IonCardContent>
              </IonCard>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Pending',     value: stats.pending,    color: 'from-yellow-500 to-yellow-600' },
                  { label: 'In Progress', value: stats.inProgress, color: 'from-blue-500 to-blue-600' },
                  { label: 'Submitted',   value: stats.submitted,  color: 'from-purple-500 to-purple-600' },
                  { label: 'Completed',   value: stats.completed,  color: 'from-green-500 to-green-600' },
                  { label: 'Rejected',    value: stats.rejected,   color: 'from-red-500 to-red-600' },
                  { label: 'Members',     value: teamMembers.length, color: 'from-indigo-500 to-indigo-600' },
                ].map(s => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-3 text-white`}>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-xs text-white/80 mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Project details */}
              <IonCard className="m-0">
                <IonCardContent>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Details</h3>
                  {[
                    { label: 'Start Date', value: format(new Date(project.startDate), 'MMM dd, yyyy') },
                    { label: 'Due Date',   value: format(new Date(project.dueDate),   'MMM dd, yyyy') },
                    { label: 'Priority',   value: project.priority },
                    { label: 'Status',     value: project.status.replace('_', ' ') },
                    { label: 'Manager',    value: project.managerName },
                    { label: 'Team Size',  value: `${teamMembers.length} members` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.value}</span>
                    </div>
                  ))}
                </IonCardContent>
              </IonCard>
            </motion.div>
          )}

          {/* ── TASKS ── */}
          {activeTab === 'tasks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats row */}
              <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                {[
                  { label: 'Total',      value: stats.total,      color: 'text-gray-700 dark:text-gray-300' },
                  { label: 'Pending',    value: stats.pending,    color: 'text-yellow-600' },
                  { label: 'In Progress',value: stats.inProgress, color: 'text-blue-600' },
                  { label: 'Submitted',  value: stats.submitted,  color: 'text-purple-600' },
                  { label: 'Completed',  value: stats.completed,  color: 'text-green-600' },
                  { label: 'Rejected',   value: stats.rejected,   color: 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className="flex-shrink-0 text-center px-3">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {isLoading ? (
                <div className="p-4"><LoadingState /></div>
              ) : tasks.length === 0 ? (
                <div className="p-4">
                  <EmptyState title="No tasks" description="No tasks found for this project." icon={ClipboardDocumentListIcon} />
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="hidden sm:grid sm:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_80px_110px_80px] gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <span>Task</span>
                    <span>Assigned To</span>
                    <span>Priority</span>
                    <span>Status</span>
                    <span>Due Date</span>
                  </div>

                  {tasks.map((task, idx) => {
                    const isOverdue = new Date(task.dueDate) < new Date() &&
                      task.status !== 'completed' && task.status !== 'approved'
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                        onClick={() => history.push(`/tasks/${task.id}`)}
                        className="grid grid-cols-1 sm:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_80px_110px_80px] gap-1 sm:gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-gray-400">{task.taskId}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mt-0.5">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 sm:hidden">
                            <span className="text-xs text-gray-500">{task.assignedToName}</span>
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center">
                          <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{task.assignedToName}</span>
                        </div>
                        <div className="hidden sm:flex items-center">
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <div className="hidden sm:flex items-center">
                          <StatusBadge status={task.status} />
                        </div>
                        <div className="hidden sm:flex items-center">
                          <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {format(new Date(task.dueDate), 'MMM dd')}
                            {isOverdue && <span className="ml-1">!</span>}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </>
              )}
            </motion.div>
          )}

          {/* ── TEAM ── */}
          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-3">
              {teamMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No team members found.</div>
              ) : teamMembers.map((emp: any) => {
                const memberTasks  = tasks.filter(t => t.assignedTo === emp.id)
                const doneTasks    = memberTasks.filter(t => t.status === 'completed' || t.status === 'approved').length
                const activeTasks  = memberTasks.filter(t => t.status === 'in_progress').length
                const isManager    = emp.id === project.managerId
                return (
                  <IonCard key={emp.id} className="m-0">
                    <IonCardContent>
                      <div className="flex items-center gap-3">
                        <IonAvatar style={{ width: 48, height: 48, flexShrink: 0 }}>
                          <img
                            src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                            alt={emp.name}
                          />
                        </IonAvatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{emp.name}</p>
                            {isManager && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                                Manager
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{emp.designation}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-blue-500">{activeTasks} active</span>
                            <span className="text-xs text-green-500">{doneTasks} completed</span>
                            <span className="text-xs text-gray-400">{memberTasks.length} total</span>
                          </div>
                        </div>
                        <div className="text-center flex-shrink-0">
                          <p className="text-lg font-bold text-primary-600">{emp.productivityScore}%</p>
                          <p className="text-xs text-gray-400">Score</p>
                        </div>
                      </div>

                      {/* Mini progress for member tasks */}
                      {memberTasks.length > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 rounded-full transition-all"
                              style={{ width: `${Math.round((doneTasks / memberTasks.length) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {Math.round((doneTasks / memberTasks.length) * 100)}% task completion on this project
                          </p>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                )
              })}
            </motion.div>
          )}

          {/* ── ACTIVITY ── */}
          {activeTab === 'activity' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
              {isLoading ? (
                <LoadingState />
              ) : allActivity.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Activity will appear here as tasks are updated."
                  icon={ClipboardDocumentListIcon}
                />
              ) : (
                <div className="space-y-0">
                  {allActivity.map((activity, idx) => (
                    <div key={`${activity.id}-${idx}`} className="flex gap-3 pb-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
                        {idx < allActivity.length - 1 && (
                          <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <button
                            onClick={() => history.push(`/tasks/${activity.taskId}`)}
                            className="text-xs font-mono text-primary-500 hover:underline"
                          >
                            {activity.taskId}
                          </button>
                          <span className="text-xs text-gray-400 truncate">{activity.taskTitle}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {activity.performedByName} · {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
