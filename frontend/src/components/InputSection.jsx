import React, { useState, useRef } from 'react'

const InputSection = ({ onAnalyze, isLoading }) => {
  const [content, setContent] = useState('')
  const textAreaRef = useRef(null)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setContent(text)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
      alert('Failed to read clipboard. Please paste manually.')
    }
  }

  const handleAnalyze = () => {
    if (!content.trim()) {
      alert('Please enter a message or link to analyze')
      return
    }
    onAnalyze(content)
  }

  const handleShare = async () => {
    if (!content.trim()) {
      alert('Please enter a message or link first')
      return
    }
    if (!navigator.share) {
      alert('Share is not supported on this device. You can still paste manually.')
      return
    }
    try {
      await navigator.share({
        title: 'PhishGuard AI',
        text: content
      })
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    }
  }

  const handleClear = () => {
    setContent('')
    textAreaRef.current?.focus()
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="text-blue-400 mr-2">🛡️</span>
        Analyze Message or Link
      </h2>
      <p className="text-sm text-gray-400 mb-4">Paste or Share Message/Link</p>
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your message, link, or text here..."
        className="input-field mb-4 h-32 resize-none"
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Analyzing...
            </>
          ) : (
            <>
              <span className="mr-2">🔍</span>
              Analyze
            </>
          )}
        </button>
        <button
          onClick={handlePaste}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-50 flex items-center justify-center"
        >
          <span className="mr-2">📋</span>
          Paste
        </button>
        <button
          onClick={handleShare}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-50 flex items-center justify-center"
        >
          <span className="mr-2">📤</span>
          Share
        </button>
        <button
          onClick={handleClear}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-50"
        >
          <span className="mr-2">✕</span>
          Clear
        </button>
      </div>
    </div>
  )
}

export default InputSection
