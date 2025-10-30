import React, { useContext, useEffect, useState } from "react";
import API from "../../api";
import { ResumeContext } from "../../context/ResumeContext.jsx";

export default function JobMatches() {
  const { selectedResume, setSelectedResume } = useContext(ResumeContext);
  const [resumes, setResumes] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fetch uploaded resumes
  useEffect(() => {
    async function fetchResumes() {
      try {
        setLoadingResumes(true);
        const res = await API.get("/resume/history");
        setResumes(res.data);
      } catch (err) {
        console.error("Error fetching resumes:", err.response?.data || err.message);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    }
    fetchResumes();
  }, []);

  // Fetch job matches for selected resume
  useEffect(() => {
    async function fetchMatches() {
      if (!selectedResume?.analysis_result?.skills?.length) return;
      try {
        setLoadingMatches(true);
        const res = await API.post("/get/job-matches", {
          skills: selectedResume.analysis_result.skills,
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
    setMatchData(null); // Reset match data when selecting a new resume
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Left: Resume List */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto max-h-[600px]">
        <h3 className="text-lg font-semibold mb-4">📄 Uploaded Resumes</h3>
        {loadingResumes ? (
          <p className="text-gray-500">Loading resumes...</p>
        ) : resumes.length === 0 ? (
          <p className="text-gray-500 text-sm">No resumes uploaded yet.</p>
        ) : (
          <ul className="divide-y">
            {resumes.map((r) => (
              <li
                key={r.id}
                className={`py-2 px-3 cursor-pointer hover:bg-blue-50 rounded ${
                  selectedResume?.id === r.id ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() => handleSelectResume(r)}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold truncate max-w-[65%]">
                    {r.original_name}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: Job Matches */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md overflow-y-auto max-h-[600px]">
        {!selectedResume ? (
          <p className="text-center mt-20 text-red-600">
            No resume selected. Select one from the left panel.
          </p>
        ) : loadingMatches ? (
          <p>Matching jobs...</p>
        ) : matchData?.data?.length ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              🎯 Job Matches for {selectedResume.original_name}
            </h2>

            <div className="space-y-4">
              {matchData.data.map((job, i) => {
                console.log(matchData.reasoning)
                const reasoning = matchData.reasoning?.[i + 1]?.reasoning;
                const fit_skills = matchData.reasoning?.[i + 1]?.fit_skills || [];
                const missing_skills = matchData.reasoning?.[i + 1]?.missing_skills || [];
                return (
                  <div key={i} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-lg">{job.title}</p>
                      <p className="text-sm text-gray-600 font-semibold">{job.match_score}%</p>
                    </div>

                    {/* Match Score Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${job.match_score}%` }}
                      ></div>
                    </div>

                    {reasoning && (
                      <div className="text-gray-700 text-sm mt-2 space-y-1">
                        <p><span className="font-semibold">Reasoning:</span> {reasoning}</p>
                        {fit_skills.length > 0 && (
                          <p><span className="font-semibold">Fit Skills:</span> {fit_skills.join(", ")}</p>
                        )}
                        {missing_skills.length > 0 && (
                          <p><span className="font-semibold">Missing Skills:</span> {missing_skills.join(", ")}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p>No matches found for this resume.</p>
        )}
      </div>
    </div>
  );
}
