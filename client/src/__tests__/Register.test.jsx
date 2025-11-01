import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Register';

test('renders register form and shows validation errors', async () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  const submit = screen.getByRole('button', { name: /register/i });
  // fill invalid values so validation triggers deterministically
  const nameInput = screen.getByPlaceholderText(/enter your name/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const pwInput = screen.getByPlaceholderText(/create a password/i);

  fireEvent.change(nameInput, { target: { value: 'ab' } }); // too short
  // set a non-empty but invalid email so HTML5 "required" doesn't block submit in jsdom
  fireEvent.change(emailInput, { target: { value: 'invalid' } });
  fireEvent.change(pwInput, { target: { value: '123' } }); // too short

  // disable HTML5 validation in jsdom so React onSubmit runs and our custom validators execute
  const formEl = submit.closest('form');
  if (formEl) formEl.noValidate = true;
  fireEvent.click(submit);

  // password error should appear (message can vary)
  expect(await screen.findByText(/Password must/i)).toBeInTheDocument();
});

test('password toggle works', async () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  const pwInput = screen.getByPlaceholderText(/create a password/i);
  const toggle = screen.getByRole('button', { name: /show password/i });
  expect(pwInput).toHaveAttribute('type', 'password');
  fireEvent.click(toggle);
  expect(pwInput).toHaveAttribute('type', 'text');
});
