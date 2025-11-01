import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../pages/ForgotPassword';

test('validates email on forgot password', async () => {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

  const submit = screen.getByRole('button', { name: /send reset link/i });
  const form = submit.closest('form');
  fireEvent.submit(form);

  expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
});
