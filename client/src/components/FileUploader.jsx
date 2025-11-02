import React, { useRef, useState } from 'react'

export default function FileUploader({ accept = '.pdf', multiple = false, onFileChange = () => {} }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [filesLabel, setFilesLabel] = useState('No file chosen')

  function handleFiles(files) {
    const fileArray = Array.from(files || [])
    setFilesLabel(fileArray.length === 0 ? 'No file chosen' : fileArray.map(f => f.name).join(', '))
    onFileChange(multiple ? fileArray : fileArray[0] || null)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={`border-dashed border-2 p-4 rounded cursor-pointer text-center ${dragOver ? 'border-blue-400 bg-blue-50 dark:bg-slate-700' : 'border-gray-300 dark:border-slate-600 dark:bg-slate-800'}`}>
        <p className="text-sm text-gray-600 dark:text-slate-300">Drag & drop files here, or click to select</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Accepted: {accept}</p>
        <p className="text-sm text-gray-700 dark:text-slate-200 mt-2">{filesLabel}</p>
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  )
}
