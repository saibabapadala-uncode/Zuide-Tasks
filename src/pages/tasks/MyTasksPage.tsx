import React, { useEffect, useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonButton, IonIcon,
  IonSearchbar, IonRefresher, IonRefresherContent, IonBadge,
  useIonToast,
} from '@ionic/react'
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
    const filters: TaskFilters = user?.role === 'employee' ? { assignedTo: user.id } : {}
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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>My Tasks</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggle}>
              <IonIcon slot="icon-only" icon={isDark ? sunnyOutline : moonOutline} />
            </IonButton>
            <IonButton onClick={() => history.push('/notifications')}>
              <IonIcon slot="icon-only" icon={notificationsOutline} />
              {unreadCount > 0 && (
                <IonBadge color="danger" style={{ position: 'absolute', top: 6, right: 6, fontSize: '10px', minWidth: 16, height: 16, padding: '0 3px', borderRadius: 8 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </IonBadge>
              )}
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <IonToolbar>
          <IonSearchbar
            value={searchQuery}
            onIonInput={ev => setSearchQuery(ev.detail.value || '')}
            placeholder="Search tasks or projects..."
            showCancelButton="focus"
            style={{ '--background': 'var(--ion-item-background)' }}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-gray-50 dark:bg-gray-900 min-h-full pb-8">
          {/* Summary + controls */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} across {groups.length} project{groups.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                Expand all
              </button>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <button
                onClick={collapseAll}
                className="text-xs text-gray-500 dark:text-gray-400 font-medium hover:underline"
              >
                Collapse all
              </button>
            </div>
          </div>

          {isLoading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
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
                  <div key={group.projectId} className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    {/* Project header row */}
                    <button
                      onClick={() => toggleGroup(group.projectId)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                    >
                      {/* Color dot */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />

                      {/* Project name + stats */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {group.projectName}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            {group.stats.total} tasks
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Mini stat pills */}
                          {group.stats.pending > 0 && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">{group.stats.pending} pending</span>
                          )}
                          {group.stats.inProgress > 0 && (
                            <span className="text-xs text-blue-500">{group.stats.inProgress} active</span>
                          )}
                          {group.stats.completed > 0 && (
                            <span className="text-xs text-green-500">{group.stats.completed} done</span>
                          )}
                        </div>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${progress}%`, backgroundColor: group.color }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{progress}%</span>
                        </div>
                      </div>

                      {/* Chevron + project link */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); history.push(`/projects/${group.projectId}`) }}
                          className="text-xs text-primary-500 hover:text-primary-600 font-medium px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                          Details
                        </button>
                        <IonIcon
                          icon={isExpanded ? chevronDownOutline : chevronForwardOutline}
                          className="text-gray-400 text-lg"
                        />
                      </div>
                    </button>

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
                          <div className="border-t border-gray-100 dark:border-gray-700/50">
                            {group.tasks.map((task, idx) => {
                              const isOverdue = new Date(task.dueDate) < new Date() &&
                                task.status !== 'completed' && task.status !== 'approved'
                              return (
                                <div
                                  key={task.id}
                                  onClick={() => history.push(`/tasks/${task.id}`)}
                                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                                    idx < group.tasks.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/30' : ''
                                  }`}
                                >
                                  {/* Status indicator dot */}
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                                    task.status === 'completed' || task.status === 'approved' ? 'bg-green-500' :
                                    task.status === 'in_progress'  ? 'bg-blue-500' :
                                    task.status === 'submitted'    ? 'bg-purple-500' :
                                    task.status === 'rejected'     ? 'bg-red-500' :
                                    'bg-yellow-400'
                                  }`} />

                                  {/* Task info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                      {task.title}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      <span className="text-xs font-mono text-gray-400">{task.taskId}</span>
                                      <span className="text-gray-300 dark:text-gray-600">·</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">{task.assignedToName}</span>
                                    </div>
                                  </div>

                                  {/* Right side badges */}
                                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <div className="flex items-center gap-1.5">
                                      <PriorityBadge priority={task.priority} />
                                      <StatusBadge status={task.status} />
                                    </div>
                                    <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                      {format(new Date(task.dueDate), 'MMM dd')}
                                      {isOverdue && ' !'}
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
