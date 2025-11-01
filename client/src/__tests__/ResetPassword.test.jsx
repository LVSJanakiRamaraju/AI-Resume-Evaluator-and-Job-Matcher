import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../pages/ResetPassword';

// Provide a token param by rendering inside MemoryRouter with initialEntries
function renderWithToken() {
  return render(
    <MemoryRouter initialEntries={["/reset-password/token123"]}>
      <ResetPassword />
    </MemoryRouter>
  );
}

test('shows password mismatch error', async () => {
  renderWithToken();

  const pw = screen.getByPlaceholderText(/enter new password/i);
  const cpw = screen.getByPlaceholderText(/confirm new password/i);
  fireEvent.change(pw, { target: { value: 'Password123!' } });
  fireEvent.change(cpw, { target: { value: 'Different123!' } });

  const submit = screen.getByRole('button', { name: /reset password/i });
  const form = submit.closest('form');
  fireEvent.submit(form);

  expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
});

test('password toggles work', async () => {
  renderWithToken();
  const pwInput = screen.getByPlaceholderText(/enter new password/i);
  const toggle = screen.getByRole('button', { name: /show password/i });
  expect(pwInput).toHaveAttribute('type', 'password');
  fireEvent.click(toggle);
  expect(pwInput).toHaveAttribute('type', 'text');
});
