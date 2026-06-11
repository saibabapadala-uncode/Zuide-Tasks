import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IonPage, IonContent, useIonToast } from '@ionic/react'
import { motion } from 'framer-motion'
import { authService } from '@/services'

interface FormData {
  email: string
}

export const ForgotPasswordPage: React.FC = () => {
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [presentToast] = useIonToast()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch (err: any) {
      presentToast({ message: err.message, duration: 3000, color: 'danger', position: 'top' })
    } finally {
      setIsLoading(false)
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
            <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] p-8">
              <button
                onClick={() => history.goBack()}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6 uppercase tracking-wider transition-colors"
              >
                ← Back to Login
              </button>

              {sent ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1.5 tracking-tight">Email Sent!</h2>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">
                    Password reset instructions have been sent to your email address.
                  </p>
                  <button
                    onClick={() => history.push('/login')}
                    className="mt-6 btn-primary w-full"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-indigo-500/10">
                      <span className="text-xl">✉️</span>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Forgot Password?</h2>
                    <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-1 font-medium leading-relaxed">
                      Enter your email and we'll send reset instructions.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5">
                        Email Address
                      </label>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                        })}
                        type="email"
                        placeholder="you@company.com"
                        className="input-field"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-rose-500 font-semibold">{errors.email.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full btn-primary py-3 font-semibold disabled:opacity-65"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </IonContent>
    </IonPage>
  )
}

