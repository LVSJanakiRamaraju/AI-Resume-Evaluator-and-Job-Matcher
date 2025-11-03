import axios from 'axios';

const rawBackend = import.meta.env.VITE_BACKEND_URL;
const trimmed = rawBackend ? String(rawBackend).trim().replace(/\/+$/g, '') : '';
const base = trimmed ? `${trimmed}/api` : '/api';

const API = axios.create({
  baseURL: 'https://ai-resume-evaluator-and-job-matcher.onrender.com/api',
});


API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
