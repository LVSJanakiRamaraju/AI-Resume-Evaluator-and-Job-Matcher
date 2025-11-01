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
