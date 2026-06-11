import { DailyReport, WeeklyReport, MonthlyReport, WorkLog } from '@/types'
import reportsData from '@/data/reports.json'
import worklogsData from '@/data/worklogs.json'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockReports = reportsData as any
let mockWorklogs: WorkLog[] = worklogsData as WorkLog[]

class ReportService {
  async getDailyReports(employeeId?: string, date?: string): Promise<DailyReport[]> {
    await delay(400)
    let reports: DailyReport[] = mockReports.dailyReports || []
    if (employeeId) reports = reports.filter(r => r.employeeId === employeeId)
    if (date) reports = reports.filter(r => r.date === date)
    return reports
  }

  async getWeeklyReports(employeeId?: string): Promise<WeeklyReport[]> {
    await delay(400)
    let reports: WeeklyReport[] = mockReports.weeklyReports || []
    if (employeeId) reports = reports.filter(r => r.employeeId === employeeId)
    return reports
  }

  async getMonthlyReports(employeeId?: string): Promise<MonthlyReport[]> {
    await delay(400)
    let reports: MonthlyReport[] = mockReports.monthlyReports || []
    if (employeeId) reports = reports.filter(r => r.employeeId === employeeId)
    return reports
  }

  async getTeamPerformance() {
    await delay(400)
    return mockReports.teamPerformance || []
  }

  async getChartData() {
    await delay(300)
    return mockReports.chartData || {}
  }

  async getWorklogs(employeeId?: string, date?: string): Promise<WorkLog[]> {
    await delay(300)
    let logs = [...mockWorklogs]
    if (employeeId) logs = logs.filter(l => l.employeeId === employeeId)
    if (date) logs = logs.filter(l => l.date === date)
    return logs
  }

  async addWorklog(worklog: Omit<WorkLog, 'id' | 'createdAt'>): Promise<WorkLog> {
    await delay(400)
    const newLog: WorkLog = {
      ...worklog,
      id: `wl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    mockWorklogs.push(newLog)
    return newLog
  }

  async getDashboardChartData() {
    await delay(300)
    return {
      weeklyProductivity: mockReports.chartData?.weeklyProductivity || [],
      taskDistribution: mockReports.chartData?.taskDistribution || [],
      monthlyTrend: mockReports.chartData?.monthlyTrend || [],
    }
  }
}

export const reportService = new ReportService()
