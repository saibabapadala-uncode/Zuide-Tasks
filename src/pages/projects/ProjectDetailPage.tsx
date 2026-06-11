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
      <IonHeader className="border-b border-zinc-200/50 dark:border-zinc-800/80">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/projects" className="text-zinc-500 dark:text-zinc-400" />
          </IonButtons>
          <IonTitle>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{project.name}</span>
          </IonTitle>
          <IonButtons slot="end">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border mr-3 ${
              project.status === 'completed'
                ? 'bg-emerald-50/80 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                : project.status === 'in_progress'
                ? 'bg-indigo-50/80 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400'
                : 'bg-amber-50/80 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
            }`}>
              {statusLabel}
            </span>
          </IonButtons>
        </IonToolbar>

        {/* Tab Selection */}
        <IonToolbar style={{ '--min-height': '40px' } as any} className="bg-white dark:bg-[#09090b]">
          <div className="flex px-3 gap-2 overflow-x-auto no-scrollbar">
            {(['overview', 'tasks', 'team', 'activity'] as ProjectTab[]).map(tab => {
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
                  {tab === 'tasks' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {stats.total}
                    </span>
                  )}
                  {active && (
                    <motion.div
                      layoutId="activeProjectTab"
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
        <IonRefresher slot="fixed" onIonRefresh={ev => loadTasks().finally(() => ev.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-zinc-50 dark:bg-[#09090b] min-h-full pb-8">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4">
              {/* Project header card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="h-1 w-full" style={{ backgroundColor: project.color }} />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ backgroundColor: `${project.color}15`, color: project.color }}
                    >
                      📁
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-zinc-850 dark:text-zinc-200 tracking-tight leading-tight">{project.name}</h2>
                      <p className="text-xs font-semibold text-zinc-405 dark:text-zinc-500 mt-1">
                        {project.managerName} · {(project.tags || []).join(', ')}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium mb-4">{project.description}</p>

                  {/* Progress bar */}
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-550">Progress</span>
                    <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400">{stats.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${stats.progress}%`, backgroundColor: project.color }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                    <span>{stats.completed} completed</span>
                    <span>{stats.total} total tasks</span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Pending',     value: stats.pending,    textColor: 'text-amber-600 dark:text-amber-450' },
                  { label: 'In Progress', value: stats.inProgress, textColor: 'text-indigo-600 dark:text-indigo-400' },
                  { label: 'Submitted',   value: stats.submitted,  textColor: 'text-violet-650 dark:text-violet-400' },
                  { label: 'Completed',   value: stats.completed,  textColor: 'text-emerald-600 dark:text-emerald-450' },
                  { label: 'Rejected',    value: stats.rejected,   textColor: 'text-rose-600 dark:text-rose-450' },
                  { label: 'Members',     value: teamMembers.length, textColor: 'text-zinc-700 dark:text-zinc-200' },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-sm">
                    <p className={`text-xl font-bold tracking-tight ${s.textColor}`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Project details */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest mb-4">Details</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Start Date', value: format(new Date(project.startDate), 'MMM d, yyyy') },
                    { label: 'Due Date',   value: format(new Date(project.dueDate),   'MMM d, yyyy') },
                    { label: 'Priority',   value: project.priority },
                    { label: 'Status',     value: project.status.replace('_', ' ') },
                    { label: 'Manager',    value: project.managerName },
                    { label: 'Team Size',  value: `${teamMembers.length} members` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-zinc-105/50 dark:border-zinc-850/40 last:border-0 pb-2 last:pb-0">
                      <span className="text-xs font-semibold text-zinc-450 dark:text-zinc-500">{item.label}</span>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 capitalize">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TASKS ── */}
          {activeTab === 'tasks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats row */}
              <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-zinc-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                {[
                  { label: 'Total',      value: stats.total,      color: 'text-zinc-700 dark:text-zinc-350' },
                  { label: 'Pending',    value: stats.pending,    color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Active',     value: stats.inProgress, color: 'text-indigo-600 dark:text-indigo-400' },
                  { label: 'Submitted',  value: stats.submitted,  color: 'text-violet-650 dark:text-violet-405' },
                  { label: 'Completed',  value: stats.completed,  color: 'text-emerald-600 dark:text-emerald-450' },
                  { label: 'Rejected',   value: stats.rejected,   color: 'text-rose-600 dark:text-rose-450' },
                ].map(s => (
                  <div key={s.label} className="flex-shrink-0 text-center px-4 border-r border-zinc-100 dark:border-zinc-850 last:border-0">
                    <p className={`text-lg font-bold tracking-tight ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 whitespace-nowrap mt-0.5">{s.label}</p>
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
                  <div className="hidden sm:grid sm:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_80px_110px_80px] gap-3 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest sticky top-0 z-10">
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx * 0.015, 0.25) }}
                        onClick={() => history.push(`/tasks/${task.id}`)}
                        className="grid grid-cols-1 sm:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_80px_110px_80px] gap-1 sm:gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/40 bg-white dark:bg-[#18181b]/30 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 cursor-pointer transition-colors duration-150"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-550 font-semibold">{task.taskId}</p>
                          <p className="text-sm font-semibold text-zinc-850 dark:text-zinc-200 line-clamp-1 mt-1 tracking-tight">{task.title}</p>
                          <div className="flex items-center gap-2 mt-2 sm:hidden flex-wrap">
                            <span className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold">{task.assignedToName}</span>
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center min-w-0">
                          <span className="text-xs font-medium text-zinc-650 dark:text-zinc-400 truncate">{task.assignedToName}</span>
                        </div>
                        <div className="hidden sm:flex items-center">
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <div className="hidden sm:flex items-center">
                          <StatusBadge status={task.status} />
                        </div>
                        <div className="hidden sm:flex items-center">
                          <span className={`text-xs font-semibold tracking-tight ${isOverdue ? 'text-rose-500 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            {format(new Date(task.dueDate), 'MMM d')}
                            {isOverdue && <span className="ml-0.5 text-rose-500 font-bold">!</span>}
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
                <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">No team members found.</div>
              ) : teamMembers.map((emp: any) => {
                const memberTasks  = tasks.filter(t => t.assignedTo === emp.id)
                const doneTasks    = memberTasks.filter(t => t.status === 'completed' || t.status === 'approved').length
                const activeTasks  = memberTasks.filter(t => t.status === 'in_progress').length
                const isManager    = emp.id === project.managerId
                return (
                  <div key={emp.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-4 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-colors duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-800">
                        <img
                          src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                          alt={emp.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 truncate tracking-tight">{emp.name}</p>
                          {isManager && (
                            <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 uppercase tracking-wider">
                              Manager
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-405 dark:text-zinc-500 mt-0.5 font-medium">{emp.designation}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold">
                          <span className="text-indigo-600 dark:text-indigo-400">{activeTasks} active</span>
                          <span className="text-zinc-350 dark:text-zinc-800">·</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{doneTasks} completed</span>
                          <span className="text-zinc-350 dark:text-zinc-800">·</span>
                          <span className="text-zinc-400 dark:text-zinc-500">{memberTasks.length} total</span>
                        </div>
                      </div>
                      <div className="text-center flex-shrink-0 border-l border-zinc-100 dark:border-zinc-800 pl-4">
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-tight">{emp.productivityScore}%</p>
                        <p className="text-[9px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wider mt-0.5">Productivity</p>
                      </div>
                    </div>

                    {/* Mini progress for member tasks */}
                    {memberTasks.length > 0 && (
                      <div className="mt-4">
                        <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round((doneTasks / memberTasks.length) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-1.5">
                          {Math.round((doneTasks / memberTasks.length) * 100)}% task completion on this project
                        </p>
                      </div>
                    )}
                  </div>
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
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 space-y-4">
                  {allActivity.map((activity, idx) => (
                    <div key={`${activity.id}-${idx}`} className="flex gap-3 text-xs relative">
                      {idx < allActivity.length - 1 && (
                        <div className="absolute left-[5px] top-[14px] bottom-[-20px] w-[1px] bg-zinc-200 dark:bg-zinc-850" />
                      )}
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-550 dark:bg-indigo-650 mt-1 flex-shrink-0 border-2 border-white dark:border-zinc-900 z-10" />
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 leading-snug">{activity.description}</p>
                        <div className="flex items-center gap-1.5 mt-1 font-medium">
                          <button
                            onClick={() => history.push(`/tasks/${activity.taskId}`)}
                            className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                          >
                            {activity.taskId}
                          </button>
                          <span className="text-zinc-300 dark:text-zinc-800">·</span>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{activity.taskTitle}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-0.5 font-bold">
                          {activity.performedByName} · {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
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
