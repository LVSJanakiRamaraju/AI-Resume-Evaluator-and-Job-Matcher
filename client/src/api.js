import axios from 'axios';

const rawBackend = import.meta.env.VITE_BACKEND_URL;
let backend = rawBackend ? String(rawBackend).trim().replace(/\/+$/g, '') : '';
if (backend && !/^https?:\/\//i.test(backend)) {
  const defaultProto = (import.meta.env.MODE === 'development') ? 'http' : 'https';
  backend = `${defaultProto}://${backend}`;
}
const base = backend ? `${backend}/api` : '/api';

const API = axios.create({ baseURL: base });


API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
