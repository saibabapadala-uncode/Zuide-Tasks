import React, { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonCard, IonCardContent, IonSkeletonText, IonProgressBar,
} from '@ionic/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { MobileLayout } from '@/layouts/MobileLayout'
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge'
import { useAuthStore, useTaskStore } from '@/store'
import { reportService } from '@/services'
import { Task } from '@/types'
import projectsData from '@/data/projects.json'

const PIE_COLORS = ['#059669', '#4F46E5', '#D97706', '#DC2626', '#0891b2', '#7c3aed']

interface Project {
  id: string
  name: string
  color: string
  status: string
  priority: string
  progress: number
  totalTasks: number
  completedTasks: number
  managerName: string
  dueDate: string
}

const projects: Project[] = projectsData as Project[]

export const DashboardPage: React.FC = () => {
  const history = useHistory()
  const { user } = useAuthStore()
  const { tasks, dashboardStats, fetchTasks, refreshStats, isLoading } = useTaskStore()
  const [chartData, setChartData] = useState<any>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([])

  const loadData = async () => {
    const isEmployee = user?.role === 'employee'
    await fetchTasks(isEmployee ? { assignedTo: user?.id } : undefined)
    refreshStats(isEmployee ? user?.id : undefined)
    const chart = await reportService.getDashboardChartData()
    setChartData(chart)
  }

  useEffect(() => { loadData() }, [user])

  useEffect(() => {
    const sorted = [...tasks].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    setRecentTasks(sorted.slice(0, 5))
  }, [tasks])

  const handleRefresh = (ev: any) => {
    loadData().finally(() => ev.detail.complete())
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  // Project-level computed data
  const activeProjects  = projects.filter(p => p.status !== 'completed')
  const completedProjects = projects.filter(p => p.status === 'completed')

  // Tasks per project chart data
  const tasksByProjectChart = useMemo(() =>
    projects
      .map(p => {
        const ptasks = tasks.filter(t => t.projectId === p.id)
        return {
          name:      p.name.split(' ').slice(0, 2).join(' '),
          total:     ptasks.length,
          completed: ptasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
          active:    ptasks.filter(t => t.status === 'in_progress').length,
          color:     p.color,
        }
      })
      .filter(p => p.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8),
    [tasks]
  )

  // Project completion chart
  const projectCompletionChart = projects
    .map(p => ({
      name:     p.name.split(' ').slice(0, 2).join(' '),
      progress: p.progress,
      color:    p.color,
    }))
    .sort((a, b) => b.progress - a.progress)

  const taskStatCards = dashboardStats ? [
    { label: 'Total Tasks',   value: dashboardStats.total,       color: 'from-primary-500 to-primary-600', path: '/tasks' },
    { label: 'In Progress',   value: dashboardStats.inProgress,  color: 'from-blue-500 to-blue-600',      path: '/tasks?status=in_progress' },
    { label: 'Pending',       value: dashboardStats.pending,     color: 'from-yellow-500 to-yellow-600',  path: '/tasks?status=pending' },
    { label: 'Completed',     value: dashboardStats.completed,   color: 'from-green-500 to-green-600',    path: '/tasks?status=completed' },
    { label: 'Rejected',      value: dashboardStats.rejected,    color: 'from-red-500 to-red-600',        path: '/tasks?status=rejected' },
    { label: "Today's Due",   value: dashboardStats.todaysTasks, color: 'from-indigo-500 to-indigo-600',  path: undefined },
  ] : []

  const projectStatCards = [
    { label: 'Total Projects',  value: projects.length,          color: 'from-teal-500 to-teal-600',     path: '/projects' },
    { label: 'Active Projects', value: activeProjects.length,   color: 'from-orange-500 to-orange-600', path: '/projects' },
    { label: 'Completed',       value: completedProjects.length, color: 'from-emerald-500 to-emerald-600', path: '/projects' },
  ]

  return (
    <IonPage>
      <MobileLayout title="Dashboard" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-full">
          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                </h2>
                <p className="text-primary-200 text-xs mt-1">
                  {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </p>
                <p className="text-primary-200 text-xs">{user?.designation}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white/20">
                  {dashboardStats?.total ?? '—'}
                </div>
                <div className="text-xs text-primary-200">Tasks Total</div>
              </div>
            </div>
          </div>

          {/* ── Task stat cards ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">My Tasks</h3>
            {isLoading && !dashboardStats ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <IonCard key={i} className="m-0">
                    <IonCardContent className="p-3">
                      <IonSkeletonText animated style={{ height: '32px', borderRadius: 8 }} />
                      <IonSkeletonText animated style={{ height: '14px', width: '70%', marginTop: 6 }} />
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {taskStatCards.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => stat.path && history.push(stat.path)}
                    className={`bg-gradient-to-br ${stat.color} rounded-2xl p-3 text-white ${stat.path ? 'cursor-pointer' : ''}`}
                  >
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs text-white/80 mt-0.5 leading-tight">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ── Project stat cards ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Projects</h3>
              <button onClick={() => history.push('/projects')} className="text-xs text-primary-600 dark:text-primary-400">
                View all
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {projectStatCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 + i * 0.04 }}
                  onClick={() => history.push(stat.path)}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-3 text-white cursor-pointer`}
                >
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs text-white/80 mt-0.5 leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Active projects progress ── */}
          <IonCard className="m-0">
            <IonCardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Active Projects</h3>
                <button onClick={() => history.push('/projects')} className="text-xs text-primary-600 dark:text-primary-400">
                  See all
                </button>
              </div>
              <div className="space-y-3">
                {activeProjects.slice(0, 5).map(project => (
                  <div
                    key={project.id}
                    onClick={() => history.push(`/projects/${project.id}`)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{project.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                        {project.progress}%
                      </span>
                    </div>
                    <IonProgressBar
                      value={project.progress / 100}
                      style={{ '--background': '#e2e8f0', borderRadius: 4, height: 5, '--progress-background': project.color } as any}
                    />
                    <div className="flex justify-between mt-0.5">
                      <span className="text-xs text-gray-400">{project.completedTasks} / {project.totalTasks} tasks</span>
                      <span className="text-xs text-gray-400">Due {format(new Date(project.dueDate), 'MMM dd')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>

          {/* ── Tasks per Project chart ── */}
          <IonCard className="m-0">
            <IonCardContent>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tasks per Project</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tasksByProjectChart} layout="vertical" margin={{ left: 4, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} width={20} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="completed" name="Completed" stackId="a" fill="#059669" radius={[0,0,0,0]} />
                  <Bar dataKey="active"    name="Active"    stackId="a" fill="#4F46E5" radius={[0,0,0,0]} />
                  <Bar dataKey="total"     name="Remaining" stackId="b" fill="#e2e8f0" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </IonCardContent>
          </IonCard>

          {/* ── Project completion % chart ── */}
          <IonCard className="m-0">
            <IonCardContent>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Project Completion %</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={projectCompletionChart} margin={{ left: 4, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10 }} width={28} domain={[0, 100]} />
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Progress']} />
                  <Bar dataKey="progress" name="Progress %" radius={[4,4,0,0]}>
                    {projectCompletionChart.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </IonCardContent>
          </IonCard>

          {/* ── Weekly productivity ── */}
          <IonCard className="m-0">
            <IonCardContent>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Weekly Productivity</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData?.weeklyProductivity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={25} />
                  <Tooltip />
                  <Bar dataKey="completed" name="Done"     fill="#4F46E5" radius={[4,4,0,0]} />
                  <Bar dataKey="assigned"  name="Assigned" fill="#e0e7ff" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </IonCardContent>
          </IonCard>

          {/* ── Distribution + Monthly trend ── */}
          <div className="grid grid-cols-2 gap-3">
            <IonCard className="m-0">
              <IonCardContent>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Task Status</h3>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie
                      data={chartData?.taskDistribution || []}
                      cx="50%" cy="50%"
                      innerRadius={28} outerRadius={46}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(chartData?.taskDistribution || []).map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </IonCardContent>
            </IonCard>

            <IonCard className="m-0">
              <IonCardContent>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Monthly Trend</h3>
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={chartData?.monthlyTrend || []}>
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} width={24} domain={[60, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="#4F46E5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </IonCardContent>
            </IonCard>
          </div>

          {/* ── Recent tasks ── */}
          <IonCard className="m-0">
            <IonCardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Tasks</h3>
                <button onClick={() => history.push('/tasks')} className="text-xs text-primary-600 dark:text-primary-400">
                  View all
                </button>
              </div>
              {recentTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tasks found</p>
              ) : (
                <div className="space-y-2">
                  {recentTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => history.push(`/tasks/${task.id}`)}
                      className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                        <button
                          onClick={e => { e.stopPropagation(); history.push(`/projects/${task.projectId}`) }}
                          className="text-xs text-primary-500 hover:underline mt-0.5 text-left"
                        >
                          {task.projectName}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* ── Quick actions ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'All Tasks',     path: '/tasks',         color: 'from-primary-500 to-primary-600' },
                { label: 'My Tasks',      path: '/my-tasks',      color: 'from-indigo-500 to-indigo-600' },
                { label: 'Projects',      path: '/projects',      color: 'from-teal-500 to-teal-600' },
                { label: 'Notifications', path: '/notifications', color: 'from-purple-500 to-purple-600' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => history.push(item.path)}
                  className={`bg-gradient-to-r ${item.color} text-white rounded-xl py-4 px-3 text-sm font-semibold`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pb-6" />
        </div>
      </IonContent>
    </IonPage>
  )
}
