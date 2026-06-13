import axios from 'axios';

// 統一使用 Vite 環境變數，並移除尾端斜線避免 URL 重複。
const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/+$/, '');

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

export default httpClient;
