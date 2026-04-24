import React, { useState, useRef, useEffect } from 'react'
import { compareRealtimeContent } from '../services/api'

const InputSection = ({ onAnalyze, isLoading }) => {
  const [content, setContent] = useState('')
  const [mlAnalysis, setMlAnalysis] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)
  const textAreaRef = useRef(null)

  useEffect(() => {
    const analyzeWithDatasetModel = async () => {
      if (!content.trim()) {
        setMlAnalysis(null)
        return
      }

      setMlLoading(true)
      try {
        const response = await compareRealtimeContent(content)
        setMlAnalysis(response)
      } catch (error) {
        console.error('Realtime comparison error:', error)
        setMlAnalysis(null)
      } finally {
        setMlLoading(false)
      }
    }

    const timer = setTimeout(analyzeWithDatasetModel, 650)
    return () => clearTimeout(timer)
  }, [content])

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
    setMlAnalysis(null)
    textAreaRef.current?.focus()
  }

  const realtimeStatus = mlAnalysis?.status || 'Safe'
  const realtimeConfidence = mlAnalysis?.confidence || 0
  const realtimePrediction = mlAnalysis?.mlAnalysis || null

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="text-blue-400 mr-2">CSV Compare</span>
        Analyze Message or Link
      </h2>
      <p className="text-sm text-gray-400 mb-4">Real-time comparison uses your CSV-trained spam model while you type.</p>
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your message, link, or text here..."
        className="input-field mb-4 h-32 resize-none"
      />

      {content.trim() && (
        <div
          className={`mb-4 rounded-lg border p-4 ${
            realtimeStatus === 'Spam'
              ? 'border-red-500/60 bg-red-900/20'
              : realtimeStatus === 'Suspicious'
              ? 'border-yellow-500/60 bg-yellow-900/20'
              : 'border-green-500/50 bg-green-900/20'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm">Real-time CSV Model Comparison</span>
            <span className="text-xs text-gray-400">{mlLoading ? 'Checking...' : 'Live'}</span>
          </div>

          {realtimePrediction ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <InfoPill label="Status" value={realtimeStatus} />
                <InfoPill label="Confidence" value={`${realtimeConfidence}%`} />
                <InfoPill label="Spam Score" value={`${Math.round((realtimePrediction.spam?.confidence || 0) * 100)}%`} />
                <InfoPill label="Phishing Score" value={`${Math.round((realtimePrediction.phishing?.confidence || 0) * 100)}%`} />
              </div>

              <div className="rounded-lg bg-gray-900/40 p-3">
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Dataset Model Scores</div>
                <div className="space-y-2">
                  {(realtimePrediction.classification?.allScores || []).map((score) => (
                    <ScoreBar
                      key={score.label}
                      label={score.label}
                      value={Math.round((score.score || 0) * 100)}
                    />
                  ))}
                </div>
              </div>

              {realtimePrediction.spam?.isSpam && (
                <p className="text-red-300 text-xs">
                  Message matches spam patterns from the uploaded CSV datasets.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Waiting for model response...</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">...</span>
              Analyzing...
            </>
          ) : (
            <>
              <span className="mr-2">Analyze</span>
            </>
          )}
        </button>
        <button
          onClick={handlePaste}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-50 flex items-center justify-center"
        >
          <span className="mr-2">Paste</span>
        </button>
        <button
          onClick={handleShare}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-50 flex items-center justify-center"
        >
          <span className="mr-2">Share</span>
        </button>
        <button
          onClick={handleClear}
          disabled={isLoading}
          className="btn-secondary flex-1 disabled:opacity-50"
        >
          <span className="mr-2">Clear</span>
        </button>
      </div>
    </div>
  )
}

const InfoPill = ({ label, value }) => (
  <div className="rounded-lg bg-gray-900/40 p-3">
    <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
    <div className="mt-1 text-sm font-semibold text-white">{value}</div>
  </div>
)

const ScoreBar = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-gray-300 capitalize">{label}</span>
      <span className="text-gray-400">{value}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-gray-700">
      <div
        className={`h-2 rounded-full ${
          label === 'spam' ? 'bg-red-500' : label === 'phishing' ? 'bg-yellow-500' : 'bg-green-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
)

export default InputSection
