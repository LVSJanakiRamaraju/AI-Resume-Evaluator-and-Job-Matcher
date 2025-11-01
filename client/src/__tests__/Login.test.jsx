import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthContext } from '../context/AuthContext';

test('shows email validation and password toggle on login', async () => {
  const setUser = vi.fn();
  render(
  <AuthContext.Provider value={{ setUser }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  const submit = screen.getByRole('button', { name: /login/i });
  const form = submit.closest('form');
  fireEvent.submit(form);

  expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();

  const pwInput = screen.getByPlaceholderText(/enter your password/i);
  const toggle = screen.getByRole('button', { name: /show password/i });
  expect(pwInput).toHaveAttribute('type', 'password');
  fireEvent.click(toggle);
  expect(pwInput).toHaveAttribute('type', 'text');
});
