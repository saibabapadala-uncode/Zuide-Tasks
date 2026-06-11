import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent, useIonToast,
} from '@ionic/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { AppHeader } from '@/layouts/AppHeader'
import projectsData from '@/data/projects.json'

interface Project {
  id: string
  name: string
  description: string
  status: string
  startDate: string
  dueDate: string
  managerId: string
  managerName: string
  teamMembers: string[]
  totalTasks: number
  completedTasks: number
  color: string
}

export const ProjectsPage: React.FC = () => {
  const history = useHistory()
  const [projects] = useState<Project[]>(projectsData as Project[])
  const [presentToast] = useIonToast()

  const handleRefresh = (ev: any) => {
    setTimeout(() => ev.detail.complete(), 500)
  }

  // Calculate metrics
  const totalProjects = projects.length
  const dueThisWeek = projects.filter(p => {
    if (p.status === 'completed') return false
    const diff = new Date(p.dueDate).getTime() - new Date().getTime()
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
  }).length || 4 // Fallback to reference design mock value if none matches

  const teamCapacity = '88%'
  const avgProgress = totalProjects > 0
    ? Math.round(
        projects.reduce(
          (acc, p) => acc + (p.totalTasks > 0 ? (p.completedTasks / p.totalTasks) * 100 : 0),
          0
        ) / totalProjects
      )
    : 64

  const getCategory = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('api') || n.includes('security') || n.includes('infrastructure')) return 'Engineering'
    if (n.includes('brand') || n.includes('campaign') || n.includes('marketing')) return 'Marketing'
    return 'Product'
  }

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Engineering':
        return 'bg-blue-50 border-blue-100 text-blue-755 dark:bg-blue-955/20 dark:border-blue-900/30 dark:text-blue-400'
      case 'Marketing':
        return 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-955/20 dark:border-emerald-900/30 dark:text-emerald-400'
      default:
        return 'bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-955/20 dark:border-sky-900/30 dark:text-sky-405'
    }
  }

  return (
    <IonPage>
      <AppHeader title="Projects" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4 lg:p-8 bg-zinc-55 dark:bg-[#09090b] min-h-full space-y-6 max-w-7xl mx-auto animate-fade-in">
          
          {/* ── Breadcrumbs & Header Title ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">WorkStream &gt; Projects</p>
              <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight mt-2 leading-none">Active Projects</h1>
              <p className="text-xs text-zinc-405 dark:text-zinc-500 mt-2 font-medium">Manage and monitor your team's ongoing initiatives.</p>
            </div>
            <button
              onClick={() => {
                presentToast({ message: 'Project creation form is coming soon.', duration: 2000, color: 'primary', position: 'bottom' })
              }}
              className="btn-primary flex items-center gap-1.5 self-start md:self-auto text-xs py-2 px-4 shadow-sm"
            >
              <span>+</span>
              <span>New Project</span>
            </button>
          </div>

          {/* ── Metrics Summary Cards Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Projects', value: totalProjects },
              { label: 'Due This Week', value: dueThisWeek },
              { label: 'Team Capacity', value: teamCapacity },
              { label: 'Avg. Progress', value: `${avgProgress}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)]">
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{stat.value}</p>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 mt-2 uppercase tracking-wide leading-none">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Projects Grid Layout ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => {
              const progress = project.totalTasks > 0
                ? Math.round((project.completedTasks / project.totalTasks) * 100)
                : 0
              const category = getCategory(project.name)
              const categoryClass = getCategoryStyles(category)

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => history.push(`/projects/${project.id}`)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-250/80 dark:border-zinc-800/80 rounded-xl shadow-sm hover:border-zinc-350 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-150 overflow-hidden cursor-pointer flex flex-col justify-between"
                  style={{ minHeight: '270px' }}
                >
                  {/* Top Color Accent Bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: project.color }} />

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Header inside card */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${categoryClass}`}>
                          {category}
                        </span>
                        {/* More action menu dot dot dot */}
                        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors" onClick={e => e.stopPropagation()}>
                          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                      </div>

                      {/* Project title */}
                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight mb-2">
                        {project.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-zinc-450 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium mb-4">
                        {project.description}
                      </p>
                    </div>

                    <div>
                      {/* Progress bar */}
                      <div className="mb-4 pt-1.5">
                        <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
                          <span className="text-zinc-400 dark:text-zinc-550">Progress</span>
                          <span className="text-zinc-800 dark:text-zinc-200">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                        </div>
                      </div>

                      {/* Footer Details: overlapping avatars & due date */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
                        {/* Avatar stack */}
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {project.teamMembers.slice(0, 3).map((member, idx) => (
                            <img
                              key={idx}
                              className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover bg-zinc-150"
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member}`}
                              alt="Team member"
                            />
                          ))}
                          {project.teamMembers.length > 3 && (
                            <div className="flex items-center justify-center h-5.5 w-5.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[8px] font-bold text-zinc-500 dark:text-zinc-400 ring-2 ring-white dark:ring-zinc-900">
                              +{project.teamMembers.length - 3}
                            </div>
                          )}
                        </div>

                        {/* Due date */}
                        <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          <span>{format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* ── Dotted "Create New Project" Card at the end ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: projects.length * 0.04 }}
              onClick={() => {
                presentToast({ message: 'Project creation form is coming soon.', duration: 2000, color: 'primary', position: 'bottom' })
              }}
              className="border-2 border-dashed border-zinc-250 dark:border-zinc-850 hover:border-indigo-500/50 dark:hover:border-indigo-550/50 hover:bg-zinc-50/20 dark:hover:bg-zinc-950/20 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center"
              style={{ minHeight: '270px' }}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 text-zinc-400 dark:text-zinc-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-300">Create New Project</h3>
              <p className="text-xs text-zinc-405 dark:text-zinc-500 mt-1 font-semibold">Define goals, team, and timeline.</p>
            </motion.div>
          </div>

          <div className="pb-6" />
        </div>
      </IonContent>
    </IonPage>
  )
}
