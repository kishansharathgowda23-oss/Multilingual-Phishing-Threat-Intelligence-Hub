const MAX_HISTORY = 200

const inMemoryHistory = []

export const addAnalysisToHistory = (analysis) => {
  inMemoryHistory.unshift({
    id: analysis.id || `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...analysis
  })

  if (inMemoryHistory.length > MAX_HISTORY) {
    inMemoryHistory.length = MAX_HISTORY
  }
}

export const getRecentHistory = (limit = 100) => {
  return inMemoryHistory.slice(0, limit)
}
