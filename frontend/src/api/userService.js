import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Or however you store your token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth specific calls (can also be in a separate authService.js)
export const signupUser = async (credentials) => {
    const response = await apiClient.post('/auth/signup', credentials);
    return response.data; // Should contain { user, token }
};

export const loginUser = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; // Should contain { user, token }
};

// User Profile CRUD
export const getAllUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post('/users', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};

// Follow/Unfollow
export const followUser = async (followerId, followingId) => {
  const response = await apiClient.post(`/users/${followerId}/follow/${followingId}`);
  return response.data;
};

export const unfollowUser = async (followerId, followingId) => {
  const response = await apiClient.delete(`/users/${followerId}/unfollow/${followingId}`);
  return response.data;
};

// Not strictly needed if full user object contains these lists, but good to have
export const getFollowingList = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/following`);
  return response.data;
};

export const getFollowersList = async (userId) => {
  const response = await apiClient.get(`/users/${userId}/followers`);
  return response.data;
};

export default apiClient;