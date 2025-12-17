// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";
export const API_URL = `${API_BASE_URL}/api`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;

export default {
  API_BASE_URL,
  API_URL,
  UPLOADS_URL,
};
