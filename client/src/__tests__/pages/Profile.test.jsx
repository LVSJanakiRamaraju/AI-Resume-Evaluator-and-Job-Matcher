import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Profile from '../../pages/Dashboard/Profile'

vi.mock('../../api', () => ({
  default: { get: vi.fn() },
}))

import API from '../../api'

describe('Profile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows user info when API returns user', async () => {
    API.get.mockResolvedValue({ data: { user: { name: 'Sam', email: 'sam@example.com', role: 'user' } } })

    render(<Profile />)

    await waitFor(() => expect(API.get).toHaveBeenCalledWith('/protected'))
    expect(screen.getByText(/profile information/i)).toBeInTheDocument()
    expect(screen.getByText(/sam@example.com/i)).toBeInTheDocument()
  })

  it('shows loading UI while fetching profile', () => {
    render(<Profile />)
    expect(screen.getByText(/processing your profile/i)).toBeInTheDocument()
  })

  it('handles API error and shows fallback loading UI', async () => {
    API.get.mockRejectedValueOnce(new Error('fail'))
    render(<Profile />)
    expect(screen.getByText(/Processing your Profile, please wait/i) || screen.getByText(/Loading.../i)).toBeTruthy()
  })

  it('calls API.get exactly once when rendering profile', async () => {
    API.get.mockResolvedValueOnce({ data: { user: { name: 'Sam', email: 'sam@example.com', role: 'user' } } })
    render(<Profile />)
    await waitFor(() => expect(API.get).toHaveBeenCalledTimes(1))
    expect(await screen.findByText(/sam@example.com/i)).toBeInTheDocument()
  })
})
