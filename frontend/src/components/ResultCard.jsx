import React from 'react'

const ResultCard = ({ result, onSuspiciousAction, onSafeLinkClick }) => {
  if (!result) return null

  const getStatusIcon = (status) => {
    if (status === 'Safe') return '✅'
    if (status === 'Suspicious') return '⚠️'
    if (status === 'Spam') return '🚫'
    return '❓'
  }

  const getStatusColor = (status) => {
    if (status === 'Safe') return 'badge-safe'
    if (status === 'Suspicious') return 'badge-suspicious'
    if (status === 'Spam') return 'badge-spam'
    return 'bg-gray-700 text-gray-300'
  }

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'risk-low'
    if (risk === 'Medium') return 'risk-medium'
    if (risk === 'High') return 'risk-high'
    return 'text-gray-400'
  }

  const shouldShowWarning = result.status === 'Suspicious' || result.status === 'Spam'

  return (
    <div className="card animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Analysis Result</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-gray-400 text-sm mb-2">Status</p>
          <div className={`${getStatusColor(result.status)} flex items-center`}>
            <span className="mr-2 text-lg">{getStatusIcon(result.status)}</span>
            <span className="text-lg font-semibold">{result.status}</span>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm mb-2">Risk Level</p>
          <p className={`text-xl font-bold ${getRiskColor(result.risk)}`}>{result.risk}</p>
        </div>
      </div>

      {result.confidence ? (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Confidence</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                result.confidence > 75 ? 'bg-green-500' : result.confidence > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <p className="text-gray-300 text-sm mt-1">{result.confidence}%</p>
        </div>
      ) : null}

      {result.details ? (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Details</p>
          <div className="bg-gray-700/50 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap">{result.details}</div>
        </div>
      ) : null}

      {result.suspiciousUrls && result.suspiciousUrls.length > 0 ? (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">⚠️ Suspicious URLs Detected</p>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            {result.suspiciousUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => onSuspiciousAction({ ...result, selectedUrl: url })}
                className="block text-left text-red-300 hover:text-red-200 underline text-sm mb-2 break-all font-mono"
              >
                🔗 {url}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {result.urls && result.urls.length > 0 ? (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">URLs Found</p>
          <div className="bg-gray-700/30 rounded-lg p-4">
            {result.urls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (result.suspiciousUrls?.includes(url)) {
                    onSuspiciousAction({ ...result, selectedUrl: url })
                    return
                  }
                  onSafeLinkClick(url)
                }}
                className="block text-left text-blue-300 hover:text-blue-200 underline text-sm mb-2 break-all font-mono"
              >
                {url}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {result.emails && result.emails.length > 0 ? (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">📧 Emails Found</p>
          <div className="bg-gray-700/30 rounded-lg p-4">
            {result.emails.map((email, idx) => (
              <div key={idx} className="text-gray-300 text-sm mb-2 font-mono">
                {email}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {shouldShowWarning && (!result.suspiciousUrls || result.suspiciousUrls.length === 0) ? (
        <button onClick={() => onSuspiciousAction(result)} className="btn-danger w-full flex items-center justify-center">
          <span className="mr-2">🔗</span>
          Proceed with Link (Not Recommended)
        </button>
      ) : null}
    </div>
  )
}

export default ResultCard
