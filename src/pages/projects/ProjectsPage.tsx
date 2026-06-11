import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonCard, IonCardContent, IonProgressBar, IonBadge,
} from '@ionic/react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { MobileLayout } from '@/layouts/MobileLayout'
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

const statusConfig: Record<string, { label: string; color: string }> = {
  in_progress: { label: 'In Progress', color: 'primary' },
  completed:   { label: 'Completed',   color: 'success' },
  pending:     { label: 'Planning',    color: 'warning' },
}

export const ProjectsPage: React.FC = () => {
  const history = useHistory()
  const [projects] = useState<Project[]>(projectsData as Project[])

  const handleRefresh = (ev: any) => {
    setTimeout(() => ev.detail.complete(), 500)
  }

  return (
    <IonPage>
      <MobileLayout title="Projects" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-full space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {projects.length} active project{projects.length !== 1 ? 's' : ''}
          </p>

          {projects.map((project, i) => {
            const progress = project.totalTasks > 0
              ? Math.round((project.completedTasks / project.totalTasks) * 100)
              : 0
            const config = statusConfig[project.status] || statusConfig.pending

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <IonCard
                  className="m-0 cursor-pointer"
                  onClick={() => history.push(`/projects/${project.id}`)}
                  style={{ '--background': 'var(--ion-card-background)' } as any}
                >
                  {/* Color accent bar */}
                  <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: project.color }} />

                  <IonCardContent>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: `${project.color}20` }}
                        >
                          📁
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{project.name}</h3>
                          <IonBadge color={config.color} style={{ fontSize: '11px', marginTop: 2 }}>
                            {config.label}
                          </IonBadge>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 mt-1">{project.managerName}</span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
                      </div>
                      <IonProgressBar
                        value={progress / 100}
                        color="primary"
                        style={{ '--background': '#e2e8f0', borderRadius: 4, height: 6 } as any}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">{project.completedTasks} completed</span>
                        <span className="text-xs text-gray-400">{project.totalTasks} total</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span>👥 {project.teamMembers.length} members</span>
                      <span>📅 {format(new Date(project.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </IonCardContent>
                </IonCard>
              </motion.div>
            )
          })}

          <div className="pb-6" />
        </div>
      </IonContent>
    </IonPage>
  )
}
