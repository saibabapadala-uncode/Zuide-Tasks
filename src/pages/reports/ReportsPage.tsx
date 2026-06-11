import React, { useEffect, useState } from 'react'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
  IonSkeletonText,
} from '@ionic/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts'
import { motion } from 'framer-motion'
import { reportService } from '@/services'
import { useAuthStore } from '@/store'

type ReportTab = 'daily' | 'weekly' | 'monthly'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg shadow-md text-xs">
        <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-semibold" style={{ color: p.color || p.stroke }}>
            {p.name}: <span className="text-zinc-850 dark:text-zinc-200">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

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
      <IonHeader className="border-b border-zinc-200/50 dark:border-zinc-800/80">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton className="text-zinc-550 dark:text-zinc-400" />
          </IonButtons>
          <IonTitle>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Reports</span>
          </IonTitle>
        </IonToolbar>

        {/* Tab Selection */}
        <IonToolbar style={{ '--min-height': '40px' } as any} className="bg-white dark:bg-[#09090b]">
          <div className="flex px-3 gap-2 overflow-x-auto no-scrollbar">
            {(['daily', 'weekly', 'monthly'] as ReportTab[]).map(tab => {
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
                  {active && (
                    <motion.div
                      layoutId="activeReportsTab"
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
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-zinc-50 dark:bg-[#09090b] min-h-full">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-5 shadow-sm">
                  <IonSkeletonText animated style={{ height: 200, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-4 max-w-4xl mx-auto">
              {/* Weekly tab */}
              {activeTab === 'weekly' && (
                <motion.div key="weekly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                    <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mb-4">Weekly Productivity Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={chartData?.weeklyProductivity || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--ion-border-color)" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} width={25} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="completed" name="Completed" stroke="#4F46E5" fill="rgba(79, 70, 229, 0.05)" strokeWidth={2} />
                        <Area type="monotone" dataKey="assigned" name="Assigned" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.05)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {weeklyReports.map(report => (
                    <div key={report.weekStart} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 animate-fade-in">
                      <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 tracking-tight mb-4">
                        Week of {report.weekStart}
                      </h3>
                      <div className="grid grid-cols-3 gap-3 mb-5 border-b border-zinc-105/50 dark:border-zinc-800/65 pb-4">
                        <div className="text-center">
                          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-tight">{report.completionRate}%</p>
                          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1.5">Completion</p>
                        </div>
                        <div className="text-center border-l border-zinc-100 dark:border-zinc-800/60 pl-2">
                          <p className="text-xl font-black text-emerald-600 dark:text-emerald-450 leading-tight">{report.totalTasksCompleted}</p>
                          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1.5">Completed</p>
                        </div>
                        <div className="text-center border-l border-zinc-100 dark:border-zinc-800/60 pl-2">
                          <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 leading-tight">{report.totalHoursWorked}h</p>
                          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1.5">Hours</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={report.productivityTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--ion-border-color)" />
                          <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#888' }} />
                          <YAxis tick={{ fontSize: 9, fill: '#888' }} width={25} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="hoursWorked" name="Hours" fill="#4F46E5" radius={[3,3,0,0]} />
                          <Bar dataKey="tasksCompleted" name="Tasks" fill="#10b981" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Daily tab */}
              {activeTab === 'daily' && (
                <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {dailyReports.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-6 text-center text-zinc-400 dark:text-zinc-500 font-medium">
                      No daily reports available
                    </div>
                  ) : (
                    dailyReports.map(report => (
                      <div key={report.date} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 animate-fade-in">
                        <div className="flex items-center justify-between mb-4 border-b border-zinc-100/50 dark:border-zinc-800/40 pb-3">
                          <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 tracking-tight">
                            {new Date(report.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </h3>
                          <div className="flex gap-4">
                            <div className="text-center">
                              <p className="text-base font-black text-indigo-600 dark:text-indigo-400 leading-none">{report.tasksCompleted}</p>
                              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1.5">Done</p>
                            </div>
                            <div className="text-center border-l border-zinc-100 dark:border-zinc-850 pl-4">
                              <p className="text-base font-black text-cyan-600 dark:text-cyan-400 leading-none">{report.hoursWorked}h</p>
                              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1.5">Hours</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {report.tasksDetails?.map((task: any) => (
                            <div key={task.taskId} className="flex items-center justify-between py-2 border-b border-zinc-100/50 dark:border-zinc-800/40 last:border-0 pb-2 last:pb-0">
                              <span className="text-xs font-semibold text-zinc-750 dark:text-zinc-200 truncate flex-1 leading-relaxed">{task.title}</span>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">{task.hoursSpent}h</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-50/80 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                                    : task.status === 'in_progress'
                                    ? 'bg-indigo-50/80 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400'
                                    : 'bg-zinc-50 border-zinc-100 text-zinc-650 dark:bg-zinc-800/40 dark:border-zinc-750 dark:text-zinc-400'
                                }`}>
                                  {task.status === 'completed' ? 'Done' : task.status === 'in_progress' ? 'Active' : task.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Monthly tab */}
              {activeTab === 'monthly' && (
                <motion.div key="monthly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                    <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mb-4">6-Month Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData?.monthlyTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--ion-border-color)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} width={25} domain={[60, 100]} />
                        <Tooltip formatter={(v: any) => [`${v}%`, 'Productivity']} />
                        <Line type="monotone" dataKey="productivity" stroke="#4F46E5" strokeWidth={3} dot={{ r: 3, fill: '#4F46E5' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {monthlyReports.map(report => (
                    <div key={`${report.month}-${report.year}`} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 animate-fade-in">
                      <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 tracking-tight mb-4">
                        {report.month} {report.year}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Performance', value: `${report.performanceScore}%` },
                          { label: 'Completed',   value: report.tasksCompleted },
                          { label: 'Assigned',    value: report.tasksAssigned },
                          { label: 'Rate',        value: `${report.completionRate}%` },
                        ].map(item => (
                          <div key={item.label} className="text-center p-3 bg-zinc-55 dark:bg-[#18181b]/30 border border-zinc-100 dark:border-zinc-800/60 rounded-xl">
                            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{item.value}</p>
                            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {teamPerformance.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                      <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mb-4">Team Performance</h3>
                      <div className="space-y-3">
                        {teamPerformance.map(team => (
                          <div key={team.departmentId} className="flex items-center gap-3 p-3 bg-zinc-55 dark:bg-[#18181b]/30 border border-zinc-100 dark:border-zinc-800/60 rounded-xl">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 truncate tracking-tight">{team.departmentName}</p>
                              <p className="text-xs text-zinc-405 dark:text-zinc-550 font-medium mt-0.5">{team.totalEmployees} members</p>
                            </div>
                            <div className="text-right border-l border-zinc-200/50 dark:border-zinc-800/60 pl-4 flex-shrink-0">
                              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 leading-tight">{team.averageProductivity}%</p>
                              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">{team.completedTasks}/{team.totalTasks}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
          <div className="pb-6" />
        </div>
      </IonContent>
    </IonPage>
  )
}
