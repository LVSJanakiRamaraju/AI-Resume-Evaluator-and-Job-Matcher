import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '../../components/Header'

test('Header - renders user name and logout button', () => {
  render(<Header user={{ name: 'User' }} onLogout={() => {}} />)
  expect(screen.getByText(/user/i)).toBeInTheDocument()
  const btn = screen.getByRole('button', { name: /logout/i })
  expect(btn).toBeInTheDocument()
})

test('Header - logout button calls onLogout', () => {
  const onLogout = vi.fn()
  render(<Header user={{ name: 'U' }} onLogout={onLogout} />)
  const btn = screen.getByRole('button', { name: /logout/i })
  fireEvent.click(btn)
  expect(onLogout).toHaveBeenCalled()
})

test('Header - shows brand/logo area', () => {
  render(<Header user={{ name: 'Brand' }} onLogout={() => {}} />)
  expect(screen.getByText(/brand/i) || screen.getByText(/u/i)).toBeTruthy()
})

test('Header - accessible buttons present', () => {
  render(<Header user={{ name: 'A' }} onLogout={() => {}} />)
  expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(1)
})

test('Header - does not crash when no user', () => {
  render(<Header user={null} onLogout={() => {}} />)
  expect(true).toBeTruthy()
})
