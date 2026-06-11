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
        <div className="min-h-full bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
              <button
                onClick={() => history.goBack()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
              >
                ← Back to Login
              </button>

              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Sent!</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Enter your email and we'll send reset instructions.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full btn-primary py-3 font-semibold disabled:opacity-60"
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
