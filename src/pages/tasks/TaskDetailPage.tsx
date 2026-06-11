import React, { useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon,
  IonModal, IonCard, IonCardContent,
  IonChip, IonLabel, IonProgressBar,
  useIonToast, useIonActionSheet, useIonAlert,
} from '@ionic/react'
import { arrowBackOutline, ellipsisVerticalOutline } from 'ionicons/icons'
import { format } from 'date-fns'
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge'
import { CommentBox } from '@/components/CommentBox'
import { FileUploader } from '@/components/FileUploader'
import { LoadingState } from '@/components/LoadingState'
import { MobileLayout } from '@/layouts/MobileLayout'
import { useTaskStore, useAuthStore } from '@/store'
import { TaskStatus } from '@/types'

const PROGRESS_STEPS = [0, 10, 25, 50, 75, 90, 100]

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { user } = useAuthStore()
  const { currentTask, isLoading, fetchTaskById, updateStatus, updateProgress, addComment, editComment, deleteComment } = useTaskStore()

  const [approvalComment, setApprovalComment]       = useState('')
  const [approvalAction, setApprovalAction]         = useState<'approve' | 'reject' | null>(null)
  const [showApprovalModal, setShowApprovalModal]   = useState(false)
  const [isUpdating, setIsUpdating]                 = useState(false)
  const [localProgress, setLocalProgress]           = useState(0)
  const [presentToast]                              = useIonToast()
  const [presentActionSheet]                        = useIonActionSheet()
  const [presentAlert]                              = useIonAlert()

  useEffect(() => { fetchTaskById(id) }, [id])

  useEffect(() => {
    if (currentTask) setLocalProgress(currentTask.progress)
  }, [currentTask])

  const handleStatusChange = async (status: TaskStatus) => {
    if (!currentTask) return
    setIsUpdating(true)
    try {
      await updateStatus(currentTask.id, status)
      presentToast({ message: `Task ${status.replace('_', ' ')}`, duration: 2000, color: 'success', position: 'bottom' })
    } catch {
      presentToast({ message: 'Failed to update status', duration: 2000, color: 'danger', position: 'bottom' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProgressUpdate = async (progress: number) => {
    if (!currentTask) return
    setLocalProgress(progress)
    await updateProgress(currentTask.id, progress)
  }

  const handleApproval = async () => {
    if (!currentTask || !approvalAction) return
    if (!approvalComment.trim()) {
      presentToast({ message: 'Please add an approval comment', duration: 2000, color: 'warning', position: 'bottom' })
      return
    }
    setIsUpdating(true)
    try {
      const newStatus: TaskStatus = approvalAction === 'approve' ? 'approved' : 'rejected'
      await updateStatus(currentTask.id, newStatus, approvalComment)
      presentToast({
        message: `Task ${approvalAction}d successfully`,
        duration: 2000,
        color: approvalAction === 'approve' ? 'success' : 'danger',
        position: 'bottom',
      })
      setShowApprovalModal(false)
      setApprovalComment('')
    } catch {
      presentToast({ message: 'Failed to process approval', duration: 2000, color: 'danger', position: 'bottom' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddComment = async (content: string) => {
    if (!currentTask || !user) return
    await addComment(currentTask.id, content, user.id, user.name, user.avatar)
    presentToast({ message: 'Comment added', duration: 1500, color: 'success', position: 'bottom' })
  }

  const isAssignee = user?.id === currentTask?.assignedTo
  const isManager  = user?.role === 'manager' || user?.role === 'admin'
  const canStart   = isAssignee && currentTask?.status === 'pending'
  const canSubmit  = isAssignee && currentTask?.status === 'in_progress'
  const canApprove = isManager  && currentTask?.status === 'submitted'
  const canReopen  = isManager  && (currentTask?.status === 'rejected' || currentTask?.status === 'completed')

  const showActionsSheet = () => {
    const buttons: any[] = []
    if (canStart)   buttons.push({ text: 'Start Task',           handler: () => handleStatusChange('in_progress') })
    if (canSubmit)  buttons.push({ text: 'Submit for Approval',  handler: () => handleStatusChange('submitted') })
    if (canApprove) buttons.push({
      text: 'Approve',
      handler: () => { setApprovalAction('approve'); setShowApprovalModal(true) },
    })
    if (canApprove) buttons.push({
      text: 'Reject',
      role: 'destructive',
      handler: () => { setApprovalAction('reject'); setShowApprovalModal(true) },
    })
    if (canReopen)  buttons.push({ text: 'Reopen Task', handler: () => handleStatusChange('in_progress') })
    buttons.push({ text: 'Cancel', role: 'cancel' })
    presentActionSheet({ header: currentTask?.taskId, buttons })
  }

  const hasActions = canStart || canSubmit || canApprove || canReopen

  if (isLoading && !currentTask) return (
    <IonPage>
      <MobileLayout title="Task Detail" />
      <IonContent><div className="p-4"><LoadingState /></div></IonContent>
    </IonPage>
  )

  if (!currentTask) return (
    <IonPage>
      <MobileLayout title="Not Found" />
      <IonContent>
        <div className="p-4 text-center">
          <p className="text-gray-500 mb-4">Task not found.</p>
          <button onClick={() => history.push('/tasks')} className="btn-primary">Back to Tasks</button>
        </div>
      </IonContent>
    </IonPage>
  )

  return (
    <IonPage>
      <IonHeader className="border-b border-zinc-200/50 dark:border-zinc-800/80">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()} fill="clear" className="text-zinc-500 dark:text-zinc-400">
              <IonIcon slot="icon-only" icon={arrowBackOutline} style={{ fontSize: '18px' }} />
            </IonButton>
          </IonButtons>
          <IonTitle>
            <span className="text-xs font-mono font-bold text-zinc-450 dark:text-zinc-500 tracking-wider">{currentTask.taskId}</span>
          </IonTitle>
          {hasActions && (
            <IonButtons slot="end">
              <IonButton onClick={showActionsSheet} fill="clear" className="text-zinc-500 dark:text-zinc-400">
                <IonIcon slot="icon-only" icon={ellipsisVerticalOutline} style={{ fontSize: '18px' }} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="bg-zinc-50 dark:bg-[#09090b] min-h-full pb-8">
          {/* Main Title & Status bar */}
          <div className="p-5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2 leading-tight">
                {currentTask.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <StatusBadge status={currentTask.status} />
                <PriorityBadge priority={currentTask.priority} />
                <span className="text-zinc-300 dark:text-zinc-750">·</span>
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">{currentTask.projectName}</span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
              
              {/* Left Column: Description, Attachments, Comments, History */}
              <div className="space-y-4">
                
                {/* Description */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Description</h3>
                  <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {currentTask.description || <span className="text-zinc-400 dark:text-zinc-600 italic">No description provided.</span>}
                  </p>
                </div>

                {/* Tags */}
                {currentTask.tags && currentTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {currentTask.tags.map(tag => (
                      <span key={tag} className="text-xs bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-150 dark:border-indigo-900/30 font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Attachments */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
                    Attachments ({currentTask.attachments?.length || 0})
                  </h3>
                  
                  {currentTask.attachments && currentTask.attachments.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {currentTask.attachments.map(att => (
                        <div key={att.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-[#18181b]/30 border border-zinc-100 dark:border-zinc-800/60 rounded-lg hover:border-zinc-200 dark:hover:border-zinc-700/80 transition-colors">
                          <span className="text-lg text-zinc-400">📎</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate">{att.originalName}</p>
                            <p className="text-[10px] font-semibold text-zinc-400">{(att.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 dark:text-zinc-550 mb-4">No attachments yet.</p>
                  )}

                  {isAssignee && (
                    <div className="mt-2">
                      <FileUploader
                        onFilesAdded={files =>
                          presentToast({ message: `${files.length} file(s) staged for upload`, duration: 2000, color: 'success', position: 'bottom' })
                        }
                        existingCount={currentTask.attachments?.length || 0}
                      />
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                  <CommentBox
                    comments={currentTask.comments || []}
                    onAdd={handleAddComment}
                    onEdit={(commentId, content) => editComment(currentTask.id, commentId, content)}
                    onDelete={commentId => deleteComment(currentTask.id, commentId)}
                  />
                </div>

                {/* Activity history */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Activity History</h3>
                  <div className="space-y-4">
                    {[...(currentTask.activityHistory || [])].reverse().map((activity, idx) => (
                      <div key={activity.id} className="flex gap-3 text-xs relative">
                        {idx < (currentTask.activityHistory || []).length - 1 && (
                          <div className="absolute left-[5px] top-[14px] bottom-[-20px] w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                        )}
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-650 mt-1 flex-shrink-0 border-2 border-white dark:border-zinc-900 z-10" />
                        <div>
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200 leading-snug">{activity.description}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-semibold">
                            by {activity.performedByName} • {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Actions, Progress, Details */}
              <div className="space-y-4">
                
                {/* Actions Panel */}
                {hasActions && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3.5">Actions</h3>
                    <div className="flex flex-col gap-2">
                      {canStart && (
                        <button onClick={() => handleStatusChange('in_progress')} disabled={isUpdating} className="w-full text-xs font-bold py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all duration-150">
                          Start Task
                        </button>
                      )}
                      {canSubmit && (
                        <button
                          onClick={() => handleStatusChange('submitted')}
                          disabled={isUpdating}
                          className="w-full text-xs font-bold py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all duration-150"
                        >
                          Submit for Approval
                        </button>
                      )}
                      {canApprove && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setApprovalAction('approve'); setShowApprovalModal(true) }}
                            className="flex-1 text-xs font-bold py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all duration-150"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setApprovalAction('reject'); setShowApprovalModal(true) }}
                            className="flex-1 text-xs font-bold py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all duration-150"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {canReopen && (
                        <button onClick={() => handleStatusChange('in_progress')} disabled={isUpdating} className="w-full text-xs font-bold py-2.5 px-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all duration-150">
                          Reopen Task
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Card */}
                {currentTask.status === 'in_progress' && isAssignee && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3.5">Update Progress</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${localProgress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 w-10 text-right">
                        {localProgress}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PROGRESS_STEPS.map(step => (
                        <button
                          key={step}
                          onClick={() => handleProgressUpdate(step)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all duration-150 ${
                            localProgress === step
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {step}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Task Details Info Card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm p-5">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Task Details</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Assigned To', value: currentTask.assignedToName },
                      { label: 'Assigned By', value: currentTask.assignedByName },
                      { label: 'Due Date',    value: format(new Date(currentTask.dueDate), 'MMM dd, yyyy') },
                      { label: 'Est. Hours',  value: `${currentTask.estimatedHours}h` },
                      { label: 'Actual Hrs',  value: currentTask.actualHours ? `${currentTask.actualHours}h` : '—' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-0.5 border-b border-zinc-100/50 dark:border-zinc-800/40 last:border-b-0 pb-2 last:pb-0">
                        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-550">{item.label}</span>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-550">Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${currentTask.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{currentTask.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </IonContent>

      {/* Approval Modal */}
      <IonModal
        isOpen={showApprovalModal}
        onDidDismiss={() => { setShowApprovalModal(false); setApprovalComment('') }}
        initialBreakpoint={0.6}
        breakpoints={[0, 0.6, 0.9]}
      >
        <div className="p-6 pt-8 bg-white dark:bg-zinc-900 h-full flex flex-col">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-1">
            {approvalAction === 'approve' ? 'Approve Task' : 'Reject Task'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 font-semibold">
            Please provide a comment explaining your decision.
          </p>
          <textarea
            value={approvalComment}
            onChange={e => setApprovalComment(e.target.value)}
            placeholder="Enter your comment..."
            rows={4}
            className="w-full p-3 text-xs bg-zinc-55 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all duration-150 resize-none mb-4"
          />
          <div className="flex gap-3 mt-auto sm:mt-0">
            <button
              onClick={() => { setShowApprovalModal(false); setApprovalComment('') }}
              className="flex-1 text-xs font-bold py-2.5 px-4 border border-zinc-205 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleApproval}
              disabled={!approvalComment.trim() || isUpdating}
              className={`flex-1 text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all duration-150 disabled:opacity-50 text-white ${
                approvalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isUpdating ? 'Processing...' : approvalAction === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </IonModal>
    </IonPage>
  )
}
