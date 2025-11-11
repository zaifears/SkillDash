'use client'
import React, { useState, useCallback } from 'react'
import { fetchWithRetry } from '@/lib/utils/apiClient' // ✅ NEW IMPORT

interface FileUploadProps {
  onFileProcessed: (feedback: any, fileName: string) => void
  onError: (error: string) => void
  onClearError?: () => void  // 🆕 NEW: To clear errors
  disabled?: boolean
  industryPreference?: string
  userId?: string
  jobDescription?: string
  error?: string  // 🆕 NEW: Error prop from parent
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  onError,
  onClearError,
  disabled,
  industryPreference = 'general',
  userId,
  jobDescription,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 🔧 FIXED: Clear error when user interacts
  const clearError = useCallback(() => {
    if (onClearError) {
      onClearError()
    }
  }, [onClearError])

  const processFile = useCallback(async (file: File) => {
    // Clear any previous errors
    clearError()
    
    // Validate file size first
    if (file.size > 200 * 1024) { // 200KB
      onError(`File too large (${Math.round(file.size / 1024)}KB). Maximum size is 200KB. Please compress your PDF at https://www.ilovepdf.com/compress_pdf`)
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      onError('Invalid file type. We only process PDF and DOCX files less than 200KB.')
      return
    }

    setIsProcessing(true)
    
    try {
      console.log('🔍 Processing file:', file.name, file.type, file.size)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('industryPreference', industryPreference)
      if (userId) formData.append('userId', userId)
      if (jobDescription) formData.append('jobDescription', jobDescription)
      
      console.log('📤 Sending to /api/resume-feedback...')
      
      // ✅ CHANGED: Use fetchWithRetry
      const response = await fetchWithRetry('/api/resume-feedback', {
        method: 'POST',
        body: formData,
        maxRetries: 3,
        retryDelay: 1000
      })
      
      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }))
        
        // ✅ NEW: Log error
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: `File upload error: ${errorData.error || 'Unknown'}`,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            endpoint: '/api/resume-feedback',
            status: response.status,
            fileSize: file.size,
            fileType: file.type
          })
        }).catch(() => {})
        
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log('✅ Success result:', result)
      
      if (result.error) {
        onError(result.error)
        return
      }
      
      // Success - pass feedback to parent
      onFileProcessed(result.feedback, file.name)
      
    } catch (error: any) {
      console.error('❌ File processing error:', error)
      
      // ✅ NEW: Log client error
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `File processing failed: ${error.message}`,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          endpoint: '/api/resume-feedback',
          fileSize: file.size,
          fileType: file.type
        })
      }).catch(() => {})
      
      onError(`Processing failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }, [onFileProcessed, onError, clearError, industryPreference, userId, jobDescription])

  // 🔧 FIXED: Improved drag and drop handling
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    clearError() // Clear error when user starts dragging
  }, [clearError])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (disabled || isProcessing) return
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file) {
      processFile(file)
    }
  }, [disabled, isProcessing, processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearError() // Clear error when user selects file
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // Reset input
    e.target.value = ''
  }, [processFile, clearError])

  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      clearError() // Clear error when user clicks
      document.getElementById('file-input')?.click()
    }
  }, [disabled, isProcessing, clearError])

  return (
    <div className="w-full">
      {/* 🔧 FIXED: Error display - only shows when there's an error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Upload Error
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.includes('ilovepdf.com') ? (
                  <div>
                    {error.split('https://www.ilovepdf.com/compress_pdf')[0]}
                    <a 
                      href="https://www.ilovepdf.com/compress_pdf" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      https://www.ilovepdf.com/compress_pdf
                    </a>
                  </div>
                ) : (
                  error
                )}
              </div>
            </div>
            <button
              onClick={clearError}
              className="ml-3 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 🔧 FIXED: Improved drag and drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-105' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isProcessing}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {isProcessing ? 'AI is analyzing your resume...' : 'Upload Your Resume'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Drag and drop your PDF or DOCX file here, or click to browse
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <strong>Requirements:</strong> We only process PDF/DOCX files less than 200KB
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <strong>Need to compress?</strong> Use{' '}
                <a 
                  href="https://www.ilovepdf.com/compress_pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:text-blue-600 underline"
                  onClick={(e) => e.stopPropagation()} // Prevent triggering file input
                >
                  ilovepdf.com/compress_pdf
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
