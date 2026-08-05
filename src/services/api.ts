import axios from 'axios';
import { ApiLog } from '../types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Listener pattern for real-time API inspection panel
type ApiLogListener = (log: ApiLog) => void;
const listeners: ApiLogListener[] = [];

export const subscribeApiLogs = (listener: ApiLogListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyLog = (log: ApiLog) => {
  listeners.forEach((l) => l(log));
};

// Request interceptor for JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('flowdesk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Store start time for latency calculation
  (config as any).metadata = { startTime: new Date().getTime() };
  return config;
});

// Response interceptor for logging & error handling
apiClient.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any).metadata?.startTime || new Date().getTime();
    const durationMs = new Date().getTime() - startTime;

    const log: ApiLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      method: (response.config.method?.toUpperCase() as any) || 'GET',
      url: response.config.url || '',
      status: response.status,
      statusText: response.statusText || 'OK',
      durationMs,
      requestBody: response.config.data ? JSON.parse(response.config.data) : undefined,
      responseData: response.data,
      headers: {
        'content-type': 'application/json',
        'authorization': response.config.headers.Authorization ? 'Bearer eyJhbGci...' : 'None',
      },
    };
    notifyLog(log);
    return response;
  },
  (error) => {
    const config = error.config || {};
    const startTime = config.metadata?.startTime || new Date().getTime();
    const durationMs = new Date().getTime() - startTime;

    const status = error.response ? error.response.status : 500;
    const statusText = error.response ? error.response.statusText : 'Network Error';

    const log: ApiLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      method: (config.method?.toUpperCase() as any) || 'GET',
      url: config.url || '',
      status,
      statusText,
      durationMs,
      requestBody: config.data ? JSON.parse(config.data) : undefined,
      responseData: error.response?.data || { error: error.message },
      headers: {
        'content-type': 'application/json',
      },
    };
    notifyLog(log);
    return Promise.reject(error);
  }
);
