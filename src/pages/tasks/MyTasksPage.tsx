import React, { useEffect, useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonButton, IonIcon,
  IonRefresher, IonRefresherContent, IonBadge,
  useIonToast,
} from '@ionic/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  chevronDownOutline, chevronForwardOutline,
  notificationsOutline, moonOutline, sunnyOutline,
} from 'ionicons/icons'
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { useTaskStore, useAuthStore, useThemeStore, useNotificationStore } from '@/store'
import { Task, TaskFilters } from '@/types'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import projectsData from '@/data/projects.json'

interface ProjectGroup {
  projectId:   string
  projectName: string
  color:       string
  tasks:       Task[]
  stats: {
    total:      number
    pending:    number
    inProgress: number
    completed:  number
  }
}

const projectColorMap = Object.fromEntries(
  (projectsData as any[]).map((p: any) => [p.id, p.color])
)

export const MyTasksPage: React.FC = () => {
  const history = useHistory()
  const { user } = useAuthStore()
  const { tasks, isLoading, fetchTasks } = useTaskStore()
  const { isDark, toggle } = useThemeStore()
  const { unreadCount } = useNotificationStore()

  const [searchQuery, setSearchQuery]         = useState('')
  const [expandedGroups, setExpandedGroups]   = useState<Set<string>>(new Set())
  const [presentToast]                        = useIonToast()

  useEffect(() => {
    const filters: TaskFilters =
      user?.role === 'employee' ? { assignedTo: user.id } :
      user?.role === 'manager'  ? { teamOf: user.id } : {}
    fetchTasks(filters)
  }, [user])

  const groups: ProjectGroup[] = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const filtered = tasks.filter(t => {
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        t.taskId.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q)
      )
    })

    const map: Record<string, ProjectGroup> = {}
    filtered.forEach(task => {
      if (!map[task.projectId]) {
        map[task.projectId] = {
          projectId:   task.projectId,
          projectName: task.projectName,
          color:       projectColorMap[task.projectId] || '#6366f1',
          tasks:       [],
          stats:       { total: 0, pending: 0, inProgress: 0, completed: 0 },
        }
      }
      map[task.projectId].tasks.push(task)
    })

    // Compute stats and sort tasks by due date within each group
    return Object.values(map)
      .map(group => {
        const sorted = [...group.tasks].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
        return {
          ...group,
          tasks: sorted,
          stats: {
            total:      group.tasks.length,
            pending:    group.tasks.filter(t => t.status === 'pending').length,
            inProgress: group.tasks.filter(t => t.status === 'in_progress').length,
            completed:  group.tasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
          },
        }
      })
      .sort((a, b) => a.projectName.localeCompare(b.projectName))
  }, [tasks, searchQuery])

  // Expand all groups initially after first load
  useEffect(() => {
    if (groups.length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set(groups.map(g => g.projectId)))
    }
  }, [groups.length])

  const toggleGroup = (projectId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  const expandAll  = () => setExpandedGroups(new Set(groups.map(g => g.projectId)))
  const collapseAll = () => setExpandedGroups(new Set())

  const handleRefresh = (ev: any) => {
    const filters: TaskFilters = user?.role === 'employee' ? { assignedTo: user.id } : {}
    fetchTasks(filters).finally(() => ev.detail.complete())
  }

  const totalTasks = groups.reduce((sum, g) => sum + g.stats.total, 0)

  return (
    <IonPage>
      <IonHeader className="border-b border-zinc-200/50 dark:border-zinc-800/80">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton className="text-zinc-500 dark:text-zinc-400" />
          </IonButtons>
          <IonTitle>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">My Tasks</span>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'} className="text-zinc-500 dark:text-zinc-400">
              <IonIcon slot="icon-only" icon={isDark ? sunnyOutline : moonOutline} style={{ fontSize: '18px' }} />
            </IonButton>
            <IonButton onClick={() => history.push('/notifications')} style={{ position: 'relative' }} className="text-zinc-500 dark:text-zinc-400">
              <IonIcon slot="icon-only" icon={notificationsOutline} style={{ fontSize: '18px' }} />
              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white dark:border-[#09090b] shadow-sm animate-fade-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <IonToolbar style={{ '--min-height': '48px' } as any}>
          <div className="flex items-center gap-2 px-3 py-1.5">
            <div className="relative flex-1 min-w-0">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks or projects..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-105/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-200/50 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all duration-150"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350">
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-zinc-50 dark:bg-[#09090b] min-h-full pb-8">
          {/* Summary + controls */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-zinc-550 dark:text-zinc-450">
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} across {groups.length} project{groups.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Expand all
              </button>
              <span className="text-zinc-300 dark:text-zinc-800">·</span>
              <button
                onClick={collapseAll}
                className="text-xs text-zinc-500 dark:text-zinc-450 font-bold hover:underline"
              >
                Collapse all
              </button>
            </div>
          </div>

          {isLoading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No tasks found"
                description={searchQuery ? 'No tasks match your search.' : 'You have no tasks assigned.'}
                icon={ClipboardDocumentListIcon}
              />
            </div>
          ) : (
            <div className="space-y-3 px-4">
              {groups.map(group => {
                const isExpanded = expandedGroups.has(group.projectId)
                const progress   = group.stats.total > 0
                  ? Math.round((group.stats.completed / group.stats.total) * 100)
                  : 0

                return (
                  <div key={group.projectId} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-350 dark:hover:border-zinc-750 transition-colors duration-150">
                    {/* Project header row */}
                    <div
                      onClick={() => toggleGroup(group.projectId)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors duration-150 text-left cursor-pointer"
                    >
                      {/* Color dot */}
                      <div className="w-2.5 h-2.5 rounded-full border border-black/5 dark:border-white/5 flex-shrink-0" style={{ backgroundColor: group.color }} />

                      {/* Project name + stats */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-zinc-850 dark:text-zinc-200 truncate tracking-tight">
                            {group.projectName}
                          </span>
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                            {group.stats.total} tasks
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Mini stat pills */}
                          {group.stats.pending > 0 && (
                            <span className="text-[11px] font-medium text-amber-605 dark:text-amber-400">{group.stats.pending} pending</span>
                          )}
                          {group.stats.inProgress > 0 && (
                            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">{group.stats.inProgress} active</span>
                          )}
                          {group.stats.completed > 0 && (
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{group.stats.completed} done</span>
                          )}
                        </div>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${progress}%`, backgroundColor: group.color }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 flex-shrink-0">{progress}%</span>
                        </div>
                      </div>

                      {/* Chevron + project link */}
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => history.push(`/projects/${group.projectId}`)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-bold px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors duration-150"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => toggleGroup(group.projectId)}
                          className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-450 dark:text-zinc-500 transition-colors duration-150"
                        >
                          <IonIcon
                            icon={isExpanded ? chevronDownOutline : chevronForwardOutline}
                            style={{ fontSize: '16px', display: 'block' }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Task list */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="border-t border-zinc-100 dark:border-zinc-800/60">
                            {group.tasks.map((task, idx) => {
                              const isOverdue = new Date(task.dueDate) < new Date() &&
                                task.status !== 'completed' && task.status !== 'approved'
                              return (
                                <div
                                  key={task.id}
                                  onClick={() => history.push(`/tasks/${task.id}`)}
                                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors duration-150 ${
                                    idx < group.tasks.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/40' : ''
                                  }`}
                                >
                                  {/* Status indicator dot */}
                                  <div className="flex-shrink-0">
                                    <div className={`w-2 h-2 rounded-full border border-black/5 dark:border-white/5 ${
                                      task.status === 'completed' || task.status === 'approved' ? 'bg-emerald-500' :
                                      task.status === 'in_progress'  ? 'bg-indigo-500' :
                                      task.status === 'submitted'    ? 'bg-violet-500' :
                                      task.status === 'rejected'     ? 'bg-rose-500' :
                                      'bg-amber-500'
                                    }`} />
                                  </div>

                                  {/* Task info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-850 dark:text-zinc-200 line-clamp-1 tracking-tight">
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] font-mono font-semibold text-zinc-400 dark:text-zinc-500">{task.taskId}</span>
                                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-450">{task.assignedToName}</span>
                                    </div>
                                  </div>

                                  {/* Right side badges */}
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="flex items-center gap-1.5">
                                      <PriorityBadge priority={task.priority} />
                                      <StatusBadge status={task.status} />
                                    </div>
                                    <span className={`text-xs font-semibold tracking-tight ${isOverdue ? 'text-rose-500 font-semibold' : 'text-zinc-400'}`}>
                                      {format(new Date(task.dueDate), 'MMM d')}
                                      {isOverdue && <span className="ml-0.5 text-rose-500 font-bold">!</span>}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
