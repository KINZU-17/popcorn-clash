/**
 * Centralized configuration for the frontend application.
 */

// Use the VITE_BACKEND_URL from environment variables in production,
// but default to the local Flask server for development.
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5555";

// You can then import this URL wherever you make API calls, for example:
// import { API_BASE_URL } from './config';
// const response = await fetch(`${API_BASE_URL}/api/auth/login`, { ... });