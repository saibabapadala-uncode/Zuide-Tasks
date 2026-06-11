import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowUpTrayIcon, DocumentIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void
  maxFiles?: number
  existingCount?: number
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesAdded,
  maxFiles = 10,
  existingCount = 0,
}) => {
  const [stagedFiles, setStagedFiles] = useState<File[]>([])

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      toast.error('Some files were rejected. Check file type and size.')
    }
    const available = maxFiles - existingCount - stagedFiles.length
    const toAdd = accepted.slice(0, available)
    setStagedFiles(prev => [...prev, ...toAdd])
    onFilesAdded(toAdd)
  }, [stagedFiles, existingCount, maxFiles, onFilesAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024,
    maxFiles: maxFiles - existingCount,
  })

  const removeStaged = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <PhotoIcon className="w-5 h-5 text-blue-500" />
    return <DocumentIcon className="w-5 h-5 text-gray-500" />
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 bg-gray-50 dark:bg-gray-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          or <span className="text-primary-600 dark:text-primary-400 font-medium">browse files</span>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          PDF, DOC, DOCX, XLS, XLSX, PNG, JPG • Max 10MB each
        </p>
      </div>

      <AnimatePresence>
        {stagedFiles.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            {getFileIcon(file)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={() => removeStaged(index)}
              className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
