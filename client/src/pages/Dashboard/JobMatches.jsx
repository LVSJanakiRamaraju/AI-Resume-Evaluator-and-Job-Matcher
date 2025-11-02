import React, { useContext, useEffect, useState } from "react";
import API from "../../api";
import { ResumeContext } from "../../context/ResumeContext.jsx";

export default function JobMatches() {
  const { selectedResume, setSelectedResume } = useContext(ResumeContext);
  const [resumes, setResumes] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

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
          <div className="flex flex-col items-center justify-center mt-16">
            <p className="text-gray-700 font-medium text-lg mb-2">Loading...</p>
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-700 mt-4 font-medium animate-pulse">
              Processing your Resumes, please wait...
            </p>
            <span className="text-xs text-gray-400 mt-1">
              This may take a few seconds...
            </span>
          </div>
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
              Job Matches for {selectedResume.original_name}
            </h2>

            <div className="space-y-4">
              {matchData.data.map((job, i) => {
                const reasoning = job.reasoning.reasoning || "";
                const fit_skills = job.reasoning.fit_skills || [];
                const missing_skills = job.reasoning.missing_skills || [];

                return (
                  <div key={i} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium text-lg">{job.title}</p>
                      <p className="text-sm text-gray-600 font-semibold">{job.match_score}%</p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${job.match_score}%` }}
                      ></div>
                    </div>

                    {(reasoning && fit_skills.length > 0 && missing_skills.length > 0) && (
                      <div className="text-gray-700 text-sm mt-2 space-y-1">
                        {reasoning && (
                          <p>
                            <span className="font-semibold">Reasoning:</span> {reasoning}
                          </p>
                        )}
                        {fit_skills.length > 0 && (
                          <p>
                            <span className="font-semibold">Fit Skills:</span> {fit_skills.join(", ")}
                          </p>
                        )}
                        {missing_skills.length > 0 && (
                          <p>
                            <span className="font-semibold">Missing Skills:</span> {missing_skills.join(", ")}
                          </p>
                        )}
                        <a
                          href="https://huggingface.co/spaces/RamaRaju18/Learning_Pat_Generator"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Learn missing skills
                        </a>
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
