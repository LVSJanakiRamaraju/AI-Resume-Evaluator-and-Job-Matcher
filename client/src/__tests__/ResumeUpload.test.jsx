import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResumeUpload from '../pages/Dashboard/ResumeUpload';
import { ResumeContext } from '../context/ResumeContext';

vi.mock('../api', () => {
  const get = vi.fn().mockResolvedValue({ data: [] });
  const post = vi.fn().mockResolvedValue({ data: { id: 1, original_name: 'test.pdf', analysis_result: {} } });
  return { default: { get, post } };
});

function renderWithContext() {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  return render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );
}

test('shows error for non-pdf file', async () => {
  renderWithContext();
  const fileInput = document.querySelector('input[type="file"]');
  const file = new File(['hello'], 'resume.txt', { type: 'text/plain' });
  fireEvent.change(fileInput, { target: { files: [file] } });

  const upload = screen.getByRole('button', { name: /upload/i });
  fireEvent.click(upload);

  expect(await screen.findByText(/Only PDF files allowed/i)).toBeInTheDocument();
});

test('uploads a pdf and updates context on success', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  const { default: API } = await import('../api');
  API.post.mockResolvedValueOnce({ data: { id: 2, original_name: 'resume.pdf', analysis_result: {} } });

  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  const fileInput = document.querySelector('input[type="file"]');
  const pdf = new File(['%PDF-1.4'], 'resume.pdf', { type: 'application/pdf' });
  fireEvent.change(fileInput, { target: { files: [pdf] } });

  const upload = screen.getByRole('button', { name: /upload/i });
  fireEvent.click(upload);

  expect(await screen.findByText(/Upload successful/i)).toBeInTheDocument();
  expect(ctx.setSelectedResume).toHaveBeenCalled();
});

test('renders static UI elements in resume upload', () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  expect(screen.getByText(/upload your resume/i)).toBeInTheDocument();
  expect(document.querySelector('input[type="file"]')).toBeTruthy();
  expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  expect(screen.getByText(/uploaded resumes/i)).toBeInTheDocument();
  expect(screen.getByText(/no resumes uploaded yet/i)).toBeInTheDocument();
});
