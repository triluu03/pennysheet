import axios from "axios";
import qs from "qs";

/**
 * Axios client to work with the backend via REST API.
 */
const client = axios.create({
  baseURL: import.meta.env.VITE_PENNYSHEET_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: { serialize: params => qs.stringify(params, { arrayFormat: "repeat" }) }
});

export default client;
