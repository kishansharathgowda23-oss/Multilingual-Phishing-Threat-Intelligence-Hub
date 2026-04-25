import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const DashboardAnalytics = ({ history = [], overview = {} }) => {
  const datasetStats = overview?.datasets || {}
  const modelMetrics = overview?.modelMetrics || {}

  const normalizedHistory = useMemo(
    () =>
      history.map((item) => ({
        ...item,
        mlAnalysis: item.mlAnalysis || item.mlPrediction || null
      })),
    [history]
  )

  const spamHistory = useMemo(
    () =>
      normalizedHistory.filter(
        (item) =>
          item.status === 'Spam' ||
          item.mlAnalysis?.spam?.isSpam ||
          item.mlAnalysis?.classification?.classification === 'spam'
      ),
    [normalizedHistory]
  )

  const scoreTrendData = useMemo(
    () =>
      spamHistory
        .slice(0, 12)
        .reverse()
        .map((item, index) => ({
          name: `Spam ${index + 1}`,
          spamScore: Math.round((item.mlAnalysis?.spam?.confidence || 0) * 100),
          phishingScore: Math.round((item.mlAnalysis?.phishing?.confidence || 0) * 100),
          finalScore: item.confidence || 0
        })),
    [spamHistory]
  )

  const classificationScoreData = useMemo(() => {
    const totals = {}
    let count = 0

    spamHistory.forEach((item) => {
      const scores = item.mlAnalysis?.classification?.allScores || []
      if (!scores.length) {
        return
      }

      count += 1
      scores.forEach((entry) => {
        totals[entry.label] = (totals[entry.label] || 0) + (entry.score || 0)
      })
    })

    return Object.entries(totals).map(([label, value]) => ({
      label,
      score: count ? Math.round((value / count) * 100) : 0
    }))
  }, [spamHistory])

  const perModelScoreData = useMemo(() => {
    if (!spamHistory.length) {
      return []
    }

    const phishingAverage = Math.round(
      (spamHistory.reduce((sum, item) => sum + (item.mlAnalysis?.phishing?.confidence || 0), 0) /
        spamHistory.length) *
        100
    )
    const spamAverage = Math.round(
      (spamHistory.reduce((sum, item) => sum + (item.mlAnalysis?.spam?.confidence || 0), 0) / spamHistory.length) *
        100
    )
    const hybridAverage = Math.round(
      (spamHistory.reduce((sum, item) => sum + (item.mlAnalysis?.classification?.confidence || 0), 0) /
        spamHistory.length) *
        100
    )

    return [
      { model: 'RuleEngine-Phishing', score: phishingAverage },
      { model: 'NaiveBayes-Dataset', score: spamAverage },
      { model: 'Hybrid-Ensemble', score: hybridAverage }
    ]
  }, [spamHistory])

  const topSpamKeywords = useMemo(() => {
    const keywordCounts = {}

    spamHistory.forEach((item) => {
      const keywords = item.mlAnalysis?.phishing?.details?.matchedKeywords || []
      keywords.forEach((keyword) => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
      })
    })

    return Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [spamHistory])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="CSV Rows" value={datasetStats.totalSamples || 0} subtitle="Training records" />
        <StatCard title="Spam Hits" value={spamHistory.length} subtitle="Detected history" />
        <StatCard title="Accuracy" value={`${modelMetrics.accuracy || 0}%`} subtitle="Model confidence" />
        <StatCard title="Latency" value={`${modelMetrics.latency || 12}ms`} subtitle="Neural response" />
        <StatCard title="Precision" value={`${modelMetrics.precision || 0}%`} subtitle="Spam precision" />
        <StatCard title="Recall" value={`${modelMetrics.recall || 0}%`} subtitle="Spam recall" />
      </div>

      {!spamHistory.length ? (
        <div className="card">
          <h3 className="text-lg font-bold mb-2">Spam Model Graphs</h3>
          <p className="text-gray-400">
            No spam message has been detected yet. The dashboard will show per-model score graphs only after a message is classified as spam by the CSV-trained model.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Spam Detection Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {perModelScoreData.map((item) => (
                <div key={item.model} className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
                  <div className="text-xs uppercase text-gray-400">{item.model}</div>
                  <div className="mt-2 text-3xl font-bold text-white">{item.score}%</div>
                  <div className="mt-2 h-2 rounded-full bg-gray-700">
                    <div
                      className={`h-2 rounded-full ${
                        item.model === 'NaiveBayes-Dataset'
                          ? 'bg-red-500'
                          : item.model === 'RuleEngine-Phishing'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Per Spam Message Model Scores">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                  <Legend />
                  <Line type="monotone" dataKey="spamScore" stroke="#ef4444" strokeWidth={3} name="Spam model" />
                  <Line type="monotone" dataKey="phishingScore" stroke="#f59e0b" strokeWidth={3} name="Phishing model" />
                  <Line type="monotone" dataKey="finalScore" stroke="#60a5fa" strokeWidth={3} name="Final confidence" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Average Class Probabilities For Spam Messages">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classificationScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {classificationScoreData.map((item) => (
                      <Cell
                        key={item.label}
                        fill={
                          item.label === 'spam'
                            ? '#ef4444'
                            : item.label === 'phishing'
                            ? '#f59e0b'
                            : '#22c55e'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top Spam Signals From CSV Comparison">
              {topSpamKeywords.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topSpamKeywords}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="keyword" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">No phishing keywords were recorded for the current spam detections.</p>
              )}
            </ChartCard>

            <div className="card">
              <h3 className="text-lg font-bold mb-4">Model Consensus breakdown</h3>
              <div className="space-y-3">
                {spamHistory.slice(0, 5).map((item, index) => (
                  <div key={item.id || index} className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
                    <div className="text-sm text-gray-300 truncate">{item.content || 'Message'}</div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <MiniScore label="Spam" value={Math.round((item.mlAnalysis?.spam?.confidence || 0) * 100)} tone="red" />
                      <MiniScore label="Phishing" value={Math.round((item.mlAnalysis?.phishing?.confidence || 0) * 100)} tone="yellow" />
                      <MiniScore label="Final" value={item.confidence || 0} tone="blue" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const ChartCard = ({ title, children }) => (
  <div className="card">
    <h3 className="text-lg font-bold mb-4">{title}</h3>
    {children}
  </div>
)

const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
    <p className="text-gray-400 text-xs uppercase">{title}</p>
    <p className="text-2xl font-bold text-white mt-2">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
)

const MiniScore = ({ label, value, tone }) => (
  <div className="rounded-lg bg-gray-900/40 p-3">
    <div className="text-xs uppercase text-gray-400">{label}</div>
    <div
      className={`mt-1 text-lg font-bold ${
        tone === 'red' ? 'text-red-400' : tone === 'yellow' ? 'text-yellow-400' : 'text-blue-400'
      }`}
    >
      {value}%
    </div>
  </div>
)

export default DashboardAnalytics
