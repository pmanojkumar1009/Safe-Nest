import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, FileText, Clock, CheckCircle, AlertTriangle, Search, Filter,
  Settings, Home
} from 'lucide-react';
import StatsCard from './StatsCard';
import ComplaintForm from '../complaints/ComplaintForm';
import ComplaintCard from '../complaints/ComplaintCard';
import StudentSettings from './StudentSettings';
import { Complaint } from '../../types';
import { complaintsAPI } from '../../services/api';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'settings'>('dashboard');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Load complaints from backend on component mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await complaintsAPI.getAll();
        const data: Complaint[] = res.data;
        const sorted = data.sort((a: Complaint, b: Complaint) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComplaints(sorted);
      } catch (e) {
        console.error('Failed to load complaints:', e);
        setComplaints([]);
      }
    };
    if (user?._id) fetchComplaints();
  }, [user?._id]);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleComplaintSubmit = async (complaintData: any) => {
    try {
      await complaintsAPI.submit(complaintData);
      // Refetch complaints after submit
      const res = await complaintsAPI.getAll();
      const data: Complaint[] = res.data;
      const sorted = data.sort((a: Complaint, b: Complaint) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComplaints(sorted);
    } catch (e) {
      console.error('Failed to submit complaint:', e);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setShowComplaintForm(false);
    }
  };

  const handleComplaintEdit = (complaintData: any) => {
    if (!editingComplaint) return;

    const updatedComplaint = { 
      ...editingComplaint, 
      ...complaintData, 
      updatedAt: new Date().toISOString() 
    };

    const updatedComplaints = complaints.map(c => 
      c._id === editingComplaint._id ? updatedComplaint : c
    );
    
    setComplaints(updatedComplaints);
    localStorage.setItem(`complaints_${user?._id}`, JSON.stringify(updatedComplaints));
    
    // Update global complaints
    const globalComplaints = JSON.parse(localStorage.getItem('global_complaints') || '[]');
    const updatedGlobalComplaints = globalComplaints.map((c: Complaint) => 
      c._id === editingComplaint._id ? updatedComplaint : c
    );
    localStorage.setItem('global_complaints', JSON.stringify(updatedGlobalComplaints));
    
    setEditingComplaint(null);
  };

  const handleComplaintDelete = (complaintId: string) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      const updatedComplaints = complaints.filter(c => c._id !== complaintId);
      setComplaints(updatedComplaints);
      localStorage.setItem(`complaints_${user?._id}`, JSON.stringify(updatedComplaints));
      
      // Remove from global complaints
      const globalComplaints = JSON.parse(localStorage.getItem('global_complaints') || '[]');
      const updatedGlobalComplaints = globalComplaints.filter((c: Complaint) => c._id !== complaintId);
      localStorage.setItem('global_complaints', JSON.stringify(updatedGlobalComplaints));
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
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">Student</p>
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
            label="My Complaints" 
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
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Stats</h4>
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
                  Welcome back, {user?.name}! 
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your complaints and submit new ones easily
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Complaints"
                  value={stats.total}
                  icon={FileText}
                  color="blue"
                  subtitle="All submissions"
                />
                <StatsCard
                  title="Pending"
                  value={stats.pending}
                  icon={Clock}
                  color="yellow"
                  subtitle="Awaiting review"
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

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  <Plus className="w-6 h-6" />
                  <span>Submit New Complaint</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('complaints')}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-6 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                  <FileText className="w-6 h-6" />
                  <span>View All Complaints</span>
                </button>
              </div>

              {/* Recent Complaints */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Complaints</h2>
                {complaints.slice(0, 3).map(complaint => (
                  <ComplaintCard 
                    key={complaint._id} 
                    complaint={complaint}
                    onEdit={() => setEditingComplaint(complaint)}
                    onDelete={() => handleComplaintDelete(complaint._id)}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Complaints</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage and track all your submitted complaints</p>
                </div>
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Complaint</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search complaints..."
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
                      onEdit={() => setEditingComplaint(complaint)}
                      onDelete={() => handleComplaintDelete(complaint._id)}
                      showActions={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm || statusFilter !== 'all' ? 'No complaints found' : 'No complaints yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by submitting your first complaint'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <button
                      onClick={() => setShowComplaintForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      Submit Complaint
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <StudentSettings />
          )}
        </div>
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <ComplaintForm 
          onClose={() => setShowComplaintForm(false)}
          onSubmit={handleComplaintSubmit}
        />
      )}

      {/* Edit Complaint Modal */}
      {editingComplaint && (
        <ComplaintForm 
          onClose={() => setEditingComplaint(null)}
          onSubmit={handleComplaintEdit}
          initialData={editingComplaint}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default StudentDashboard;