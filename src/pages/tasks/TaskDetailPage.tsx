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
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()} fill="clear">
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>
            <span className="text-sm font-mono">{currentTask.taskId}</span>
          </IonTitle>
          {hasActions && (
            <IonButtons slot="end">
              <IonButton onClick={showActionsSheet} fill="clear">
                <IonIcon slot="icon-only" icon={ellipsisVerticalOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-full pb-6">
          {/* Status bar */}
          <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-2">
              {currentTask.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={currentTask.status} />
              <PriorityBadge priority={currentTask.priority} />
              <span className="text-xs text-gray-400">{currentTask.projectName}</span>
            </div>
          </div>

          {/* Inline action buttons (when not using action sheet) */}
          {hasActions && (
            <div className="px-4 pt-4">
              <div className="flex flex-wrap gap-2">
                {canStart && (
                  <button onClick={() => handleStatusChange('in_progress')} disabled={isUpdating} className="btn-primary text-sm">
                    Start Task
                  </button>
                )}
                {canSubmit && (
                  <button
                    onClick={() => handleStatusChange('submitted')}
                    disabled={isUpdating}
                    className="text-sm font-medium py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Submit for Approval
                  </button>
                )}
                {canApprove && (
                  <>
                    <button
                      onClick={() => { setApprovalAction('approve'); setShowApprovalModal(true) }}
                      className="text-sm font-medium py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { setApprovalAction('reject'); setShowApprovalModal(true) }}
                      className="btn-danger text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                {canReopen && (
                  <button onClick={() => handleStatusChange('in_progress')} disabled={isUpdating} className="btn-secondary text-sm">
                    Reopen Task
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Progress update */}
          {currentTask.status === 'in_progress' && isAssignee && (
            <IonCard className="mx-4 mt-4 m-0">
              <IonCardContent>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Update Progress</h3>
                <div className="flex items-center gap-3 mb-3">
                  <IonProgressBar
                    value={localProgress / 100}
                    style={{ flex: 1, height: 8, borderRadius: 4 } as any}
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-12 text-right">
                    {localProgress}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PROGRESS_STEPS.map(step => (
                    <button
                      key={step}
                      onClick={() => handleProgressUpdate(step)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        localProgress === step
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step}%
                    </button>
                  ))}
                </div>
              </IonCardContent>
            </IonCard>
          )}

          {/* Details */}
          <IonCard className="mx-4 mt-4 m-0">
            <IonCardContent>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Task Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Assigned To', value: currentTask.assignedToName },
                  { label: 'Assigned By', value: currentTask.assignedByName },
                  { label: 'Due Date',    value: format(new Date(currentTask.dueDate), 'MMM dd, yyyy') },
                  { label: 'Est. Hours',  value: `${currentTask.estimatedHours}h` },
                  { label: 'Actual Hrs',  value: currentTask.actualHours ? `${currentTask.actualHours}h` : '—' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-primary-600 rounded-full" style={{ width: `${currentTask.progress}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{currentTask.progress}%</span>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Description */}
          <IonCard className="mx-4 mt-3 m-0">
            <IonCardContent>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {currentTask.description}
              </p>
            </IonCardContent>
          </IonCard>

          {/* Tags */}
          {currentTask.tags.length > 0 && (
            <div className="mx-4 mt-3">
              <div className="flex flex-wrap gap-2">
                {currentTask.tags.map(tag => (
                  <IonChip key={tag} outline color="primary" style={{ '--background': 'transparent' } as any}>
                    <IonLabel>#{tag}</IonLabel>
                  </IonChip>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <IonCard className="mx-4 mt-3 m-0">
            <IonCardContent>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Attachments ({currentTask.attachments?.length || 0})
              </h3>
              {currentTask.attachments?.map(att => (
                <div key={att.id} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
                  <span className="text-lg">📎</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{att.originalName}</p>
                    <p className="text-xs text-gray-400">{(att.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ))}
              {isAssignee && (
                <FileUploader
                  onFilesAdded={files =>
                    presentToast({ message: `${files.length} file(s) staged for upload`, duration: 2000, color: 'success', position: 'bottom' })
                  }
                  existingCount={currentTask.attachments?.length || 0}
                />
              )}
            </IonCardContent>
          </IonCard>

          {/* Comments */}
          <IonCard className="mx-4 mt-3 m-0">
            <IonCardContent>
              <CommentBox
                comments={currentTask.comments || []}
                onAdd={handleAddComment}
                onEdit={(commentId, content) => editComment(currentTask.id, commentId, content)}
                onDelete={commentId => deleteComment(currentTask.id, commentId)}
              />
            </IonCardContent>
          </IonCard>

          {/* Activity history */}
          <IonCard className="mx-4 mt-3 m-0">
            <IonCardContent>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Activity History</h3>
              <div className="space-y-3">
                {[...(currentTask.activityHistory || [])].reverse().map(activity => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        by {activity.performedByName} • {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>

      {/* Approval Modal */}
      <IonModal
        isOpen={showApprovalModal}
        onDidDismiss={() => { setShowApprovalModal(false); setApprovalComment('') }}
        initialBreakpoint={0.6}
        breakpoints={[0, 0.6, 0.9]}
      >
        <div className="p-6 pt-8">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
            {approvalAction === 'approve' ? 'Approve Task' : 'Reject Task'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Please provide a comment explaining your decision.
          </p>
          <textarea
            value={approvalComment}
            onChange={e => setApprovalComment(e.target.value)}
            placeholder="Enter your comment..."
            rows={4}
            className="input-field text-sm resize-none mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setShowApprovalModal(false); setApprovalComment('') }}
              className="flex-1 btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleApproval}
              disabled={!approvalComment.trim() || isUpdating}
              className={`flex-1 text-sm font-medium py-2 px-4 rounded-lg disabled:opacity-50 text-white ${
                approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
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
