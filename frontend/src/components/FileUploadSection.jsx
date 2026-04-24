import React, { useState } from 'react'

const FileUploadSection = ({ onFileUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file) => {
    setFileName(file.name)
    onFileUpload(file)
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="text-blue-400 mr-2">📁</span>
        Upload & Scan Files
      </h2>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 bg-gray-800/30'
        }`}
      >
        <p className="text-3xl mb-2">📤</p>
        <p className="text-gray-300 mb-2">Drag and drop your file here</p>
        <p className="text-gray-400 text-sm mb-4">or</p>
        <label className="btn-primary inline-block cursor-pointer">
          <span>Browse Files</span>
          <input
            type="file"
            onChange={handleChange}
            disabled={isLoading}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            className="hidden"
          />
        </label>
        {fileName && (
          <p className="text-sm text-gray-400 mt-4">
            Selected: <span className="text-blue-400">{fileName}</span>
          </p>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-4">Supported: PDF, DOC, TXT, JPG, PNG, GIF (Max 10MB)</p>
    </div>
  )
}

export default FileUploadSection
