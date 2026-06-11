import React, { useState } from 'react'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { Comment } from '@/types'
import { useAuthStore } from '@/store'

interface CommentBoxProps {
  comments: Comment[]
  onAdd: (content: string) => Promise<void>
  onEdit: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  isLoading?: boolean
}

export const CommentBox: React.FC<CommentBoxProps> = ({
  comments,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const { user } = useAuthStore()
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)
    try {
      await onAdd(newComment.trim())
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return
    setIsSubmitting(true)
    try {
      await onEdit(commentId, editContent.trim())
      setEditingId(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <img
              src={comment.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`}
              alt={comment.authorName}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {comment.authorName}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400 italic">(edited)</span>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="input-field text-sm resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              )}
            </div>

            {user && user.id === comment.authorId && editingId !== comment.id && (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(comment)}
                  className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add comment */}
      <div className="flex gap-3">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
          alt={user?.name}
          className="w-8 h-8 rounded-full flex-shrink-0 object-cover bg-gray-100"
        />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="input-field text-sm resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd()
            }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">Ctrl+Enter to submit</span>
            <button
              onClick={handleAdd}
              disabled={!newComment.trim() || isSubmitting}
              className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
