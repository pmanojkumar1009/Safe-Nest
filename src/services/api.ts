import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('safenest_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('safenest_token');
      localStorage.removeItem('safenest_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'subadmin';
  department?: string;
}

export interface CreateSubAdminData {
  name: string;
  email: string;
  password: string;
  department: string;
}

export interface ComplaintData {
  title: string;
  description: string;
  department: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateComplaintStatusData {
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  remarks?: string;
}

export interface AssignComplaintData {
  subAdminId: string;
  remarks?: string;
}

// Notifications
export interface NotificationItem {
  _id: string;
  userId: string;
  type: 'assignment' | 'status' | 'general';
  title: string;
  message: string;
  complaintId?: string;
  read: boolean;
  createdAt: string;
}

// Auth API
export const authAPI = {
  login: (data: LoginData) => api.post('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
};

// Admin API
export const adminAPI = {
  createSubAdmin: (data: CreateSubAdminData) => api.post('/admin/create-subadmin', data),
  getAllUsers: () => api.get('/admin/users'),
  getSubAdmins: () => api.get('/admin/subadmins'),
};

// Complaints API
export const complaintsAPI = {
  submit: (data: ComplaintData) => api.post('/complaints', data),
  getAll: () => api.get('/complaints'),
  updateStatus: (id: string, data: UpdateComplaintStatusData) => 
    api.put(`/complaints/${id}/status`, data),
  assign: (id: string, data: AssignComplaintData) => 
    api.put(`/complaints/${id}/assign`, data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Health Check API
export const healthAPI = {
  check: () => api.get('/health'),
};

// Notifications API
export const notificationsAPI = {
  list: (onlyUnread = true) => api.get<NotificationItem[]>(`/notifications`, { params: { onlyUnread } }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put(`/notifications/read-all`),
};

export default api;