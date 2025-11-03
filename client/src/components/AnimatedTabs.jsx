import React, { useState } from 'react'

export default function AnimatedTabs({ tabs = [], activeTab, onTabChange }) {
  return (
    <div className="border-b border-gray-200 dark:border-slate-600 mb-4">
      <div className="flex relative">
        {tabs.map((tab, idx) => (
          <button
            key={tab.key}
            className={`py-2 px-4 font-medium transition-colors duration-200 ${
              activeTab === tab.key
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400'
            }`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        {/* Animated underline */}
        <div
          className="absolute bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300"
          style={{
            left: `${tabs.findIndex(t => t.key === activeTab) * 100}%`,
            width: `${100 / tabs.length}%`,
          }}
        />
      </div>
    </div>
  )
}
