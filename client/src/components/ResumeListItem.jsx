import React from 'react'
import IconButton from './IconButton'

export default function ResumeListItem({ resume, selected, onSelect, onDelete }) {
  return (
    <li className={`py-2 px-3 hover:bg-blue-50 rounded flex justify-between items-center ${selected ? 'bg-blue-100 font-semibold' : ''}`}>

        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(resume)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelect(resume) }}
          className="flex items-center w-full text-left"
        >
        <div className="flex flex-col max-w-[75%]">
            <span className="text-sm font-semibold truncate">
            {resume.original_name}
            </span>
            <span className="text-gray-400 text-xs">
            {new Date(resume.created_at).toLocaleString()}
            </span>
        </div>

        {onDelete && (
            <IconButton
            ariaLabel={`Delete ${resume.original_name}`}
            title={`Delete ${resume.original_name}`}
            onClick={(e) => {
                e.stopPropagation();
                onDelete(resume);
            }}
            className="ml-auto text-red-600"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H3.5a.5.5 0 000 1H4v10a2 2 0 002 2h8a2 2 0 002-2V5h.5a.5.5 0 000-1H15V3a1 1 0 00-1-1H6zm2 4a.5.5 0 01.5.5V15a.5.5 0 01-1 0V6.5A.5.5 0 018 6zm4 .5a.5.5 0 00-1 0V15a.5.5 0 001 0V6.5z"
                clipRule="evenodd"
                />
            </svg>
            </IconButton>
        )}
        </div>

    </li>
  )
}
