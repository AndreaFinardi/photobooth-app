import axios from 'axios';
import { toast } from 'react-toastify';

// Configurazione base di axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere il token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire errori
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Sessione scaduta. Effettua il login.');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('Accesso negato. Permessi insufficienti.');
    } else if (error.response?.status === 500) {
      toast.error('Errore del server. Riprova più tardi.');
    }
    return Promise.reject(error);
  }
);

// API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  verifyToken: () => api.get('/auth/verify'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const roomAPI = {
  createRoom: (roomData) => api.post('/rooms/create', roomData),
  joinRoom: (roomCode) => api.post('/rooms/join', { room_code: roomCode }),
  getUserRooms: () => api.get('/rooms/my-rooms'),
  getRoomDetails: (roomId) => api.get(`/rooms/${roomId}`),
  leaveRoom: (roomId) => api.delete(`/rooms/${roomId}/leave`),
  deactivateRoom: (roomId) => api.delete(`/rooms/${roomId}/deactivate`),
  updateRoomSettings: (roomId, settings) => api.put(`/rooms/${roomId}/settings`, { settings }),
  getRoomParticipants: (roomId) => api.get(`/rooms/${roomId}/participants`),
  removeParticipant: (roomId, userId) => api.delete(`/rooms/${roomId}/participants/${userId}`),
  regenerateCode: (roomId) => api.post(`/rooms/${roomId}/regenerate-code`),
};

export const photoAPI = {
  uploadPhoto: (roomId, formData) => {
    return api.post(`/photos/room/${roomId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getRoomPhotos: (roomId, params) => api.get(`/photos/room/${roomId}`, { params }),
  getUserPhotos: (userId, params) => api.get(`/photos/user/${userId}`, { params }),
  getPhotoDetails: (photoId) => api.get(`/photos/${photoId}`),
  addToLibrary: (photoId) => api.post(`/photos/${photoId}/library`),
  removeFromLibrary: (photoId) => api.delete(`/photos/${photoId}/library`),
  getUserLibrary: (userId) => api.get(`/photos/library/${userId}`),
  getSharedPhotos: () => api.get('/photos/shared/recent'),
  updatePhotoVisibility: (photoId, isPublic) => 
    api.put(`/photos/${photoId}/visibility`, { is_public: isPublic }),
  deletePhoto: (photoId) => api.delete(`/photos/${photoId}`),
  searchPhotos: (params) => api.get('/photos/search', { params }),
};

export const notificationAPI = {
  getUserNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getNotificationStats: () => api.get('/notifications/stats'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;