import axios from "axios";

/**
 * Axios client to work with the backend via REST API.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_PENNYSHEET_BACKEND_URL,
  headers: { "Content-Type": "application/json" }
});

export default client;
