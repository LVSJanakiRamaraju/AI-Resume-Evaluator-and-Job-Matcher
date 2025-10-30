import React, { useEffect, useState } from 'react';
import API from '../../api';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await API.get('/resume/history');
        setResumes(res.data);
      } catch (err) {
        console.error('Error fetching resumes:', err.response?.data || err.message);
        setResumes([]);
      }
    }
    fetchResumes();
  }, [message]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const fetchJobMatches = async (skills) => {
    try {
      setMatchLoading(true);

      const res = await API.post('/get/job-matches', { skills });
      setMatchData(res.data);
    } catch (err) {
      console.error('Job match error:', err);
      setMatchData(null);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Please select a file first');
    if (file.type !== 'application/pdf') return setMessage('Only PDF files allowed');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message);
      setFile(null);
      setSelectedResume(res.data);

      if (res.data.analysis?.skills) {
        await fetchJobMatches(res.data.analysis.skills);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = async (resume) => {
    setSelectedResume(resume);

    if (resume.analysis_result?.skills) {
      await fetchJobMatches(resume.analysis_result.skills);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Resume</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="border p-2 rounded w-full sm:w-auto"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[500px]">
          <h3 className="text-lg font-semibold mb-4">Uploaded Resumes</h3>
          {resumes.length === 0 ? (
            <p className="text-gray-500 text-sm">No resumes uploaded yet.</p>
          ) : (
            <ul className="divide-y">
              {resumes.map((r) => (
                <li
                  key={r.id}
                  className={`py-2 px-3 cursor-pointer hover:bg-blue-50 rounded ${
                    selectedResume?.id === r.id ? 'bg-blue-100 font-semibold' : ''
                  }`}
                  onClick={() => handleSelectResume(r)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold truncate max-w-[70%]">{r.original_name}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[500px]">
          {selectedResume ? (
            <>
              <h3 className="text-xl font-semibold mb-4">🧠 Analysis for {selectedResume.original_name}</h3>
              {selectedResume.analysis_result ? (
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-semibold">Skills:</h4>
                    <p>{selectedResume.analysis_result.skills?.join(', ') || 'N/A'}</p>
                  </div>

                  {/* Jobs Match Section */}
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">🎯 Best Job Matches</h3>
                    {matchLoading ? (
                      <p className="text-gray-500">Finding best jobs...</p>
                    ) : matchData?.data?.length ? (
                      <>
                        <ul className="space-y-2">
                          {matchData.data.map((job, i) => (
                            <li key={i} className="p-3 bg-gray-50 rounded border">
                              <p className="font-semibold">{job.title}</p>
                              <p className="text-sm text-gray-600">Match Score: <b>{job.match_score}%</b></p>
                            </li>
                          ))}
                        </ul>

                        <h4 className="font-semibold mt-3">🧠 AI Reasoning:</h4>
                        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                          {JSON.stringify(matchData.reasoning, null, 2)}
                        </pre>
                      </>
                    ) : (
                      <p className="text-gray-500">No job matches found.</p>
                    )}
                  </div>

                </div>
              ) : (
                <p className="text-gray-500">No analysis available.</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center mt-20">Select a resume to view analysis & matches</p>
          )}
        </div>
      </div>
    </div>
  );
}
