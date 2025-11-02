import React, { useContext, useEffect, useState } from "react";
import API from "../../api";
import { ResumeContext } from "../../context/ResumeContext.jsx";
import ResumeListItem from '../../components/ResumeListItem'
import JobMatchCard from '../../components/JobMatchCard'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function JobMatches() {
  const { selectedResume, setSelectedResume } = useContext(ResumeContext);
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
    async function fetchMatches() {
      if (!selectedResume?.id) return;
      try {
        setLoadingMatches(true);
        const res = await API.post("/get/job-matches", {
          resume_id: selectedResume.id
        });
        setMatchData(res.data);
      } catch (err) {
        console.error("Match error:", err);
        setMatchData(null);
      } finally {
        setLoadingMatches(false);
      }
    }
    fetchMatches();
  }, [selectedResume]);

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setMatchData(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[600px]">
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

      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[600px]">
        {!selectedResume ? (
          <p className="text-center mt-20 text-red-600">No resume selected. Select one from the left panel.</p>
        ) : loadingMatches ? (
          <p>Matching jobs...</p>
        ) : matchData?.data?.length ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Job Matches for {selectedResume.original_name}</h2>

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
