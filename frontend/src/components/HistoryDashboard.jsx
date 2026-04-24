import React, { useEffect, useState } from 'react'
import { getAnalysisHistory } from '../services/api'

const HistoryDashboard = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [refreshTrigger])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await getAnalysisHistory('anonymous', 50)
      setHistory(data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'Safe') return 'badge-safe'
    if (status === 'Suspicious') return 'badge-suspicious'
    if (status === 'Spam') return 'badge-spam'
    return 'bg-gray-700'
  }

  const getRiskBadge = (risk) => {
    if (risk === 'Low') return 'bg-green-900/30 text-green-300'
    if (risk === 'Medium') return 'bg-yellow-900/30 text-yellow-300'
    if (risk === 'High') return 'bg-red-900/30 text-red-300'
    return 'bg-gray-700'
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="text-blue-400 mr-2">📊</span>
          Analysis History
        </h2>
        <button onClick={fetchHistory} disabled={loading} className="text-gray-400 hover:text-gray-200 transition-colors" title="Refresh">
          {loading ? '⏳' : '🔄'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading history...</p>
        </div>
      ) : null}

      {!loading && history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No analysis history yet. Start by analyzing a message or file.</p>
        </div>
      ) : null}

      {!loading && history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Content Preview</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Risk</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Confidence</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4 text-gray-300 max-w-xs truncate">{item.content?.substring(0, 50) || 'N/A'}...</td>
                  <td className="py-4 px-4"><span className={`${getStatusBadge(item.status)}`}>{item.status}</span></td>
                  <td className="py-4 px-4"><span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getRiskBadge(item.risk)}`}>{item.risk}</span></td>
                  <td className="py-4 px-4 text-gray-400">{item.confidence ? `${item.confidence}%` : 'N/A'}</td>
                  <td className="py-4 px-4 text-gray-400 text-xs">{formatDate(item.timestamp || item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

export default HistoryDashboard
