import React, { useState, useCallback } from 'react'
import InputSection from './components/InputSection'
import ResultCard from './components/ResultCard'
import FileUploadSection from './components/FileUploadSection'
import HistoryDashboard from './components/HistoryDashboard'
import WarningModal from './components/WarningModal'
import { analyzeContent, uploadAndAnalyzeFile, saveAnalysisToFirebase } from './services/api'

function App() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningResult, setWarningResult] = useState(null)
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [activeTab, setActiveTab] = useState('analyzer')

  const handleAnalyze = useCallback(async (content) => {
    setIsLoading(true)
    try {
      const analysisResult = await analyzeContent(content)
      setResult(analysisResult)
      try {
        await saveAnalysisToFirebase(analysisResult)
        setHistoryRefresh(prev => prev + 1)
      } catch (firebaseError) {
        console.warn('Failed to save to Firebase, but analysis completed:', firebaseError)
      }
    } catch (error) {
      alert('Analysis failed. Please ensure the backend is running.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFileUpload = useCallback(async (file) => {
    setIsLoading(true)
    try {
      const analysisResult = await uploadAndAnalyzeFile(file)
      setResult({ ...analysisResult, content: file.name })
      try {
        await saveAnalysisToFirebase({ ...analysisResult, content: file.name })
        setHistoryRefresh(prev => prev + 1)
      } catch (firebaseError) {
        console.warn('Failed to save to Firebase, but analysis completed:', firebaseError)
      }
    } catch (error) {
      alert('File analysis failed. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSuspiciousAction = (nextResult) => {
    setWarningResult(nextResult)
    setShowWarning(true)
  }

  const handleProceedWithLink = (nextResult) => {
    const url = nextResult.selectedUrl || nextResult.url || extractUrl(nextResult.content)
    if (url) {
      window.open(url, '_blank')
    }
    setShowWarning(false)
  }

  const handleSafeLinkClick = (url) => {
    window.open(url, '_blank')
  }

  const extractUrl = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const match = content.match(urlRegex)
    return match ? match[0] : null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-3xl mr-3">🛡️</span>
              <h1 className="text-3xl font-bold text-white">PhishGuard AI</h1>
            </div>
            <p className="text-gray-400 text-sm">Protect yourself from phishing & spam</p>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'analyzer' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔍 Analyzer
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📊 History
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analyzer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
              <FileUploadSection onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>
            <div>
              {result ? (
                <ResultCard
                  result={result}
                  onSuspiciousAction={handleSuspiciousAction}
                  onSafeLinkClick={handleSafeLinkClick}
                />
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-400 mb-4">No analysis yet</p>
                  <p className="text-sm text-gray-500">Analyze a message or upload a file to see results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <HistoryDashboard refreshTrigger={historyRefresh} />
          </div>
        )}
      </main>

      <WarningModal
        isOpen={showWarning}
        result={warningResult}
        onProceed={handleProceedWithLink}
        onCancel={() => setShowWarning(false)}
      />

      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-gray-400 text-sm text-center">
            PhishGuard AI © 2026 | Stay safe online | Never share personal information
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
