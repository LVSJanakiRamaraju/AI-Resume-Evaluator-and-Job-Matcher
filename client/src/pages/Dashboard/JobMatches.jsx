import React, { useContext, useEffect, useState } from "react";
import API from "../../api";
import { ResumeContext } from "../../context/ResumeContext.jsx";
import ResumeListItem from '../../components/ResumeListItem'
import JobMatchCard from '../../components/JobMatchCard'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function JobMatches() {
  const { selectedResume, setSelectedResume } = useContext(ResumeContext);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null); // 'resumes' | 'matches' | null
  const [resumes, setResumes] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    let mounted = true
    async function fetchResumes() {
      try {
        setLoadingResumes(true);
        const res = await API.get("/resume/history");
        if (!mounted) return
        setResumes(res.data);
      } catch (err) {
        if (!mounted) return
        console.error("Error fetching resumes:", err.response?.data || err.message);
        setResumes([]);
      } finally {
        if (mounted) setLoadingResumes(false);
      }
    }
    fetchResumes();
    return () => { mounted = false }
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    let mounted = true
    async function fetchMatches() {
      if (!selectedResume?.id) return;
      try {
        setLoadingMatches(true);
        const res = await API.post("/get/job-matches", {
          resume_id: selectedResume.id
        });
        if (!mounted) return
        setMatchData(res.data);
      } catch (err) {
        if (!mounted) return
        console.error("Match error:", err);
        setMatchData(null);
      } finally {
        if (mounted) setLoadingMatches(false);
      }
    }
    fetchMatches();
    return () => { mounted = false }
  }, [selectedResume]);

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setMatchData(null);
    if (isMobile) setExpandedPanel('matches');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-slate-200">

      {/* Mobile header for resumes list */}
      <div className="md:hidden mb-2">
        <button
          type="button"
          onClick={() => setExpandedPanel(expandedPanel === 'resumes' ? null : 'resumes')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
        >
          <div>
            <h3 className="text-lg font-semibold">Uploaded Resumes</h3>
            <p className="text-xs text-gray-500 dark:text-white">{resumes.length} saved</p>
          </div>
          <span className={`ml-auto transform transition-transform ${expandedPanel === 'resumes' ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      <div className={`${expandedPanel === 'resumes' ? 'block' : 'hidden'} md:block bg-white dark:bg-slate-800 dark:text-slate-200 p-4 rounded-lg shadow-md overflow-y-auto md:max-h-[600px]`}>
        <h3 className="text-lg font-semibold mb-4">Uploaded Resumes</h3>
        {loadingResumes ? (
          <LoadingSpinner message="Loading..." />
        ) : resumes.length === 0 ? (
          <p className="text-gray-500 text-sm">No resumes uploaded yet.</p>
        ) : (
          <ul className="divide-y">
            {resumes.map((r) => (
              <ResumeListItem key={r.id} resume={r} selected={selectedResume?.id === r.id} onSelect={handleSelectResume} />
            ))}
          </ul>
        )}
      </div>


      {/* Matches panel header (mobile) */}
      <div className="md:hidden mb-2">
        <button
          type="button"
          onClick={() => setExpandedPanel(expandedPanel === 'matches' ? null : 'matches')}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
        >
          <div>
            <h3 className="text-lg font-semibold flex flex-row justify-start">Job Matches</h3>
            <p className="text-xs text-gray-500 max-w-[40%] align-middle truncate dark:text-white">

            </p>
          </div>
          <span className={`ml-auto transform transition-transform ${expandedPanel === 'matches' ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      <div className={`${expandedPanel === 'matches' ? 'block' : 'hidden'} md:col-span-2 md:block bg-white dark:bg-slate-800 dark:text-slate-200 p-6 rounded-lg shadow-md overflow-y-auto md:max-h-[600px]`}>
        {!selectedResume ? (
          <p className="text-center mt-20 text-red-600">No resume selected. Select one from the left panel.</p>
        ) : loadingMatches ? (
          <p>Matching jobs...</p>
        ) : matchData?.data?.length ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Job Matches for {' '}
              <span className="hidden md:inline">{selectedResume.original_name}</span>
              <span className="inline-block md:hidden max-w-[100%] align-middle truncate">{selectedResume.original_name}</span>
            </h2>

            <div className="space-y-4">
              {matchData.data.map((job, i) => (
                <JobMatchCard key={i} job={job} />
              ))}
            </div>
          </>
        ) : (
          <p>No matches found for this resume.</p>
        )}
      </div>
    </div>
  );
}
