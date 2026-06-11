import React, { useEffect, useState, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonInfiniteScroll, IonInfiniteScrollContent, useIonToast,
} from '@ionic/react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge'
import { TaskCard } from '@/components/TaskCard'
import { EmptyState } from '@/components/EmptyState'
import { useTaskStore, useAuthStore } from '@/store'
import { TaskFilters as ITaskFilters } from '@/types'
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import projectsData from '@/data/projects.json'
import employeesData from '@/data/employees.json'
import { AppHeader } from '@/layouts/AppHeader'

type ViewMode = 'table' | 'card'
type InventoryTab = 'all' | 'high' | 'overdue'

const PAGE_SIZE = 20

interface ProjectOption { id: string; name: string; color: string }
interface EmployeeOption { id: string; name: string }

const projects: ProjectOption[]      = projectsData as ProjectOption[]
const allEmployees: EmployeeOption[] = (employeesData as any[])
  .filter((e: any) => e.isActive)
  .map((e: any) => ({ id: e.id, name: e.name }))

const PRIORITY_ORDER: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 }

export const TaskListPage: React.FC = () => {
  const history  = useHistory()
  const location = useLocation()
  const { user } = useAuthStore()
  const { tasks, isLoading, fetchTasks } = useTaskStore()

  const [viewMode, setViewMode]             = useState<ViewMode>('table')
  const [inventoryTab, setInventoryTab]     = useState<InventoryTab>('all')
  const [searchQuery, setSearchQuery]       = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [projectFilter, setProjectFilter]   = useState('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [sortBy, setSortBy]                 = useState('dueDate-asc')
  const [displayCount, setDisplayCount]     = useState(PAGE_SIZE)
  const [presentToast]                     = useIonToast()

  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    const params    = new URLSearchParams(location.search)
    const projParam = params.get('projectId')
    const stParam   = params.get('status')
    if (projParam) setProjectFilter(projParam)
    if (stParam)   setStatusFilter(stParam)

    const initial: ITaskFilters =
      user?.role === 'employee' ? { assignedTo: user.id } :
      user?.role === 'manager'  ? { teamOf: user.id } : {}
    fetchTasks(initial)
    setDisplayCount(PAGE_SIZE)
  }, [user])

  const handleRefresh = (ev: any) => {
    const base: ITaskFilters =
      user?.role === 'employee' ? { assignedTo: user.id } :
      user?.role === 'manager'  ? { teamOf: user.id } : {}
    fetchTasks(base).finally(() => { ev.detail.complete(); setDisplayCount(PAGE_SIZE) })
  }

  const handleInfiniteScroll = (ev: any) => {
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + PAGE_SIZE, filteredTasks.length))
      ev.target.complete()
    }, 300)
  }

  // Base tasks — filtered by project/employee/search
  const baseTasks = useMemo(() =>
    tasks.filter(t => {
      if (projectFilter !== 'all'  && t.projectId !== projectFilter)   return false
      if (employeeFilter !== 'all' && t.assignedTo !== employeeFilter)  return false
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
    }),
    [tasks, projectFilter, employeeFilter, searchQuery]
  )

  // Derived counts for All, High Priority, Overdue
  const tabCounts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return {
      all: baseTasks.length,
      high: baseTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
      overdue: baseTasks.filter(t => t.dueDate < todayStr && t.status !== 'completed' && t.status !== 'approved').length,
    }
  }, [baseTasks])

  // Completion rate of tasks in this screen context
  const completionRate = useMemo(() => {
    const completed = baseTasks.filter(t => t.status === 'completed' || t.status === 'approved').length
    const total = baseTasks.length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [baseTasks])

  const filteredTasks = useMemo(() => {
    let list = [...baseTasks]

    // Apply main segment tabs
    if (inventoryTab === 'high') {
      list = list.filter(t => t.priority === 'high' || t.priority === 'critical')
    } else if (inventoryTab === 'overdue') {
      const todayStr = new Date().toISOString().split('T')[0]
      list = list.filter(t => t.dueDate < todayStr && t.status !== 'completed' && t.status !== 'approved')
    } else if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        list = list.filter(t => t.status === 'completed' || t.status === 'approved')
      } else {
        list = list.filter(t => t.status === statusFilter)
      }
    }

    return list.sort((a, b) => {
      const [field, order] = sortBy.split('-')
      let av: any = (a as any)[field] ?? ''
      let bv: any = (b as any)[field] ?? ''
      if (field === 'priority') { av = PRIORITY_ORDER[av] ?? 0; bv = PRIORITY_ORDER[bv] ?? 0 }
      const dir = order === 'asc' ? 1 : -1
      return av > bv ? dir : av < bv ? -dir : 0
    })
  }, [baseTasks, inventoryTab, statusFilter, sortBy])

  const displayedTasks = filteredTasks.slice(0, displayCount)
  const allLoaded      = displayCount >= filteredTasks.length
  const hasFilters     = projectFilter !== 'all' || employeeFilter !== 'all' || statusFilter !== 'all' || !!searchQuery || inventoryTab !== 'all'

  const clearFilters = () => {
    setProjectFilter('all')
    setEmployeeFilter('all')
    setStatusFilter('all')
    setInventoryTab('all')
    setSearchQuery('')
    setDisplayCount(PAGE_SIZE)
  }

  const selectedProject = projects.find(p => p.id === projectFilter)

  return (
    <IonPage>
      <AppHeader title="All Tasks" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-zinc-55 dark:bg-[#09090b] min-h-full pb-8">
          
          {/* ── Desktop Title Header Block ── */}
          <div className="hidden lg:flex items-center justify-between gap-4 mb-5 pt-6 px-6">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">WorkStream &gt; All Tasks</p>
              <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-2 leading-none">Task Inventory</h1>
            </div>
            <button
              onClick={() => {
                presentToast({ message: 'Exporting tasks to CSV format...', duration: 2000, color: 'success', position: 'bottom' })
              }}
              className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Export CSV</span>
            </button>
          </div>

          {/* ── Custom Filter & Completion Rate Card ── */}
          <div className="mx-4 lg:mx-6 mb-6 bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3.5">
              {/* Custom Segment Button Tabs */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
                {(['all', 'high', 'overdue'] as const).map(tab => {
                  const active = inventoryTab === tab
                  const count = tabCounts[tab]
                  const label = tab === 'all' ? 'All' : tab === 'high' ? 'High Priority' : 'Overdue'
                  return (
                    <button
                      key={tab}
                      onClick={() => { setInventoryTab(tab); setDisplayCount(PAGE_SIZE) }}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[9px] font-black leading-none ${active ? 'text-indigo-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block h-6 w-px bg-zinc-200 dark:bg-zinc-800/80" />

              {/* Filtering text */}
              <p className="text-xs text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">
                Showing {Math.min(displayedTasks.length, filteredTasks.length)} of {filteredTasks.length} tasks
              </p>
            </div>

            {/* Completion Rate widget */}
            <div className="hidden sm:flex items-center justify-between bg-gradient-to-br from-indigo-600 to-indigo-755 dark:from-indigo-950/40 dark:to-indigo-900/30 text-white rounded-xl p-3 shadow-sm shadow-indigo-500/10 min-w-[200px] border border-indigo-500/10">
              <div className="text-left">
                <p className="text-[9px] font-bold text-indigo-100 uppercase tracking-widest leading-none">Completion Rate</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-lg font-black tracking-tight">{completionRate}%</span>
                  <span className="text-[9px] font-bold bg-white/15 px-1 py-0.5 rounded leading-none">+5%</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                <svg className="w-4 h-4 text-indigo-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Search & Filter Controls Toolbar ── */}
          <div className="mx-4 lg:mx-6 mb-4 flex flex-wrap items-center gap-3">
            {/* Search query box */}
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setDisplayCount(PAGE_SIZE) }}
                placeholder="Search tasks..."
                className="input-field pl-9 py-1.5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Project dropdown select */}
            <select
              value={projectFilter}
              onChange={e => { setProjectFilter(e.target.value); setDisplayCount(PAGE_SIZE) }}
              className="filter-select text-xs py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350 outline-none"
            >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {/* Assignee/People dropdown select */}
            {isManagerOrAdmin && (
              <select
                value={employeeFilter}
                onChange={e => { setEmployeeFilter(e.target.value); setDisplayCount(PAGE_SIZE) }}
                className="filter-select text-xs py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350 outline-none"
              >
                <option value="all">All People</option>
                {allEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            )}

            {/* Sorting trigger */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="filter-select text-xs py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350 outline-none"
            >
              <option value="dueDate-asc">Sort: Due Date (Asc)</option>
              <option value="dueDate-desc">Sort: Due Date (Desc)</option>
              <option value="priority-desc">Sort: Priority</option>
              <option value="title-asc">Sort: Title A-Z</option>
            </select>

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(m => m === 'table' ? 'card' : 'table')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <span>View: {viewMode === 'table' ? 'Table' : 'Grid'}</span>
            </button>

            {/* Clear Filters Action */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline transition-all ml-1.5"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* ── Main Data View ── */}
          <div className="mx-4 lg:mx-6">
            {isLoading && tasks.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayedTasks.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-8">
                <EmptyState
                  title="No tasks found"
                  description={searchQuery ? 'Try a different search query.' : 'No tasks match the active filters.'}
                  icon={ClipboardDocumentListIcon}
                />
              </div>
            ) : viewMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            ) : (
              /* ── Grid/Table view matching Image 1 ── */
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/80 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-sm">
                
                {/* Table Header Row */}
                <div className="hidden md:grid md:grid-cols-[40px_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)] gap-4 px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-[10px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-widest">
                  <div className="flex items-center justify-center">
                    <input type="checkbox" readOnly className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650" />
                  </div>
                  <span>Task Name</span>
                  <span>Project</span>
                  <span>Due Date</span>
                  <span>Status</span>
                  <span className="text-right">Assignee</span>
                </div>

                {/* Table Rows list */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                  {displayedTasks.map((task, idx) => {
                    const isOverdue = new Date(task.dueDate) < new Date() &&
                      task.status !== 'completed' && task.status !== 'approved'
                    const proj = projects.find(p => p.id === task.projectId)
                    const projectColor = proj?.color || '#4f46e5'

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx * 0.015, 0.2) }}
                        onClick={() => history.push(`/tasks/${task.id}`)}
                        className="grid grid-cols-1 md:grid-cols-[40px_minmax(0,3fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)] gap-2 md:gap-4 px-5 py-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50/60 dark:hover:bg-zinc-850/20 cursor-pointer items-center transition-colors duration-150"
                      >
                        {/* Checkbox */}
                        <div className="hidden md:flex items-center justify-center" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" readOnly checked={task.status === 'completed' || task.status === 'approved'} className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650" />
                        </div>

                        {/* Task Title & Meta details */}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 tracking-tight leading-snug truncate">
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
                            {task.taskId} • Updated {format(new Date(task.updatedAt), 'MMM d')}
                          </p>

                          {/* Mobile-only responsive meta view */}
                          <div className="flex flex-wrap items-center gap-2 mt-2 md:hidden">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${projectColor}15`, color: projectColor }}>
                              {task.projectName}
                            </span>
                            <StatusBadge status={task.status} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isOverdue ? 'text-rose-500' : 'text-zinc-400'}`}>
                              {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                          </div>
                        </div>

                        {/* Project badge column */}
                        <div className="hidden md:flex items-center min-w-0">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border"
                            style={{ backgroundColor: `${projectColor}10`, color: projectColor, borderColor: `${projectColor}20` }}
                          >
                            {task.projectName}
                          </span>
                        </div>

                        {/* Due date column */}
                        <div className="hidden md:flex items-center">
                          <div className="flex items-center gap-1.5 text-xs">
                            <svg className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span className={`font-bold ${isOverdue ? 'text-rose-550' : 'text-zinc-650 dark:text-zinc-350'}`}>
                              {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge column */}
                        <div className="hidden md:flex items-center">
                          <StatusBadge status={task.status} />
                        </div>

                        {/* Assignee overlapping avatar column */}
                        <div className="hidden md:flex items-center justify-end">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            <img
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover bg-zinc-150"
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedToName}`}
                              alt={task.assignedToName}
                              title={task.assignedToName}
                            />
                            {task.title.length % 2 === 0 && (
                              <img
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover bg-zinc-150"
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignedToName}2`}
                                alt="Secondary Assignee"
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <IonInfiniteScroll disabled={allLoaded} onIonInfinite={handleInfiniteScroll} threshold="150px">
            <IonInfiniteScrollContent loadingSpinner="dots" loadingText="Loading more tasks..." />
          </IonInfiniteScroll>
        </div>
      </IonContent>
    </IonPage>
  )
}
