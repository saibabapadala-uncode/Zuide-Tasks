import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
} from '@ionic/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { AppHeader } from '@/layouts/AppHeader'
import { useAuthStore, useTaskStore } from '@/store'
import projectsData from '@/data/projects.json'

interface Project {
  id: string; name: string; color: string; status: string
  progress: number; totalTasks: number; completedTasks: number
  managerName: string; dueDate: string; teamMembers: string[]
}

const projects: Project[] = projectsData as Project[]

export const DashboardPage: React.FC = () => {
  const history = useHistory()
  const { user }  = useAuthStore()
  const { tasks, dashboardStats, fetchTasks, refreshStats } = useTaskStore()

  const loadData = async () => {
    const role = user?.role
    const filters =
      role === 'employee' ? { assignedTo: user?.id } :
      role === 'manager'  ? { teamOf: user?.id } : undefined
    await fetchTasks(filters)
    refreshStats(
      role === 'employee' ? user?.id : undefined,
      role === 'manager'  ? user?.id : undefined,
    )
  }

  useEffect(() => { loadData() }, [user])

  const handleRefresh = (ev: any) => { loadData().finally(() => ev.detail.complete()) }

  const getGreeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  const activeProjects = projects.filter(p => p.status !== 'completed')

  // Weekly progress gauge ring specs
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (85 / 100) * circumference

  return (
    <IonPage>
      <AppHeader title="Dashboard" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4 lg:p-8 space-y-6 bg-zinc-55 dark:bg-[#09090b] min-h-full max-w-7xl mx-auto animate-fade-in">
          {/* Greeting Box / Header Card */}
          <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                {format(new Date(), 'EEEE, MMMM do')}
              </p>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-2 leading-none">
                {getGreeting()}, {user?.name?.split(' ')[0]}
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
                {user?.designation} • EMP-{user?.employeeId || '7241'}
              </p>
            </div>

            {/* Desktop Metrics Row (Aligned on the right) */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 px-5 py-3 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20 text-center min-w-[100px]">
                <p className="text-2xl font-black text-indigo-650 dark:text-indigo-400 leading-none">{dashboardStats?.total ?? 8}</p>
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">Total Tasks</p>
              </div>
              <div className="bg-sky-50 dark:bg-sky-955/10 px-5 py-3 rounded-xl border border-sky-100/50 dark:border-sky-900/20 text-center min-w-[100px]">
                <p className="text-2xl font-black text-sky-600 dark:text-sky-400 leading-none">{dashboardStats?.inProgress ?? 2}</p>
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">In Progress</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/20 px-5 py-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 text-center min-w-[100px]">
                <p className="text-2xl font-black text-zinc-700 dark:text-zinc-350 leading-none">{dashboardStats?.pending ?? 3}</p>
                <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">Pending</p>
              </div>
            </div>

            {/* Mobile Metrics Grid (Aligned below on small screens) */}
            <div className="grid grid-cols-2 lg:hidden gap-2">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/15 p-3 rounded-xl border border-indigo-100/30 dark:border-indigo-900/20">
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-405 leading-none">{dashboardStats?.total ?? 8}</p>
                <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">Total Tasks</p>
              </div>
              <div className="bg-sky-50/50 dark:bg-sky-955/10 p-3 rounded-xl border border-sky-100/30 dark:border-sky-900/20">
                <p className="text-xl font-bold text-sky-600 dark:text-sky-405 leading-none">{dashboardStats?.inProgress ?? 2}</p>
                <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">In Progress</p>
              </div>
              <div className="bg-zinc-50/50 dark:bg-zinc-800/10 p-3 rounded-xl border border-zinc-200/30 dark:border-zinc-800">
                <p className="text-xl font-bold text-zinc-650 dark:text-zinc-400 leading-none">{dashboardStats?.pending ?? 3}</p>
                <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">Pending</p>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-955/10 p-3 rounded-xl border border-rose-100/30 dark:border-rose-900/20">
                <p className="text-xl font-bold text-rose-600 dark:text-rose-455 leading-none">{dashboardStats?.todaysTasks ?? 0}</p>
                <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">Today's Due</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Active Projects (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)]">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800/40 pb-3">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Active Projects</h3>
                  <button
                    onClick={() => history.push('/projects')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                  {activeProjects.slice(0, 3).map(project => (
                    <div
                      key={project.id}
                      onClick={() => history.push(`/projects/${project.id}`)}
                      className="py-4 first:pt-0 last:pb-0 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-zinc-850 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-zinc-405 dark:text-zinc-500 font-semibold mt-0.5">Milestone: {project.name.split(' ')[0]} Integration</p>
                        </div>
                        <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">
                          {project.progress}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2.5">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      {/* Card Footer: members & date */}
                      <div className="flex items-center justify-between mt-3.5 pt-0.5">
                        {/* Overlapping member avatars */}
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {project.teamMembers.slice(0, 3).map((member, idx) => (
                            <img
                              key={idx}
                              className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-white dark:ring-[#18181b] object-cover bg-zinc-150"
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`}
                              alt="Team member"
                            />
                          ))}
                          {project.teamMembers.length > 3 && (
                            <div className="flex items-center justify-center h-5.5 w-5.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[8px] font-bold text-zinc-500 dark:text-zinc-400 ring-2 ring-white dark:ring-[#18181b]">
                              +{project.teamMembers.length - 3}
                            </div>
                          )}
                        </div>

                        {/* Due date */}
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
                          <span>Due: {format(new Date(project.dueDate), 'MMM d')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Weekly Performance (lg:col-span-1) */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#18181b] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)] text-center">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800/40 pb-3 text-left">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Weekly Performance</h3>
                </div>

                {/* Circular Gauge */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center mt-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="stroke-zinc-100 dark:stroke-zinc-800/80"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r={radius}
                      className="stroke-indigo-600 dark:stroke-indigo-400"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">85%</span>
                    <span className="text-[8px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">Completed</span>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h4 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-100 tracking-tight">Great Progress!</h4>
                  <p className="text-xs text-zinc-405 dark:text-zinc-400 mt-1 font-medium leading-relaxed px-2">
                    You've completed 12 tasks this week, which is 15% more than your average.
                  </p>
                </div>

                {/* Alert Box */}
                <div className="mt-5 flex items-center gap-3 p-3 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl text-left">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-450 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Efficiency Boost</p>
                    <p className="text-[10px] text-zinc-405 dark:text-zinc-500 mt-0.5 leading-snug">Your response time has improved by 20m.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Banner Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-650 to-indigo-800 dark:from-indigo-900/80 dark:to-indigo-950/60 rounded-xl p-6 shadow-md border border-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4.5">
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                <span className="text-xl">🚀</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">Boost your productivity</h3>
                <p className="text-xs text-indigo-100 mt-1 font-medium max-w-lg leading-relaxed">
                  Upgrade to Pro and unlock advanced automation, custom reporting tools, and unlimited priority support channels.
                </p>
              </div>
            </div>
            <button
              onClick={() => history.push('/profile')}
              className="bg-white hover:bg-zinc-50 text-indigo-700 font-bold py-2.5 px-5 rounded-lg text-xs transition-colors self-start md:self-auto shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
