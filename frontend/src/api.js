import axios from "axios";

// Fallback check for environment variable
if (!import.meta.env.VITE_API_URL) {
  console.error("Warning: VITE_API_URL is not defined in the environment.");
}

export const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
// Use the environment variable if provided, otherwise fallback to local dev or empty string (for Vercel proxy)
export const BACKEND_URL = import.meta.env.VITE_API_URL || (isLocal ? "http://localhost:5000" : "");

const API = axios.create({ 
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true
});

export default API;
