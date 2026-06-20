import axios from "axios";

/**
 * Axios client to work with the backend via REST API.
 */
const client = axios.create({
  baseURL: import.meta.env.PENNYSHEET_BACKEND_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" }
});

export default client;
