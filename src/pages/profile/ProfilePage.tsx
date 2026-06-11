import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonNote, IonListHeader,
  IonAvatar, IonCard, IonCardContent, IonSkeletonText,
  useIonToast,
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
    { label: 'Productivity', value: `${stats.productivityScore}%`, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Completed',    value: `${stats.completedTasks}`,     color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { label: 'Pending',      value: `${stats.pendingTasks}`,       color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'On-Time',      value: `${stats.onTimeDeliveryRate}%`, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Rejected',     value: `${stats.rejectedTasks}`,      color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    { label: 'Avg Hours',    value: `${stats.averageCompletionTime}h`, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  ] : []

  return (
    <IonPage>
      <MobileLayout title="My Profile" showNotifications={false} />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="bg-gray-50 dark:bg-gray-900 min-h-full pb-6">
          {/* Profile header card */}
          <IonCard className="m-4">
            <IonCardContent>
              {isLoading ? (
                <div className="flex items-center gap-4">
                  <IonSkeletonText animated style={{ width: 72, height: 72, borderRadius: 16 }} />
                  <div className="flex-1">
                    <IonSkeletonText animated style={{ height: 20, width: '70%' }} />
                    <IonSkeletonText animated style={{ height: 14, width: '50%', marginTop: 6 }} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <IonAvatar style={{ width: 72, height: 72, borderRadius: 16, flexShrink: 0 }}>
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                      alt={user?.name}
                    />
                  </IonAvatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{user?.name}</h2>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{user?.designation}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{employee?.department}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs font-mono text-gray-400">{user?.employeeId}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${
                      user?.role === 'admin'   ? 'bg-red-100 text-red-600' :
                      user?.role === 'manager' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>{user?.role}</span>
                  </div>

                  {stats && (
                    <div className="text-center flex-shrink-0">
                      <div className="relative inline-flex">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="15.91" fill="none"
                            stroke="#4F46E5" strokeWidth="3"
                            strokeDasharray={`${stats.productivityScore} ${100 - stats.productivityScore}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                          {stats.productivityScore}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Productivity</p>
                    </div>
                  )}
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Performance stats */}
          {statItems.length > 0 && (
            <div className="px-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Performance</h3>
              <div className="grid grid-cols-3 gap-2">
                {statItems.map(item => (
                  <div key={item.label} className={`rounded-xl p-3 ${item.color.split(' ').slice(1).join(' ')}`}>
                    <p className={`text-xl font-bold ${item.color.split(' ')[0]}`}>{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          <IonList inset>
            <IonListHeader>
              <IonLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</IonLabel>
            </IonListHeader>

            {[
              { label: 'Email',       value: user?.email },
              { label: 'Phone',       value: employee?.phone || '—' },
              { label: 'Department',  value: employee?.department },
              { label: 'Join Date',   value: employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString() : '—' },
              { label: 'Manager',     value: employee?.managerName || '—' },
              { label: 'Employee ID', value: user?.employeeId },
            ].map(item => (
              <IonItem
                key={item.label}
                lines="inset"
                style={{ '--background': 'var(--ion-card-background)' } as any}
              >
                <IonLabel>
                  <IonNote className="text-xs text-gray-400">{item.label}</IonNote>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>

          {/* Skills */}
          {employee?.skills && employee.skills.length > 0 && (
            <IonCard className="mx-4 mt-4">
              <IonCardContent>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map(skill => (
                    <span key={skill} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* Change password */}
          <IonCard className="mx-4 mt-4">
            <IonCardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</h3>
                <button
                  onClick={() => setIsEditingPassword(!isEditingPassword)}
                  className="text-xs text-primary-600 dark:text-primary-400"
                >
                  {isEditingPassword ? 'Cancel' : 'Change'}
                </button>
              </div>

              {isEditingPassword ? (
                <form onSubmit={handleSubmit(onChangePassword)} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Current Password</label>
                    <input {...register('currentPassword', { required: 'Required' })} type="password" className="input-field text-sm" />
                    {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                    <input {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} type="password" className="input-field text-sm" />
                    {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm Password</label>
                    <input
                      {...register('confirmPassword', {
                        required: 'Required',
                        validate: v => v === newPassword || 'Passwords do not match',
                      })}
                      type="password"
                      className="input-field text-sm"
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                  <button type="submit" disabled={isChangingPassword} className="btn-primary text-sm w-full disabled:opacity-60">
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your password was last changed recently. Keep it secure.
                </p>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  )
}
