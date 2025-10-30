import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden px-6 sm:px-12 lg:px-20">
      
      <div className="absolute top-[-5%] left-[-10%] w-[350px] h-[350px] bg-blue-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-6 text-center md:text-left max-w-xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
          Smarter Resumes,
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Smarter Career Matches
          </span>
        </h1>

        <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-lg">
          Upload your resume and let AI extract your key skills, experience, and achievements. 
          Instantly discover matching job roles that fit your profile perfectly — all in one click.
        </p>

        <div className="flex justify-center md:justify-start gap-4 mt-2">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-12 md:mt-0 flex justify-center md:w-[50%]">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-slate-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
            AI Resume Evaluator
          </h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Powered by AI — Analyze your resume and get personalized job recommendations in seconds.
          </p>
          <div className="h-44 sm:h-52 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex flex-col items-center justify-center">
            <span className="font-semibold text-blue-700 text-lg">
              Upload + Analyze + Match
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
