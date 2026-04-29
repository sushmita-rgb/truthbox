import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API = axios.create({ 
  baseURL: isLocal ? "http://localhost:5000/api" : "/api",
  withCredentials: true
});

export default API;
