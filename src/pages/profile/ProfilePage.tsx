import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonSkeletonText, useIonToast,
} from '@ionic/react'
import { MobileLayout } from '@/layouts/MobileLayout'
import { useAuthStore } from '@/store'
import { employeeService, authService } from '@/services'
import { Employee, EmployeeStats } from '@/types'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [presentToast] = useIonToast()

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PasswordForm>()
  const newPassword = watch('newPassword')

  const loadData = async () => {
    if (!user) return
    try {
      const [emp, st] = await Promise.all([
        employeeService.getEmployeeById(user.id),
        employeeService.getEmployeeStats(user.id),
      ])
      setEmployee(emp)
      setStats(st)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [user])

  const handleRefresh = (ev: any) => {
    setIsLoading(true)
    loadData().finally(() => ev.detail.complete())
  }

  const onChangePassword = async (data: PasswordForm) => {
    setIsChangingPassword(true)
    try {
      await authService.changePassword(data)
      presentToast({ message: 'Password changed successfully', duration: 2000, color: 'success', position: 'bottom' })
      setIsEditingPassword(false)
      reset()
    } catch (err: any) {
      presentToast({ message: err.message, duration: 3000, color: 'danger', position: 'bottom' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const statItems = stats ? [
    { label: 'Productivity', value: `${stats.productivityScore}%` },
    { label: 'Completed',    value: `${stats.completedTasks}` },
    { label: 'Pending',      value: `${stats.pendingTasks}` },
    { label: 'On-Time',      value: `${stats.onTimeDeliveryRate}%` },
    { label: 'Rejected',     value: `${stats.rejectedTasks}` },
    { label: 'Avg Hours',    value: `${stats.averageCompletionTime}h` },
  ] : []

  return (
    <IonPage>
      <MobileLayout title="My Profile" showNotifications={false} />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-zinc-55 dark:bg-[#09090b] min-h-full pb-6 max-w-2xl mx-auto">
          {/* Profile header card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 m-4">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <IonSkeletonText animated style={{ width: 64, height: 64, borderRadius: 12 }} />
                <div className="flex-1">
                  <IonSkeletonText animated style={{ height: 16, width: '60%' }} />
                  <IonSkeletonText animated style={{ height: 12, width: '40%', marginTop: 6 }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-250 dark:border-zinc-800">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-zinc-850 dark:text-zinc-200 truncate tracking-tight">{user?.name}</h2>
                  <p className="text-xs text-indigo-650 dark:text-indigo-400 font-bold mt-0.5">{user?.designation}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{employee?.department}</span>
                    <span className="text-zinc-300 dark:text-zinc-800">·</span>
                    <span className="text-[10px] font-mono font-semibold text-zinc-400 dark:text-zinc-500">{user?.employeeId}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                      user?.role === 'admin'
                        ? 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450'
                        : user?.role === 'manager'
                        ? 'bg-violet-50 border-violet-100 text-violet-750 dark:bg-violet-950/20 dark:border-violet-900/30 dark:text-violet-400'
                        : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400'
                    }`}>{user?.role}</span>
                  </div>
                </div>

                {stats && (
                  <div className="text-center flex-shrink-0 border-l border-zinc-150 dark:border-zinc-800 pl-4 hidden sm:block">
                    <div className="relative inline-flex">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--ion-border-color)" strokeWidth="2.5" />
                        <circle
                          cx="18" cy="18" r="15.91" fill="none"
                          stroke="#4F46E5" strokeWidth="2.5"
                          strokeDasharray={`${stats.productivityScore} ${100 - stats.productivityScore}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-850 dark:text-zinc-200">
                        {stats.productivityScore}%
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mt-1">Productivity</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Performance stats */}
          {statItems.length > 0 && (
            <div className="px-4 mb-4 animate-fade-in">
              <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest mb-3">Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statItems.map(item => {
                  let textCol = 'text-zinc-700 dark:text-zinc-200'
                  if (item.label === 'Productivity' || item.label === 'On-Time') textCol = 'text-indigo-650 dark:text-indigo-400'
                  else if (item.label === 'Completed') textCol = 'text-emerald-600 dark:text-emerald-450'
                  else if (item.label === 'Rejected') textCol = 'text-rose-600 dark:text-rose-450'
                  else if (item.label === 'Pending') textCol = 'text-amber-600 dark:text-amber-450'
                  else if (item.label === 'Avg Hours') textCol = 'text-violet-600 dark:text-violet-405'

                  return (
                    <div key={item.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-sm">
                      <p className={`text-xl font-bold tracking-tight ${textCol}`}>{item.value}</p>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1">{item.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 m-4">
            <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mb-4">Contact Info</h3>
            <div className="space-y-3">
              {[
                { label: 'Email',       value: user?.email },
                { label: 'Phone',       value: employee?.phone || '—' },
                { label: 'Department',  value: employee?.department },
                { label: 'Join Date',   value: employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString() : '—' },
                { label: 'Manager',     value: employee?.managerName || '—' },
                { label: 'Employee ID', value: user?.employeeId },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-zinc-100/50 dark:border-zinc-850/40 last:border-0 pb-2 last:pb-0">
                  <span className="text-xs font-semibold text-zinc-405 dark:text-zinc-500">{item.label}</span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {employee?.skills && employee.skills.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 m-4">
              <h3 className="text-xs font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-widest mb-3.5">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map(skill => (
                  <span key={skill} className="text-xs bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-705 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-150 dark:border-indigo-900/30 font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Change password */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5 m-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100/50 dark:border-zinc-800/40">
              <h3 className="text-xs font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest">Change Password</h3>
              <button
                onClick={() => { setIsEditingPassword(!isEditingPassword); reset() }}
                className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline"
              >
                {isEditingPassword ? 'Cancel' : 'Change'}
              </button>
            </div>

            {isEditingPassword ? (
              <form onSubmit={handleSubmit(onChangePassword)} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Current Password</label>
                  <input
                    {...register('currentPassword', { required: 'Required' })}
                    type="password"
                    className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all duration-150"
                  />
                  {errors.currentPassword && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.currentPassword.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">New Password</label>
                  <input
                    {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    type="password"
                    className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all duration-150"
                  />
                  {errors.newPassword && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider mb-1">Confirm Password</label>
                  <input
                    {...register('confirmPassword', {
                      required: 'Required',
                      validate: v => v === newPassword || 'Passwords do not match',
                    })}
                    type="password"
                    className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all duration-150"
                  />
                  {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.confirmPassword.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full text-xs font-bold py-2.5 px-4 bg-indigo-600 hover:bg-indigo-705 text-white rounded-lg shadow-sm disabled:opacity-50 transition-all duration-150"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                Your password was last changed recently. Keep it secure and private.
              </p>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
