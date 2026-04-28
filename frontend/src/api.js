import axios from "axios";

const isLocal = window.location.hostname === "localhost";
const API = axios.create({ 
  baseURL: isLocal ? "http://localhost:5000/api" : "https://truthbox-production.up.railway.app/api",
  withCredentials: true
});

export default API;
