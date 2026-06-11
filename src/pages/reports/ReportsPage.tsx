import React, { useEffect, useState } from 'react'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardContent, IonSkeletonText,
} from '@ionic/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area,
} from 'recharts'
import { motion } from 'framer-motion'
import { MobileLayout } from '@/layouts/MobileLayout'
import { reportService } from '@/services'
import { useAuthStore } from '@/store'

type ReportTab = 'daily' | 'weekly' | 'monthly'

export const ReportsPage: React.FC = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<ReportTab>('weekly')
  const [isLoading, setIsLoading] = useState(true)
  const [chartData, setChartData] = useState<any>(null)
  const [dailyReports, setDailyReports] = useState<any[]>([])
  const [weeklyReports, setWeeklyReports] = useState<any[]>([])
  const [monthlyReports, setMonthlyReports] = useState<any[]>([])
  const [teamPerformance, setTeamPerformance] = useState<any[]>([])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [chart, daily, weekly, monthly, team] = await Promise.all([
        reportService.getDashboardChartData(),
        reportService.getDailyReports(user?.id),
        reportService.getWeeklyReports(user?.id),
        reportService.getMonthlyReports(user?.id),
        reportService.getTeamPerformance(),
      ])
      setChartData(chart)
      setDailyReports(daily)
      setWeeklyReports(weekly)
      setMonthlyReports(monthly)
      setTeamPerformance(team)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [user])

  const handleRefresh = (ev: any) => {
    loadData().finally(() => ev.detail.complete())
  }

  return (
    <IonPage>
      <MobileLayout title="Reports" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
          {/* Segment tabs */}
          <div className="px-4 pt-4 pb-2">
            <IonSegment
              value={activeTab}
              onIonChange={ev => setActiveTab(ev.detail.value as ReportTab)}
            >
              <IonSegmentButton value="daily"><IonLabel>Daily</IonLabel></IonSegmentButton>
              <IonSegmentButton value="weekly"><IonLabel>Weekly</IonLabel></IonSegmentButton>
              <IonSegmentButton value="monthly"><IonLabel>Monthly</IonLabel></IonSegmentButton>
            </IonSegment>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2].map(i => (
                <IonCard key={i} className="m-0">
                  <IonCardContent>
                    <IonSkeletonText animated style={{ height: 200, borderRadius: 8 }} />
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Weekly tab */}
              {activeTab === 'weekly' && (
                <motion.div key="weekly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <IonCard className="m-0">
                    <IonCardContent>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Weekly Productivity Trend</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData?.weeklyProductivity || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} width={25} />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="completed" name="Completed" stroke="#4F46E5" fill="#e0e7ff" strokeWidth={2} />
                          <Area type="monotone" dataKey="assigned" name="Assigned" stroke="#06b6d4" fill="#cffafe" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </IonCardContent>
                  </IonCard>

                  {weeklyReports.map(report => (
                    <IonCard key={report.weekStart} className="m-0">
                      <IonCardContent>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          Week of {report.weekStart}
                        </h3>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary-600">{report.completionRate}%</p>
                            <p className="text-xs text-gray-400 mt-1">Completion</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{report.totalTasksCompleted}</p>
                            <p className="text-xs text-gray-400 mt-1">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{report.totalHoursWorked}h</p>
                            <p className="text-xs text-gray-400 mt-1">Hours</p>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={report.productivityTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} width={25} />
                            <Tooltip />
                            <Bar dataKey="hoursWorked" name="Hours" fill="#4F46E5" radius={[4,4,0,0]} />
                            <Bar dataKey="tasksCompleted" name="Tasks" fill="#059669" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </motion.div>
              )}

              {/* Daily tab */}
              {activeTab === 'daily' && (
                <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {dailyReports.length === 0 ? (
                    <IonCard className="m-0">
                      <IonCardContent className="text-center py-8 text-gray-500">
                        No daily reports available
                      </IonCardContent>
                    </IonCard>
                  ) : (
                    dailyReports.map(report => (
                      <IonCard key={report.date} className="m-0">
                        <IonCardContent>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {new Date(report.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h3>
                            <div className="flex gap-4">
                              <div className="text-center">
                                <p className="text-lg font-bold text-primary-600">{report.tasksCompleted}</p>
                                <p className="text-xs text-gray-400">Done</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-blue-600">{report.hoursWorked}h</p>
                                <p className="text-xs text-gray-400">Hours</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {report.tasksDetails?.map((task: any) => (
                              <div key={task.taskId} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{task.title}</span>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  <span className="text-xs text-gray-400">{task.hoursSpent}h</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>{task.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </IonCardContent>
                      </IonCard>
                    ))
                  )}
                </motion.div>
              )}

              {/* Monthly tab */}
              {activeTab === 'monthly' && (
                <motion.div key="monthly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <IonCard className="m-0">
                    <IonCardContent>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">6-Month Trend</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData?.monthlyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} width={30} domain={[60, 100]} />
                          <Tooltip formatter={(v: any) => [`${v}%`, 'Productivity']} />
                          <Line type="monotone" dataKey="productivity" stroke="#4F46E5" strokeWidth={3} dot={{ r: 3, fill: '#4F46E5' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </IonCardContent>
                  </IonCard>

                  {monthlyReports.map(report => (
                    <IonCard key={`${report.month}-${report.year}`} className="m-0">
                      <IonCardContent>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                          {report.month} {report.year}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Performance', value: `${report.performanceScore}%` },
                            { label: 'Completed',   value: report.tasksCompleted },
                            { label: 'Assigned',    value: report.tasksAssigned },
                            { label: 'Rate',        value: `${report.completionRate}%` },
                          ].map(item => (
                            <div key={item.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              <p className="text-xl font-bold text-primary-600">{item.value}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  ))}

                  {teamPerformance.length > 0 && (
                    <IonCard className="m-0">
                      <IonCardContent>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Team Performance</h3>
                        <div className="space-y-3">
                          {teamPerformance.map(team => (
                            <div key={team.departmentId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{team.departmentName}</p>
                                <p className="text-xs text-gray-400">{team.totalEmployees} members</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-primary-600">{team.averageProductivity}%</p>
                                <p className="text-xs text-gray-400">{team.completedTasks}/{team.totalTasks}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  )}
                </motion.div>
              )}

              <div className="pb-6" />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
