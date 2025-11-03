import React from 'react'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center mt-16">
      <p className="text-gray-700 dark:text-white font-medium text-lg mb-2">{message}</p>
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      {message && <p className="text-gray-700 dark:text-white mt-4 font-medium animate-pulse">Processing, please wait...</p>}
    </div>
  )
}
