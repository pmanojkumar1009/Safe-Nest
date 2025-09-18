export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'subadmin' | 'mainadmin';
  department?: string;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  lastLogin?: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  department: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  remarks?: string;
  resolvedAt?: string;
  category?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'subadmin';
  department?: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  rejectedComplaints: number;
  totalUsers?: number;
  totalSubAdmins?: number;
  totalStudents?: number;
  avgResolutionTime?: number;
  departmentStats?: { [key: string]: number };
  monthlyStats?: { month: string; count: number }[];
  priorityStats?: { [key: string]: number };
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  complaintUpdates: boolean;
  systemAlerts: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: {
    showEmail: boolean;
    showProfile: boolean;
  };
}