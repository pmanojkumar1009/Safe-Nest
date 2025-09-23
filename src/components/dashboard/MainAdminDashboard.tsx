import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, FileText, Shield, Plus, Search, Settings,
  Clock, CheckCircle, AlertTriangle, UserPlus, BarChart3,
  Activity, Target, Award, Zap, Home,
  Database, Bell, Upload
} from 'lucide-react';
import StatsCard from './StatsCard';
import ComplaintCard from '../complaints/ComplaintCard';
import CreateSubAdminForm from '../admin/CreateSubAdminForm';
import AdminSettings from './AdminSettings';
import AdminAnalytics from './AdminAnalytics';
import { complaintsAPI, adminAPI } from '../../services/api';
import { Complaint, User } from '../../types';

const MainAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'users' | 'subadmins' | 'analytics' | 'settings' | 'database' | 'notifications'>('overview');
  const [showCreateSubAdmin, setShowCreateSubAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [subAdmins, setSubAdmins] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState({ complaints: false, subAdmins: false, users: false });
  const [errors, setErrors] = useState<{ complaints?: string; subAdmins?: string; users?: string }>({});

  // Load data on component mount from backend
  useEffect(() => {
    const loadData = async () => {
      setLoading({ complaints: true, subAdmins: true, users: true });
      setErrors({});
      try {
        const [complaintsRes, subAdminsRes, usersRes] = await Promise.all([
          complaintsAPI.getAll().catch((e) => { throw { key: 'complaints', error: e }; }),
          adminAPI.getSubAdmins().catch((e) => { throw { key: 'subAdmins', error: e }; }),
          adminAPI.getAllUsers().catch((e) => { throw { key: 'users', error: e }; }),
        ] as any);
        const sortedComplaints: Complaint[] = complaintsRes.data.sort((a: Complaint, b: Complaint) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComplaints(sortedComplaints);
        setSubAdmins(subAdminsRes.data);
        setAllUsers(usersRes.data);
      } catch (wrapped: any) {
        console.error('Failed to load admin data:', wrapped);
        const key = wrapped?.key as 'complaints' | 'subAdmins' | 'users' | undefined;
        if (key) {
          setErrors((prev) => ({ ...prev, [key]: wrapped?.error?.response?.data?.message || 'Failed to load data' }));
          if (key === 'complaints') setComplaints([]);
          if (key === 'subAdmins') setSubAdmins([]);
          if (key === 'users') setAllUsers([]);
        }
      } finally {
        setLoading({ complaints: false, subAdmins: false, users: false });
      }
    };
    loadData();
  }, []);

  // On-demand loading when navigating between tabs
  useEffect(() => {
    const loadUsers = async () => {
      if (loading.users) return;
      setLoading((prev) => ({ ...prev, users: true }));
      setErrors((prev) => ({ ...prev, users: undefined }));
      try {
        const usersRes = await adminAPI.getAllUsers();
        setAllUsers(usersRes.data);
      } catch (e: any) {
        setErrors((prev) => ({ ...prev, users: e?.response?.data?.message || 'Failed to load users' }));
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    const loadSubAdmins = async () => {
      if (loading.subAdmins) return;
      setLoading((prev) => ({ ...prev, subAdmins: true }));
      setErrors((prev) => ({ ...prev, subAdmins: undefined }));
      try {
        const subAdminsRes = await adminAPI.getSubAdmins();
        setSubAdmins(subAdminsRes.data);
      } catch (e: any) {
        setErrors((prev) => ({ ...prev, subAdmins: e?.response?.data?.message || 'Failed to load sub admins' }));
      } finally {
        setLoading((prev) => ({ ...prev, subAdmins: false }));
      }
    };

    const loadComplaints = async () => {
      if (loading.complaints) return;
      setLoading((prev) => ({ ...prev, complaints: true }));
      setErrors((prev) => ({ ...prev, complaints: undefined }));
      try {
        const complaintsRes = await complaintsAPI.getAll();
        const sortedComplaints: Complaint[] = complaintsRes.data.sort((a: Complaint, b: Complaint) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComplaints(sortedComplaints);
      } catch (e: any) {
        setErrors((prev) => ({ ...prev, complaints: e?.response?.data?.message || 'Failed to load complaints' }));
      } finally {
        setLoading((prev) => ({ ...prev, complaints: false }));
      }
    };

    if (activeTab === 'users' && (allUsers.length === 0 || errors.users)) {
      loadUsers();
    } else if (activeTab === 'subadmins' && (subAdmins.length === 0 || errors.subAdmins)) {
      loadSubAdmins();
    } else if (activeTab === 'complaints' && (complaints.length === 0 || errors.complaints)) {
      loadComplaints();
    }
  }, [activeTab]);

  const stats = {
    totalComplaints: complaints.length,
    pendingComplaints: complaints.filter(c => c.status === 'pending').length,
    inProgressComplaints: complaints.filter(c => c.status === 'in-progress').length,
    resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
    rejectedComplaints: complaints.filter(c => c.status === 'rejected').length,
    totalSubAdmins: subAdmins.length,
    totalUsers: allUsers.length,
    totalStudents: allUsers.filter(u => u.role === 'student').length,
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (id: string, status: Complaint['status']) => {
    try {
      await complaintsAPI.updateStatus(id, { status });
      const res = await complaintsAPI.getAll();
      const sorted: Complaint[] = res.data.sort((a: Complaint, b: Complaint) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComplaints(sorted);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCreateSubAdmin = async (adminData: any) => {
    try {
      await adminAPI.createSubAdmin(adminData);
      const [subAdminsRes, usersRes] = await Promise.all([
        adminAPI.getSubAdmins(),
        adminAPI.getAllUsers(),
      ]);
      setSubAdmins(subAdminsRes.data);
      setAllUsers(usersRes.data);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to create sub admin');
    }
  };

  const handleAssignComplaint = async (complaintId: string, subAdminId: string) => {
    try {
      await complaintsAPI.assign(complaintId, { subAdminId });
      const res = await complaintsAPI.getAll();
      const sorted: Complaint[] = res.data.sort((a: Complaint, b: Complaint) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComplaints(sorted);
    } catch (e) {
      alert('Failed to assign complaint');
    }
  };

  const SidebarItem: React.FC<{ 
    id: string; 
    label: string; 
    icon: React.ReactNode; 
    isActive: boolean;
    count?: number;
  }> = ({ id, label, icon, isActive, count }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center justify-between w-full p-4 rounded-xl font-medium transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          isActive ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 min-h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 p-6 flex-shrink-0 overflow-y-auto sticky top-0">
        {/* User Profile */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-red-600 dark:text-red-400">Main Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <SidebarItem 
            id="overview" 
            label="Overview" 
            icon={<Home className="w-5 h-5" />} 
            isActive={activeTab === 'overview'}
          />
          <SidebarItem 
            id="complaints" 
            label="All Complaints" 
            icon={<FileText className="w-5 h-5" />} 
            isActive={activeTab === 'complaints'}
            count={stats.totalComplaints}
          />
          <SidebarItem 
            id="subadmins" 
            label="Sub Admins" 
            icon={<Shield className="w-5 h-5" />} 
            isActive={activeTab === 'subadmins'}
            count={stats.totalSubAdmins}
          />
          <SidebarItem 
            id="users" 
            label="All Users" 
            icon={<Users className="w-5 h-5" />} 
            isActive={activeTab === 'users'}
            count={stats.totalUsers}
          />
          <SidebarItem 
            id="analytics" 
            label="Analytics" 
            icon={<BarChart3 className="w-5 h-5" />} 
            isActive={activeTab === 'analytics'}
          />
          <SidebarItem 
            id="settings" 
            label="Settings" 
            icon={<Settings className="w-5 h-5" />} 
            isActive={activeTab === 'settings'}
          />
          <SidebarItem 
            id="database" 
            label="Database" 
            icon={<Database className="w-5 h-5" />} 
            isActive={activeTab === 'database'}
          />
          <SidebarItem 
            id="notifications" 
            label="Notifications" 
            icon={<Bell className="w-5 h-5" />} 
            isActive={activeTab === 'notifications'}
          />
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">System Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.pendingComplaints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="font-semibold text-blue-600">{stats.inProgressComplaints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Resolved</span>
              <span className="font-semibold text-green-600">{stats.resolvedComplaints}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-full overflow-auto">
        <div className="p-8 min-h-full">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Main Admin Dashboard 
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete oversight of the SafeNest complaint management system
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Complaints"
                  value={stats.totalComplaints}
                  icon={FileText}
                  color="blue"
                  subtitle="All departments"
                />
                <StatsCard
                  title="Pending"
                  value={stats.pendingComplaints}
                  icon={Clock}
                  color="yellow"
                  subtitle="Needs review"
                />
                <StatsCard
                  title="In Progress"
                  value={stats.inProgressComplaints}
                  icon={AlertTriangle}
                  color="purple"
                  subtitle="Being resolved"
                />
                <StatsCard
                  title="Resolved"
                  value={stats.resolvedComplaints}
                  icon={CheckCircle}
                  color="green"
                  subtitle="Completed"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setShowCreateSubAdmin(true)}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  <UserPlus className="w-6 h-6" />
                  <span>Create Sub Admin</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  <FileText className="w-6 h-6" />
                  <span>Manage Complaints</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>View Analytics</span>
                </button>
              </div>

              {/* System Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Resolution Rate</h4>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {stats.totalComplaints > 0 ? Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) : 0}%
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Active Issues</h4>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {stats.pendingComplaints + stats.inProgressComplaints}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Avg Response</h4>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">2.5 days</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Complaints</h2>
                {complaints.slice(0, 3).map(complaint => (
                  <div key={complaint._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <ComplaintCard 
                      complaint={complaint} 
                      showStudentInfo={true}
                      onStatusUpdate={handleStatusUpdate}
                    />
                    {complaint.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assign to:</span>
                          <select
                            onChange={(e) => handleAssignComplaint(complaint._id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            defaultValue=""
                          >
                            <option value="">Select Sub Admin</option>
                            {subAdmins
                              .filter(admin => admin.department === complaint.department)
                              .map(admin => (
                                <option key={admin._id} value={admin._id}>
                                  {admin.name} ({admin.department})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Complaints</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage complaints from all departments and students</p>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search all complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Complaints List */}
              {filteredComplaints.length > 0 ? (
                <div className="grid gap-6">
                  {filteredComplaints.map(complaint => (
                    <div key={complaint._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                      <ComplaintCard 
                        complaint={complaint} 
                        showStudentInfo={true}
                        onStatusUpdate={handleStatusUpdate}
                      />
                      {complaint.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Assign to:</span>
                            <select
                              onChange={(e) => handleAssignComplaint(complaint._id, e.target.value)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              defaultValue=""
                            >
                              <option value="">Select Sub Admin</option>
                              {subAdmins
                                .filter(admin => admin.department === complaint.department)
                                .map(admin => (
                                  <option key={admin._id} value={admin._id}>
                                    {admin.name} ({admin.department})
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No complaints found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}

          {/* Sub Admins Tab */}
          {activeTab === 'subadmins' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sub Administrators</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage department administrators and their permissions</p>
                </div>
                <button
                  onClick={() => setShowCreateSubAdmin(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sub Admin</span>
                </button>
              </div>

              {/* Login Credentials Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Sub Admin Login Credentials</h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                  Use these credentials to test sub-admin functionality. All sub-admins use the same password.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subAdmins.map(admin => (
                    <div key={admin._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{admin.department}</h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(admin.email);
                            alert('Email copied to clipboard!');
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <span className="text-xs">Copy</span>
                        </button>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">ID:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{admin.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">password123</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Set credentials and redirect to login page
                          localStorage.setItem('temp_login_email', admin.email);
                          localStorage.setItem('temp_login_password', 'password123');
                          
                          // Log out current user
                          localStorage.removeItem('safenest_user');
                          localStorage.removeItem('safenest_token');
                          
                          // Redirect to root path where login form is shown
                          window.location.href = '/';
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                      >
                        Test Login
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4">
                {subAdmins.map(admin => (
                  <div key={admin._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {admin.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{admin.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{admin.email}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full text-xs font-medium">
                              {admin.department}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              admin.isActive 
                                ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                                : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                            }`}>
                              {admin.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                        {admin.lastLogin && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Last login: {new Date(admin.lastLogin).toLocaleString()}
                          </p>
                        )}
                        <div className="mt-2">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Login: {admin.email} / password123
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Users</h1>
                <p className="text-gray-600 dark:text-gray-400">View and manage all registered users in the system</p>
              </div>

              {loading.users && (
                <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>Loading users...</span>
                </div>
              )}

              {!loading.users && errors.users && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  {errors.users}
                </div>
              )}

              {!loading.users && !errors.users && (
                allUsers.length > 0 ? (
                  <div className="grid gap-4">
                    {allUsers.map(u => {
                      const name = u?.name || u?.email || 'User';
                      const email = u?.email || 'unknown@user';
                      const dept = u?.department;
                      const role = u?.role || 'student';
                      const initials = name
                        .split(' ')
                        .filter(Boolean)
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                      const createdAt = u?.createdAt ? new Date(u.createdAt) : new Date();
                      const lastLogin = u?.lastLogin ? new Date(u.lastLogin) : null;

                      const roleLabel = role === 'mainadmin' ? 'Main Admin' : role === 'subadmin' ? 'Sub Admin' : 'Student';
                      const badgeClass = role === 'student'
                        ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                        : role === 'subadmin'
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
                          : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';

                      return (
                        <div key={u._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                role === 'student' 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : role === 'subadmin'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                              }`}>
                                <span className="text-white font-semibold">{initials}</span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{email}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                                    {roleLabel}
                                  </span>
                                  {dept && (
                                    <span className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full text-xs">
                                      {dept}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Joined {createdAt.toLocaleDateString()}
                              </p>
                              {lastLogin && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  Last active: {lastLogin.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Users will appear here once registered.</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AdminAnalytics complaints={complaints} users={allUsers} />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AdminSettings />
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Database Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Backup, restore, and optimize database operations</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backup Database</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create a backup of all system data</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Create Backup
                  </button>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Restore Database</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Restore from a previous backup</p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Restore Backup
                  </button>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimize Database</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Optimize database performance</p>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Optimize Now
                  </button>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Database Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">245 MB</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Database Size</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">1,247</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2 hrs ago</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Backup</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">99.9%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notification Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">Configure notification preferences and alerts</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'New Complaint Alerts', desc: 'Get notified when new complaints are submitted' },
                      { label: 'Status Updates', desc: 'Receive updates when complaint status changes' },
                      { label: 'Daily Reports', desc: 'Daily summary of system activity' },
                      { label: 'System Alerts', desc: 'Critical system notifications' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Browser Notifications', desc: 'Show notifications in browser' },
                      { label: 'Mobile Push', desc: 'Send push notifications to mobile devices' },
                      { label: 'Desktop Alerts', desc: 'Show desktop notification alerts' },
                      { label: 'Sound Alerts', desc: 'Play sound for important notifications' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={index < 2} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Sub Admin Modal */}
      {showCreateSubAdmin && (
        <CreateSubAdminForm 
          onClose={() => setShowCreateSubAdmin(false)}
          onSubmit={handleCreateSubAdmin}
        />
      )}
    </div>
  );
};

export default MainAdminDashboard;