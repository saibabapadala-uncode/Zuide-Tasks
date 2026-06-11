import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IonPage, IonContent, useIonToast, useIonLoading } from '@ionic/react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'
import { LoginCredentials } from '@/types'

export const LoginPage: React.FC = () => {
  const history = useHistory()
  const { login, isAuthenticated, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [presentToast] = useIonToast()
  const [presentLoading, dismissLoading] = useIonLoading()

  useEffect(() => {
    if (isAuthenticated) history.replace('/dashboard')
  }, [isAuthenticated])

  useEffect(() => {
    if (error) {
      presentToast({ message: error, duration: 3000, color: 'danger', position: 'top' })
      clearError()
    }
  }, [error])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    defaultValues: { employeeId: '', email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (data: LoginCredentials) => {
    await presentLoading({ message: 'Signing in...', spinner: 'crescent' })
    try {
      await login(data)
      await dismissLoading()
      presentToast({ message: 'Welcome back!', duration: 1500, color: 'success', position: 'top' })
      history.replace('/dashboard')
    } catch {
      await dismissLoading()
    }
  }

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-full bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-8 py-8 text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-black text-2xl">Z</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Zuide Tasks</h1>
                <p className="text-primary-200 text-sm mt-1">Employee Task Management Platform</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Employee ID
                  </label>
                  <input
                    {...register('employeeId', { required: 'Employee ID is required' })}
                    placeholder="e.g. EMP001"
                    className="input-field"
                    autoCapitalize="characters"
                    autoCorrect="off"
                  />
                  {errors.employeeId && (
                    <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                    })}
                    type="email"
                    placeholder="you@company.com"
                    className="input-field"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Minimum 4 characters' } })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => history.push('/forgot-password')}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 font-semibold"
                >
                  Sign In
                </button>

                {/* Demo credentials */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Demo Credentials:</p>
                  <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
                    <p><strong>Employee:</strong> EMP005 / james.martinez@zuide.com / pass</p>
                    <p><strong>Manager:</strong> EMP002 / sarah.chen@zuide.com / pass</p>
                    <p><strong>Admin:</strong> EMP001 / alex.johnson@zuide.com / pass</p>
                  </div>
                </div>
              </form>
            </div>

            <p className="text-center text-xs text-primary-300 mt-4">
              © 2026 Zuide Technologies. All rights reserved.
            </p>
          </motion.div>
        </div>
      </IonContent>
    </IonPage>
  )
}
