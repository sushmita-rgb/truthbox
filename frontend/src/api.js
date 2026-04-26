import axios from "axios";

const API = axios.create({ 
  baseURL: "https://truthbox-production.up.railway.app/api",
  withCredentials: true
});

export default API;
