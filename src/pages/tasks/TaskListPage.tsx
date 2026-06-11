import React, { useEffect, useState, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonMenuButton, IonButton, IonIcon,
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
  IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent,
  IonBadge, IonFab, IonFabButton,
  useIonActionSheet, useIonToast,
} from '@ionic/react'
import {
  addOutline, listOutline, gridOutline,
  swapVerticalOutline, notificationsOutline,
  moonOutline, sunnyOutline,
} from 'ionicons/icons'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge'
import { TaskCard } from '@/components/TaskCard'
import { EmptyState } from '@/components/EmptyState'
import { useTaskStore, useAuthStore, useThemeStore, useNotificationStore } from '@/store'
import { TaskFilters as ITaskFilters } from '@/types'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import projectsData from '@/data/projects.json'
import employeesData from '@/data/employees.json'

type ViewMode = 'table' | 'card'

const PAGE_SIZE = 20

const STATUS_SEGMENTS = [
  { value: 'all',         label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted',   label: 'Submitted' },
  { value: 'approved',    label: 'Approved' },
  { value: 'completed',   label: 'Done' },
  { value: 'rejected',    label: 'Rejected' },
]

interface ProjectOption { id: string; name: string; color: string }
interface EmployeeOption { id: string; name: string }

const projects: ProjectOption[] = projectsData as ProjectOption[]
const allEmployees: EmployeeOption[] = (employeesData as any[])
  .filter((e: any) => e.isActive)
  .map((e: any) => ({ id: e.id, name: e.name }))

export const TaskListPage: React.FC = () => {
  const history = useHistory()
  const location = useLocation()
  const { user } = useAuthStore()
  const { tasks, isLoading, fetchTasks } = useTaskStore()
  const { isDark, toggle } = useThemeStore()
  const { unreadCount } = useNotificationStore()

  const [viewMode, setViewMode]             = useState<ViewMode>('table')
  const [searchQuery, setSearchQuery]       = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [projectFilter, setProjectFilter]   = useState('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [sortBy, setSortBy]                 = useState('dueDate-asc')
  const [displayCount, setDisplayCount]     = useState(PAGE_SIZE)
  const [presentActionSheet]               = useIonActionSheet()
  const [presentToast]                     = useIonToast()

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const projParam = params.get('projectId')
    const statusParam = params.get('status')
    if (projParam)  setProjectFilter(projParam)
    if (statusParam) setStatusFilter(statusParam)

    const initial: ITaskFilters = user?.role === 'employee' ? { assignedTo: user.id } : {}
    fetchTasks(initial)
    setDisplayCount(PAGE_SIZE)
  }, [user])

  const handleRefresh = (ev: any) => {
    const base: ITaskFilters = user?.role === 'employee' ? { assignedTo: user.id } : {}
    fetchTasks(base).finally(() => { ev.detail.complete(); setDisplayCount(PAGE_SIZE) })
  }

  const handleInfiniteScroll = (ev: any) => {
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + PAGE_SIZE, filteredTasks.length))
      ev.target.complete()
    }, 300)
  }

  const handleSort = () => {
    presentActionSheet({
      header: 'Sort By',
      buttons: [
        { text: 'Due Date (Earliest)',   handler: () => setSortBy('dueDate-asc') },
        { text: 'Due Date (Latest)',      handler: () => setSortBy('dueDate-desc') },
        { text: 'Priority (High → Low)', handler: () => setSortBy('priority-desc') },
        { text: 'Recently Updated',      handler: () => setSortBy('updatedAt-desc') },
        { text: 'Title A–Z',             handler: () => setSortBy('title-asc') },
        { text: 'Cancel', role: 'cancel' },
      ],
    })
  }

  const PRIORITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (statusFilter !== 'all'   && t.status !== statusFilter)    return false
        if (projectFilter !== 'all'  && t.projectId !== projectFilter) return false
        if (employeeFilter !== 'all' && t.assignedTo !== employeeFilter) return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          return (
            t.title.toLowerCase().includes(q) ||
            t.taskId.toLowerCase().includes(q) ||
            t.projectName.toLowerCase().includes(q) ||
            t.assignedToName.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
        const [field, order] = sortBy.split('-')
        let aVal: any = (a as any)[field] ?? ''
        let bVal: any = (b as any)[field] ?? ''
        if (field === 'priority') {
          aVal = PRIORITY_ORDER[aVal] ?? 0
          bVal = PRIORITY_ORDER[bVal] ?? 0
        }
        const dir = order === 'asc' ? 1 : -1
        return aVal > bVal ? dir : aVal < bVal ? -dir : 0
      })
  }, [tasks, statusFilter, projectFilter, employeeFilter, searchQuery, sortBy])

  const summary = useMemo(() => ({
    total:      filteredTasks.length,
    pending:    filteredTasks.filter(t => t.status === 'pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    submitted:  filteredTasks.filter(t => t.status === 'submitted').length,
    completed:  filteredTasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
    rejected:   filteredTasks.filter(t => t.status === 'rejected').length,
  }), [filteredTasks])

  const displayedTasks = filteredTasks.slice(0, displayCount)
  const allLoaded      = displayCount >= filteredTasks.length

  const selectedProject = projectFilter !== 'all'
    ? projects.find(p => p.id === projectFilter)
    : null

  const clearFilters = () => {
    setProjectFilter('all')
    setEmployeeFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
    setDisplayCount(PAGE_SIZE)
  }

  const hasActiveFilters = projectFilter !== 'all' || employeeFilter !== 'all' || statusFilter !== 'all' || searchQuery

  return (
    <IonPage>
      <IonHeader>
        {/* Main toolbar */}
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>
            {selectedProject ? (
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: selectedProject.color }} />
                <span className="truncate text-sm">{selectedProject.name}</span>
              </span>
            ) : 'All Tasks'}
          </IonTitle>
          <IonButtons slot="end">
            {hasActiveFilters && (
              <IonButton fill="clear" onClick={clearFilters}>
                <span className="text-xs text-primary-500">Clear</span>
              </IonButton>
            )}
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

        {/* Search + sort + view */}
        <IonToolbar>
          <div className="flex items-center gap-2 px-3 pb-1">
            <IonSearchbar
              value={searchQuery}
              onIonInput={ev => { setSearchQuery(ev.detail.value || ''); setDisplayCount(PAGE_SIZE) }}
              placeholder="Search tasks, projects, people..."
              showCancelButton="focus"
              className="flex-1"
              style={{ '--background': 'var(--ion-item-background)', padding: 0 }}
            />
            <IonButton fill="outline" size="small" onClick={handleSort} style={{ flexShrink: 0 }}>
              <IonIcon slot="icon-only" icon={swapVerticalOutline} />
            </IonButton>
            <IonButton
              fill={viewMode === 'card' ? 'solid' : 'outline'}
              size="small"
              onClick={() => setViewMode(m => m === 'table' ? 'card' : 'table')}
              style={{ flexShrink: 0 }}
            >
              <IonIcon slot="icon-only" icon={viewMode === 'table' ? gridOutline : listOutline} />
            </IonButton>
          </div>
        </IonToolbar>

        {/* Status segment */}
        <IonToolbar>
          <IonSegment
            scrollable
            value={statusFilter}
            onIonChange={ev => { setStatusFilter(ev.detail.value as string); setDisplayCount(PAGE_SIZE) }}
            style={{ '--background': 'transparent' }}
          >
            {STATUS_SEGMENTS.map(s => (
              <IonSegmentButton key={s.value} value={s.value} style={{ minWidth: 'auto' }}>
                <IonLabel>{s.label}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-gray-50 dark:bg-gray-900 min-h-full">

          {/* ── Summary stats ── */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { label: 'Total',       value: summary.total,      bg: 'bg-gray-100 dark:bg-gray-800',          text: 'text-gray-800 dark:text-gray-200' },
                { label: 'Pending',     value: summary.pending,    bg: 'bg-yellow-50 dark:bg-yellow-900/20',    text: 'text-yellow-700 dark:text-yellow-400' },
                { label: 'In Progress', value: summary.inProgress, bg: 'bg-blue-50 dark:bg-blue-900/20',        text: 'text-blue-700 dark:text-blue-400' },
                { label: 'Submitted',   value: summary.submitted,  bg: 'bg-purple-50 dark:bg-purple-900/20',   text: 'text-purple-700 dark:text-purple-400' },
                { label: 'Completed',   value: summary.completed,  bg: 'bg-green-50 dark:bg-green-900/20',     text: 'text-green-700 dark:text-green-400' },
                { label: 'Rejected',    value: summary.rejected,   bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-700 dark:text-red-400' },
              ].map(s => (
                <div key={s.label} className={`flex-shrink-0 px-3 py-2 rounded-xl text-center ${s.bg}`}>
                  <p className={`text-lg font-bold leading-none ${s.text}`}>{s.value}</p>
                  <p className={`text-xs mt-0.5 whitespace-nowrap ${s.text} opacity-80`}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filters row ── */}
          <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
            {/* Project filter */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-gray-400 whitespace-nowrap">Project:</span>
              <select
                value={projectFilter}
                onChange={e => { setProjectFilter(e.target.value); setDisplayCount(PAGE_SIZE) }}
                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 max-w-[150px] truncate"
              >
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Employee filter — managers/admin only */}
            {isManagerOrAdmin && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">Person:</span>
                <select
                  value={employeeFilter}
                  onChange={e => { setEmployeeFilter(e.target.value); setDisplayCount(PAGE_SIZE) }}
                  className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 max-w-[140px] truncate"
                >
                  <option value="all">All Employees</option>
                  {allEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}

            {/* Active filter chips */}
            {projectFilter !== 'all' && (
              <button
                onClick={() => { setProjectFilter('all'); setDisplayCount(PAGE_SIZE) }}
                className="flex items-center gap-1 text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full border border-primary-200 dark:border-primary-800"
              >
                {projects.find(p => p.id === projectFilter)?.name} ×
              </button>
            )}
            {employeeFilter !== 'all' && (
              <button
                onClick={() => { setEmployeeFilter('all'); setDisplayCount(PAGE_SIZE) }}
                className="flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800"
              >
                {allEmployees.find(e => e.id === employeeFilter)?.name} ×
              </button>
            )}
          </div>

          {/* ── Content ── */}
          {isLoading && tasks.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayedTasks.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No tasks found"
                description={searchQuery ? 'Try different search terms.' : 'No tasks match the selected filters.'}
                icon={ClipboardDocumentListIcon}
              />
            </div>
          ) : viewMode === 'card' ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            /* ── Table view ── */
            <div className="overflow-x-auto">
              {/* Table header — desktop only */}
              <div className="hidden sm:grid sm:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_80px_110px_80px] gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide sticky top-0 z-10">
                <span>Task</span>
                <span>Project</span>
                <span>Assigned To</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Due Date</span>
              </div>

              {displayedTasks.map((task, idx) => {
                const isOverdue = new Date(task.dueDate) < new Date() &&
                  task.status !== 'completed' && task.status !== 'approved'
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                    onClick={() => history.push(`/tasks/${task.id}`)}
                    className="grid grid-cols-1 sm:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_80px_110px_80px] gap-1 sm:gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:bg-primary-50/40 dark:hover:bg-primary-900/10 cursor-pointer transition-colors"
                  >
                    {/* Task name + ID */}
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-gray-400 dark:text-gray-500">{task.taskId}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                        {task.title}
                      </p>
                      {/* Mobile: inline badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 sm:hidden">
                        <span className="text-xs text-gray-400">{task.projectName}</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-500">{task.assignedToName}</span>
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                        <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          {format(new Date(task.dueDate), 'MMM dd')}
                        </span>
                      </div>
                    </div>

                    {/* Project */}
                    <div className="hidden sm:flex items-center min-w-0">
                      <button
                        onClick={e => { e.stopPropagation(); history.push(`/projects/${task.projectId}`) }}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline truncate text-left"
                      >
                        {task.projectName}
                      </button>
                    </div>

                    {/* Assigned To */}
                    <div className="hidden sm:flex items-center min-w-0">
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{task.assignedToName}</span>
                    </div>

                    {/* Priority */}
                    <div className="hidden sm:flex items-center">
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {/* Status */}
                    <div className="hidden sm:flex items-center">
                      <StatusBadge status={task.status} />
                    </div>

                    {/* Due date */}
                    <div className="hidden sm:flex items-center">
                      <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {format(new Date(task.dueDate), 'MMM dd')}
                        {isOverdue && <span className="ml-1 text-red-400">!</span>}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          <IonInfiniteScroll disabled={allLoaded} onIonInfinite={handleInfiniteScroll} threshold="150px">
            <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Loading more tasks..." />
          </IonInfiniteScroll>

          <div className="pb-20" />
        </div>
      </IonContent>

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton color="primary" onClick={() => presentToast({ message: 'Task creation coming soon!', duration: 1500, position: 'bottom' })}>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  )
}
