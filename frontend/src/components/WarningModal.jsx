import React from 'react'

const WarningModal = ({ isOpen, result, onProceed, onCancel }) => {
  if (!isOpen || !result) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-red-600/50 p-8 max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">⚠️</p>
          <h2 className="text-2xl font-bold text-red-400 mb-2">This may be unsafe. Continue?</h2>
          <p className="text-gray-300">Status: {result.status} | Risk: {result.risk}</p>
        </div>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-200">This link could be phishing or malicious. Proceed only if you trust the sender.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => onProceed(result)} className="btn-danger flex-1">Proceed</button>
        </div>
      </div>
    </div>
  )
}

export default WarningModal
