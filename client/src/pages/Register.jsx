import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const errs = {};
    if (!form.name || form.name.trim().length < 3) errs.name = 'Please enter your full name (min 3 characters)';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) errs.email = 'Please enter a valid email address';
    const pwd = form.password || '';
    if (pwd.length < 8) errs.password = 'Password must be at least 8 characters long';
    if (!/[0-9]/.test(pwd) || !/[A-Za-z]/.test(pwd)) errs.password = 'Password must include letters and numbers';
    if (Object.keys(errs).length) {
      setErrors(errs);
      setLoading(false);
      return;
    }
    try {
      await API.post("/auth/register", form);
      setMessage("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden px-6">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-2">
          Create Your Account 
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Join the <span className="text-blue-600 font-medium">AI Resume Evaluator</span> and get job matches powered by intelligence.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 0 1 1.175-4.625M6.1 6.1A9.961 9.961 0 0 1 12 5c5.523 0 10 4.477 10 10 0 1.25-.238 2.45-.675 3.56M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
            <PasswordStrengthMeter password={form.password} />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2.5 font-semibold rounded-lg text-white transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center text-sm mt-4 ${
              message.startsWith("Registration successful")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
}

function PasswordStrengthMeter({ password = '' }) {
  const checks = {
    length: password.length >= 8,
    letters: /[A-Za-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  const score = Object.values(checks).reduce((s, ok) => s + (ok ? 1 : 0), 0);
  const pct = Math.round((score / Object.keys(checks).length) * 100);
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mb-2">
        <div style={{ width: `${pct}%` }} className={`${color} h-2`} />
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <div className={`${checks.length ? 'text-green-600' : 'text-gray-500'}`}>• At least 8 characters</div>
        <div className={`${checks.letters ? 'text-green-600' : 'text-gray-500'}`}>• Contains letters</div>
        <div className={`${checks.numbers ? 'text-green-600' : 'text-gray-500'}`}>• Contains numbers</div>
        <div className={`${checks.special ? 'text-green-600' : 'text-gray-500'}`}>• Contains special character (optional)</div>
      </div>
    </div>
  );
}
