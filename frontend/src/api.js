import axios from "axios";

// Fallback check for environment variable
if (!import.meta.env.VITE_API_URL) {
  console.error("Warning: VITE_API_URL is not defined in the environment.");
}

export const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
// BACKEND_URL is used for absolute links like avatars
export const BACKEND_URL = import.meta.env.VITE_API_URL || (isLocal ? "http://localhost:5000" : "");

const API = axios.create({ 
  // Always use relative /api in production to leverage Vercel's proxy and avoid mobile CORS issues
  baseURL: isLocal ? "http://localhost:5000/api" : "/api",
  withCredentials: true
});

export default API;
