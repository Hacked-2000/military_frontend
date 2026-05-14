import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username, password) => 
  api.post('/auth/login', { username, password });

export const getDashboardMetrics = (params) => 
  api.get('/dashboard/metrics', { params });

export const getPurchases = (params) => 
  api.get('/purchases', { params });

export const createPurchase = (data) => 
  api.post('/purchases', data);

export const getTransfers = (params) => 
  api.get('/transfers', { params });

export const createTransfer = (data) => 
  api.post('/transfers', data);

export const getAssignments = (params) => 
  api.get('/assignments', { params });

export const createAssignment = (data) => 
  api.post('/assignments', data);

export const getExpenditures = (params) => 
  api.get('/expenditures', { params });

export const createExpenditure = (data) => 
  api.post('/expenditures', data);

export const getBases = () => 
  api.get('/bases');

export const getEquipmentTypes = () => 
  api.get('/equipment-types');

export default api;
