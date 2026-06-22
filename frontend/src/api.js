import axios from "axios";

const api = axios.create({
  baseURL: "https://cloud-storage-production-3a8a.up.railway.app",
});

export default api;