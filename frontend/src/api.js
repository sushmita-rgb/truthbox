import axios from "axios";

// Fallback check for environment variable
if (!import.meta.env.VITE_API_URL) {
  console.error("Warning: VITE_API_URL is not defined in the environment.");
}

export const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
export const BACKEND_URL = import.meta.env.VITE_API_URL || (isLocal ? "http://localhost:5000" : "https://truthbox-production.up.railway.app");

const API = axios.create({ 
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true
});

export default API;
