import axios from 'axios';

// 未来后端 API 完成后，可在这里统一设置 baseURL 和拦截器。
const httpClient = axios.create({
  baseURL: '',
  timeout: 10000,
});

export default httpClient;
