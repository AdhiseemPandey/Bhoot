import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (username: string, email: string, password: string) => 
    api.post('/auth/register', { username, email, password }).then(res => res.data),
  
  getCurrentUser: () => 
    api.get('/auth/me').then(res => res.data),
};

export const questionBankAPI = {
  create: (data: any) => 
    api.post('/question-banks', data).then(res => res.data),
  
  getAll: () => 
    api.get('/question-banks').then(res => res.data),
  
  getById: (id: string) => 
    api.get(`/question-banks/${id}`).then(res => res.data),
  
  update: (id: string, data: any) => 
    api.put(`/question-banks/${id}`, data).then(res => res.data),
  
  delete: (id: string) => 
    api.delete(`/question-banks/${id}`).then(res => res.data),
};

export const gameAPI = {
  create: (questionBankId: string, settings: any) => 
    api.post('/games/create', { questionBankId, settings }).then(res => res.data),
  
  join: (pin: string, username: string) => 
    api.post('/games/join', { pin, username }).then(res => res.data),
  
  get: (pin: string) => 
    api.get(`/games/${pin}`).then(res => res.data),
  
  start: (pin: string) => 
    api.post(`/games/${pin}/start`).then(res => res.data),
};

export default api;