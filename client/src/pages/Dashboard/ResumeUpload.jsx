import React, { useContext, useEffect, useState } from 'react';
import API from '../../api';
import { ResumeContext } from "../../context/ResumeContext.jsx";
import ResumeListItem from '../../components/ResumeListItem'
import LoadingSpinner from '../../components/LoadingSpinner'
import FileUploader from '../../components/FileUploader'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'

export default function ResumeUpload({ setActiveTab }) {
  const [file, setFile] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null); // 'upload' | 'list' | 'analysis' | null
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const { selectedResume, setSelectedResume } = useContext(ResumeContext);

  useEffect(() => {
    let mounted = true
    async function fetchResumes() {
      try {
        const res = await API.get('/resume/history');
        if (!mounted) return
        setResumes(res.data);

        if (!selectedResume && res.data.length > 0) {
          const latestResume = res.data[0];
          setSelectedResume(latestResume);
          localStorage.setItem('selectedResume', JSON.stringify(latestResume));
        }
      } catch (err) {
        if (!mounted) return
        console.error('Error fetching resumes:', err.response?.data || err.message);
        setResumes([]);
      }
    }
    fetchResumes();
    return () => { mounted = false }
  }, [selectedResume]);

  useEffect(() => {
    // detect mobile width and update state
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    }
  }, []);

  const handleFileChange = (selected) => {
    const f = Array.isArray(selected) ? selected[0] : selected
    setFile(f || null)
    setMessage('')
    setErrors(prev => ({ ...prev, file: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrors({ file: 'Please select a file first' });
      return;
    }
    if (file.type !== 'application/pdf') {
      setErrors({ file: 'Only PDF files allowed' });
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size && file.size > maxSize) {
      setErrors({ file: 'File is too large. Max 5MB allowed' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      setUploadProgress(0);
      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.lengthComputable) return
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      });

      const uploadedResume = res.data;
      setMessage('Upload successful');
      setFile(null);

      setSelectedResume(uploadedResume);
      localStorage.setItem('selectedResume', JSON.stringify(uploadedResume));

      setResumes(prev => [uploadedResume, ...prev]);
      setToast({ open: true, message: 'Resume uploaded' })
      setTimeout(() => setUploadProgress(0), 500)

    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Upload failed'
      setMessage(errMsg);
      setToast({ open: true, message: errMsg })
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    localStorage.setItem("selectedResume", JSON.stringify(resume));
    // on mobile, open analysis panel when a resume is selected
    if (isMobile) setExpandedPanel('analysis');
  };

  const confirmDelete = (resume) => {
    setResumeToDelete(resume)
    setShowModal(true)
  }

  const handleDelete = async () => {
    const target = resumeToDelete || selectedResume
    if (!target) return
    try {
      setLoading(true)
      await API.delete(`/resume/${target.id}`)
      setResumes(prev => prev.filter(r => r.id !== target.id))
      if (selectedResume?.id === target.id) {
        setSelectedResume(null)
        localStorage.removeItem('selectedResume')
      }
      setToast({ open: true, message: 'Resume deleted' })
    } catch (err) {
      console.error('Delete failed', err)
      const errMsg = err.response?.data?.error || err.message || 'Delete failed'
      setToast({ open: true, message: errMsg })
    } finally {
      setLoading(false)
      setShowModal(false)
      setResumeToDelete(null)
    }
  }

  return (
  <div className="max-w-5xl mx-auto p-4 sm:p-6 dark:text-slate-200">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    <div className="md:col-span-3">
        {/* Mobile header for upload panel */}
        <div className="md:hidden mb-2">
          <button
            type="button"
            onClick={() => setExpandedPanel(expandedPanel === 'upload' ? null : 'upload')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold">Upload Your Resume</h2>
              <p className="text-xs text-gray-500 dark:text-white">Tap to expand</p>
            </div>
              <span className={`ml-auto transform transition-transform ${expandedPanel === 'upload' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        <div className={`${expandedPanel === 'upload' ? 'block' : 'hidden'} md:block bg-white dark:bg-slate-800 dark:text-slate-200 p-6 rounded-lg shadow-md`}> 
          <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Resume</h2>
          <div className="flex items-center justify-center">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-auto">
                <FileUploader accept=".pdf" multiple={false} onFileChange={handleFileChange} />
              </div>
              <button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50">{loading ? 'Uploading...' : 'Upload'}</button>
              {errors.file && <p className="text-red-500 text-sm mt-2">{errors.file}</p>}
            </form>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded h-2 mt-4">
              <div className="bg-blue-600 h-2 rounded" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          {message && <p className="mt-4 text-center text-gray-700 dark:text-white">{message}</p>}
        </div>
      </div>

    <div className="md:col-span-1">
        <div className="md:hidden mb-2">
          <button
            type="button"
            onClick={() => setExpandedPanel(expandedPanel === 'list' ? null : 'list')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold">Uploaded Resumes</h3>
              <p className="text-xs text-gray-500 dark:text-white">{resumes.length} saved</p>
            </div>
            <span className={`transform transition-transform ${expandedPanel === 'list' ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>

        <div className={`${expandedPanel === 'list' ? 'block' : 'hidden'} md:block bg-white dark:bg-slate-800 dark:text-slate-200 p-4 rounded-lg shadow-md overflow-y-auto md:max-h-[500px]`}>
          <h3 className="text-lg font-semibold mb-4">Uploaded Resumes</h3>
          {loading ? (
            <LoadingSpinner message="Loading..." />
          ) : resumes.length === 0 ? (
            <p className="text-gray-500 text-sm dark:text-white">No resumes uploaded yet.</p>
          ) : (
            <ul className="divide-y">
              {resumes.map((r) => (
                <ResumeListItem key={r.id} resume={r} selected={selectedResume?.id === r.id} onSelect={handleSelectResume} onDelete={confirmDelete} />
              ))}
            </ul>
          )}
        </div>
      </div>

  <div className="md:col-span-2">
        <div className="md:hidden mb-2">
          <button
            type="button"
            onClick={() => setExpandedPanel(expandedPanel === 'analysis' ? null : 'analysis')}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold flex items-center">Analysis</h3>
              <p className="text-xs text-gray-500 flex items-left dark:text-white">
              </p>
            </div>
            <span className={`transform transition-transform ${expandedPanel === 'analysis' ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>

        <div className={`${expandedPanel === 'analysis' ? 'block' : 'hidden'} md:block bg-white dark:bg-slate-800 dark:text-slate-200 p-6 rounded-lg shadow-md overflow-y-auto md:max-h-[500px]`}>
          {selectedResume ? (
            <>
              <h3 className="text-xl font-semibold mb-4">
                Analysis for {' '}
                <br/>
                <span className="hidden md:inline truncate">{selectedResume.original_name}</span>
                <span className="inline-block md:hidden max-w-[100%] align-middle truncate">{selectedResume.original_name}</span>
              </h3>

              {selectedResume.analysis_result ? (
                <div className="space-y-4 text-gray-700 dark:text-white">

                  <div>
                    <h4 className="font-semibold">Skills:</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{selectedResume.analysis_result.skills?.join(', ') || 'N/A'}</p>
                  </div>

                  {selectedResume.analysis_result.experience?.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Experience:</h4>
                      <ul className="list-disc ml-6">
                        {selectedResume.analysis_result.experience.map((exp, i) => (
                          <li key={i} className="mb-3">
                            <div>
                              <span className="font-semibold">{exp.Title}</span>
                              <span className="text-sm text-gray-600 dark:text-slate-300">{' '}at {exp.Company} ({exp.Dates})</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{exp.Description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResume.analysis_result.education?.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Education:</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        {selectedResume.analysis_result.education.map((edu, i) => (
                          <li key={i}>
                            <div>
                              <span className="font-semibold">{edu.Degree}</span>
                              <span className="text-sm text-gray-600 dark:text-slate-300">{' '}— {edu.Institution} ({edu.Dates})</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedResume.analysis_result.project_highlights?.length > 0 && (
                    <div>
                      <h4 className="font-semibold">Project Highlights:</h4>
                      <ul className="list-disc ml-6">
                        {selectedResume.analysis_result.project_highlights.map((proj, i) => (
                          <li key={i} className="mb-3">
                            <div>
                              <span className="font-semibold">{proj.ProjectName}</span>
                              <span className="text-sm text-gray-600 dark:text-slate-300">{' '}— {proj.Technologies}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{proj.Description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-white">No analysis available for this resume.</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="bg-green-600 text-white px-6 py-2 rounded"
                >
                  View Job Matches
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete Resume
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center mt-20 dark:text-white">
              Select a resume to view analysis
            </p>
          )}
        </div>
      </div>

      <Modal open={showModal} title={resumeToDelete ? `Delete "${resumeToDelete.original_name}"?` : 'Delete resume?'} onClose={() => setShowModal(false)} className="max-w-md" footer={
        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
        </div>
      }>
        <p>Are you sure you want to delete {resumeToDelete ? `"${resumeToDelete.original_name}"` : 'the selected resume'}? This action cannot be undone.</p>
      </Modal>

      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ open: false, message: '' })} />
    </div>
  </div>
  );
}
