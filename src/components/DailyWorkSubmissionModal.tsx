import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  IonModal, IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, useIonToast,
} from '@ionic/react'
import { taskService } from '@/services'
import { useAuthStore } from '@/store'

interface SubmissionFormData {
  workSummary: string
  blockers: string
  tomorrowPlan: string
  workingHours: number
}

interface DailyWorkSubmissionModalProps {
  isOpen: boolean
  completedTaskIds: string[]
  pendingTaskIds: string[]
  onClose: () => void
  onSubmitted: () => void
}

export const DailyWorkSubmissionModal: React.FC<DailyWorkSubmissionModalProps> = ({
  isOpen,
  completedTaskIds,
  pendingTaskIds,
  onClose,
  onSubmitted,
}) => {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [presentToast] = useIonToast()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubmissionFormData>({
    defaultValues: { workingHours: 8 },
  })

  const handleClose = () => {
    if (!submitted) {
      reset()
    }
    onClose()
  }

  const onSubmit = async (data: SubmissionFormData) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      await taskService.submitDailyWork({
        employeeId: user.id,
        date: new Date().toISOString().split('T')[0],
        completedTasks: completedTaskIds,
        pendingTasks: pendingTaskIds,
        workSummary: data.workSummary,
        blockers: data.blockers,
        tomorrowPlan: data.tomorrowPlan,
        workingHours: data.workingHours,
      })
      setSubmitted(true)
      presentToast({ message: 'Daily work summary submitted!', duration: 2000, color: 'success', position: 'top' })
      setTimeout(() => {
        setSubmitted(false)
        reset()
        onSubmitted()
      }, 1500)
    } catch (err: any) {
      presentToast({
        message: err.message || 'Failed to submit work summary',
        duration: 3000,
        color: 'danger',
        position: 'top',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose} initialBreakpoint={0.9} breakpoints={[0, 0.9, 1]}>
      <IonPage className="bg-white dark:bg-[#09090b]">
        <IonHeader>
          <IonToolbar>
            <IonTitle><span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Daily Work Summary</span></IonTitle>
            <IonButtons slot="end">
              <button
                onClick={onSubmitted}
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200 mr-3 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
              >
                Skip
              </button>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-white dark:bg-[#09090b]">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5 border border-emerald-500/20 animate-fade-in">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">Great work today!</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Your daily summary has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3 bg-white dark:bg-[#09090b] px-4">
              {/* Stats summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/5 rounded-xl p-3.5 text-center border border-emerald-500/10">
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-450">{completedTaskIds.length}</p>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">Completed</p>
                </div>
                <div className="bg-amber-500/5 rounded-xl p-3.5 text-center border border-amber-500/10">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-450">{pendingTaskIds.length}</p>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">Pending</p>
                </div>
              </div>

              {/* Working hours */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                  Working Hours Today <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('workingHours', {
                    required: 'Required',
                    min: { value: 1, message: 'Minimum 1 hour' },
                    max: { value: 24, message: 'Maximum 24 hours' },
                  })}
                  type="number"
                  step="0.5"
                  min="1"
                  max="24"
                  className="input-field"
                />
                {errors.workingHours && <p className="text-xs text-rose-500 mt-1">{errors.workingHours.message}</p>}
              </div>

              {/* Work summary */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                  Work Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  {...register('workSummary', { required: 'Please provide a work summary' })}
                  placeholder="Describe what you accomplished today..."
                  rows={3}
                  className="input-field resize-none text-sm"
                />
                {errors.workSummary && <p className="text-xs text-rose-500 mt-1">{errors.workSummary.message}</p>}
              </div>

              {/* Blockers */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                  Blockers / Issues
                </label>
                <textarea
                  {...register('blockers')}
                  placeholder="Any blockers or issues? (Type 'None' if no blockers)"
                  rows={2}
                  className="input-field resize-none text-sm"
                />
              </div>

              {/* Tomorrow plan */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
                  Plan for Tomorrow <span className="text-rose-500">*</span>
                </label>
                <textarea
                  {...register('tomorrowPlan', { required: 'Please describe your plan for tomorrow' })}
                  placeholder="What do you plan to work on tomorrow?"
                  rows={2}
                  className="input-field resize-none text-sm"
                />
                {errors.tomorrowPlan && <p className="text-xs text-rose-500 mt-1">{errors.tomorrowPlan.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 font-semibold disabled:opacity-65"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Daily Summary'}
              </button>
            </form>
          )}
        </IonContent>
      </IonPage>
    </IonModal>
  )
}
