import React from 'react'

export default function PasswordStrengthMeter({ password = '' }) {
  const checks = {
    length: password.length >= 8,
    letters: /[A-Za-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  const score = Object.values(checks).reduce((s, ok) => s + (ok ? 1 : 0), 0);
  const pct = Math.round((score / Object.keys(checks).length) * 100);
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mb-2">
        <div style={{ width: `${pct}%` }} className={`${color} h-2`} />
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div className={`${checks.length ? 'text-green-600' : 'text-gray-500'}`}> At least 8 characters</div>
        <div className={`${checks.letters ? 'text-green-600' : 'text-gray-500'}`}> Contains letters</div>
        <div className={`${checks.numbers ? 'text-green-600' : 'text-gray-500'}`}> Contains numbers</div>
        <div className={`${checks.special ? 'text-green-600' : 'text-gray-500'}`}> Contains special character (optional)</div>
      </div>
    </div>
  )
}
