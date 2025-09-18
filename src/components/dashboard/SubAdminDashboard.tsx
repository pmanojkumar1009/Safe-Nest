import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, FileText, Clock, CheckCircle, AlertTriangle, Home, Settings, User, Bell, Building, Shield } from 'lucide-react';
import StatsCard from './StatsCard';
import ComplaintCard from '../complaints/ComplaintCard';
import { Complaint } from '../../types';
import { complaintsAPI } from '../../services/api';

const SubAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await complaintsAPI.getAll();
        const data: Complaint[] = res.data;
        const deptComplaints = data
          .filter(c => c.department === user?.department)
          .sort((a: Complaint, b: Complaint) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setComplaints(deptComplaints);
      } catch (e) {
        console.error('Failed to load department complaints:', e);
        setComplaints([]);
      }
    };
    if (user?.department) fetchComplaints();
  }, [user?.department]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (id: string, status: Complaint['status']) => {
    // Prompt for review when marking as resolved or in-progress
    let review = '';
    if (status === 'resolved' || status === 'in-progress') {
      review = prompt(status === 'resolved'
        ? 'Please provide a resolution summary:'
        : 'Please provide an update on this complaint:') || '';
    }

    try {
      await complaintsAPI.updateStatus(id, { status, remarks: review });
      // Refetch department complaints
      const res = await complaintsAPI.getAll();
      const data: Complaint[] = res.data;
      const deptComplaints = data
        .filter(c => c.department === user?.department)
        .sort((a: Complaint, b: Complaint) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setComplaints(deptComplaints);
    } catch (e) {
      alert('Failed to update status');
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
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">Sub Administrator</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.department}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <SidebarItem 
            id="dashboard" 
            label="Dashboard" 
            icon={<Home className="w-5 h-5" />} 
            isActive={activeTab === 'dashboard'}
          />
          <SidebarItem 
            id="complaints" 
            label="Department Complaints" 
            icon={<FileText className="w-5 h-5" />} 
            isActive={activeTab === 'complaints'}
            count={stats.total}
          />
          <SidebarItem 
            id="settings" 
            label="Settings" 
            icon={<Settings className="w-5 h-5" />} 
            isActive={activeTab === 'settings'}
          />
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Department Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
              <span className="font-semibold text-blue-600">{stats.inProgress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Resolved</span>
              <span className="font-semibold text-green-600">{stats.resolved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-full overflow-auto">
        <div className="p-8 min-h-full">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user?.department} Department Dashboard 🛡️
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and resolve complaints for your department
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Complaints"
                  value={stats.total}
                  icon={FileText}
                  color="blue"
                  subtitle={`${user?.department} Dept.`}
                />
                <StatsCard
                  title="Pending Review"
                  value={stats.pending}
                  icon={Clock}
                  color="yellow"
                  subtitle="Needs attention"
                />
                <StatsCard
                  title="In Progress"
                  value={stats.inProgress}
                  icon={AlertTriangle}
                  color="purple"
                  subtitle="Being resolved"
                />
                <StatsCard
                  title="Resolved"
                  value={stats.resolved}
                  icon={CheckCircle}
                  color="green"
                  subtitle="Completed"
                />
              </div>

              {/* Department Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Department: {user?.department}
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  You are responsible for managing all complaints related to the {user?.department} department. 
                  Review pending complaints, update their status, and ensure timely resolution.
                </p>
              </div>

              {/* Recent Complaints */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Complaints</h2>
                {complaints.slice(0, 3).map(complaint => (
                  <ComplaintCard 
                    key={complaint._id} 
                    complaint={complaint} 
                    showStudentInfo={true}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.department} Department Complaints
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage all complaints assigned to your department
                </p>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search complaints or students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="w-5 h-5 text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Complaints List */}
              {filteredComplaints.length > 0 ? (
                <div className="grid gap-6">
                  {filteredComplaints.map(complaint => (
                    <ComplaintCard 
                      key={complaint._id} 
                      complaint={complaint} 
                      showStudentInfo={true}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm || statusFilter !== 'all' ? 'No complaints found' : 'No complaints yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : `No complaints have been submitted for the ${user?.department} department yet`
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">Advanced settings panel for sub administrators</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Management */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Management</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={user?.name || ''} 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                      <input 
                        type="text" 
                        value={user?.department || ''} 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'New Complaints', desc: 'Get notified of new complaints in your department' },
                      { label: 'Status Updates', desc: 'Receive updates when complaint status changes' },
                      { label: 'Email Notifications', desc: 'Send notifications to your email' },
                      { label: 'Push Notifications', desc: 'Show browser push notifications' }
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

                {/* Department Settings */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Department Settings</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Department: {user?.department}</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        You are responsible for managing all complaints related to the {user?.department} department.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Complaints</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Options */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security Options</h3>
                  </div>
                  <div className="space-y-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                      Change Password
                    </button>
                    <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                      Enable Two-Factor Auth
                    </button>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Account Secure</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubAdminDashboard;