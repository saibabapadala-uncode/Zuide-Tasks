import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IonPage, IonContent, useIonToast, useIonLoading } from '@ionic/react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'

interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin',
    name: 'Alex Johnson',
    email: 'manager@zuide.com',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    icon: '👑',
  },
  {
    role: 'manager',
    label: 'Team Lead',
    name: 'Sarah Chen',
    email: 'lead@zuide.com',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    icon: '⭐',
  },
  {
    role: 'employee',
    label: 'Employee',
    name: 'James Martinez',
    email: 'employee@zuide.com',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: '👤',
  },
]

export const LoginPage: React.FC = () => {
  const history = useHistory()
  const { login, isAuthenticated, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (data: LoginForm) => {
    await presentLoading({ message: 'Signing in...', spinner: 'crescent' })
    try {
      await login({ email: data.email, password: data.password, rememberMe: data.rememberMe })
      await dismissLoading()
      presentToast({ message: 'Welcome back!', duration: 1500, color: 'success', position: 'top' })
      history.replace('/dashboard')
    } catch {
      await dismissLoading()
    }
  }

  const quickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(acc.role)
    await presentLoading({ message: `Signing in as ${acc.label}...`, spinner: 'crescent' })
    try {
      await login({ email: acc.email, password: '1234' })
      await dismissLoading()
      presentToast({ message: `Welcome, ${acc.name}!`, duration: 1800, color: 'success', position: 'top' })
      history.replace('/dashboard')
    } catch {
      await dismissLoading()
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-full bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden">

              {/* Header */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/40 px-8 py-7 text-center border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-indigo-500/20">
                  <span className="text-white font-extrabold text-xl">Z</span>
                </div>
                <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Zuide Tasks</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Enterprise Task Management Platform</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="px-8 pt-6 pb-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
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
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 4, message: 'Minimum 4 characters' },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="input-field pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 bg-white dark:bg-zinc-900"
                    />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => history.push('/forgot-password')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 font-semibold mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {/* Demo accounts */}
              <div className="px-8 pb-8">
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest text-center mb-3">
                    Try a demo account · password: 1234
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map(acc => (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => quickLogin(acc)}
                        disabled={!!demoLoading}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-left ${
                          demoLoading === acc.role
                            ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/80'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <span className="text-base leading-none">{demoLoading === acc.role ? '⏳' : acc.icon}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${acc.badge}`}>
                          {acc.label}
                        </span>
                        <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 text-center leading-tight w-full truncate">
                          {acc.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mt-6">
              © 2026 Zuide Technologies. All rights reserved.
            </p>
          </motion.div>
        </div>
      </IonContent>
    </IonPage>
  )
}
