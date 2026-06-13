import axios from 'axios';

// Backend API base URL for local Spring Boot integration.
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 10000,
});

export default httpClient;
