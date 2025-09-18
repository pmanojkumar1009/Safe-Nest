import React from 'react';
import { 
  BarChart3, TrendingUp, Users, FileText, Clock, CheckCircle,
  AlertTriangle, Target, Award, Activity, Building, Zap
} from 'lucide-react';
import { Complaint, User } from '../../types';

interface AdminAnalyticsProps {
  complaints: Complaint[];
  users: User[];
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ complaints, users }) => {
  // Calculate comprehensive analytics
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
  const rejectedComplaints = complaints.filter(c => c.status === 'rejected').length;
  
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
  const totalUsers = users.length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalSubAdmins = users.filter(u => u.role === 'subadmin').length;

  // Department statistics
  const departmentStats = complaints.reduce((acc, complaint) => {
    acc[complaint.department] = (acc[complaint.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority breakdown
  const priorityStats = complaints.reduce((acc, complaint) => {
    acc[complaint.priority] = (acc[complaint.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly trend (last 12 months)
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const count = complaints.filter(c => {
      const complaintDate = new Date(c.createdAt);
      return complaintDate.getMonth() === date.getMonth() && 
             complaintDate.getFullYear() === date.getFullYear();
    }).length;
    return { month: monthName, count };
  }).reverse();

  // Category breakdown
  const categoryStats = complaints.reduce((acc, complaint) => {
    const category = complaint.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Performance metrics
  const avgResolutionTime = 2.5; // Mock data
  const responseTime = 4.2; // Mock data
  const satisfactionRate = 87; // Mock data

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }> = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
  // Pie Chart Component
  const PieChart: React.FC<{
    data: { label: string; value: number; color: string }[];
    title: string;
  }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                className="dark:stroke-gray-600"
              />
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const strokeDasharray = `${percentage * 2.51} 251.2`;
                const strokeDashoffset = -cumulativePercentage * 2.51;
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Advanced Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and system performance metrics</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Complaints"
          value={totalComplaints}
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          subtitle="All time"
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          subtitle="Success rate"
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Avg Resolution Time"
          value={`${avgResolutionTime} days`}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          subtitle="Time to resolve"
          trend={{ value: 8, isPositive: false }}
        />
        <MetricCard
          title="User Satisfaction"
          value={`${satisfactionRate}%`}
          icon={<Award className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          subtitle="User rating"
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-indigo-500 to-indigo-600"
          subtitle="Registered users"
        />
        <MetricCard
          title="Active Students"
          value={totalStudents}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-emerald-500 to-emerald-600"
          subtitle="Student accounts"
        />
        <MetricCard
          title="Sub Admins"
          value={totalSubAdmins}
          icon={<Building className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-red-500 to-red-600"
          subtitle="Department admins"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution */}
        <PieChart
          title="Status Distribution"
          data={[
            { label: 'Resolved', value: resolvedComplaints, color: '#10b981' },
            { label: 'In Progress', value: inProgressComplaints, color: '#3b82f6' },
            { label: 'Pending', value: pendingComplaints, color: '#f59e0b' },
            { label: 'Rejected', value: rejectedComplaints, color: '#ef4444' },
          ]}
        />

        {/* Department Performance Pie Chart */}
        <PieChart
          title="Department Distribution"
          data={Object.entries(departmentStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([dept, count], index) => {
              const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];
              return {
                label: dept.length > 15 ? dept.substring(0, 15) + '...' : dept,
                value: count,
                color: colors[index % colors.length]
              };
            })}
        />

        {/* Priority Distribution Pie Chart */}
        <PieChart
          title="Priority Distribution"
          data={[
            { label: 'Low', value: priorityStats.low || 0, color: '#10b981' },
            { label: 'Medium', value: priorityStats.medium || 0, color: '#f59e0b' },
            { label: 'High', value: priorityStats.high || 0, color: '#f97316' },
            { label: 'Urgent', value: priorityStats.urgent || 0, color: '#ef4444' },
          ]}
        />
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">12-Month Complaint Trend</h3>
        <div className="flex items-end justify-between h-80 space-x-2">
          {monthlyStats.map(({ month, count }) => {
            const maxCount = Math.max(...monthlyStats.map(s => s.count));
            const height = maxCount > 0 ? (count / maxCount) * 280 : 0;
            return (
              <div key={month} className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center justify-end h-72">
                  <span className="text-xs font-medium text-gray-900 dark:text-white mb-2">{count}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-[8px] transition-all duration-500"
                    style={{ height: `${height}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority and Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Analysis */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Priority Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(priorityStats).map(([priority, count]) => {
              const colors = {
                low: 'from-green-500 to-green-600',
                medium: 'from-yellow-500 to-yellow-600',
                high: 'from-orange-500 to-orange-600',
                urgent: 'from-red-500 to-red-600',
              };
              const percentage = Math.round((count / totalComplaints) * 100);
              return (
                <div key={priority} className={`bg-gradient-to-r ${colors[priority as keyof typeof colors]} rounded-xl p-4 text-white`}>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm opacity-90 capitalize">{priority}</p>
                    <p className="text-xs opacity-75">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Analysis */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count], index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                const color = colors[index % colors.length];
                const percentage = Math.round((count / totalComplaints) * 100);
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">System Performance Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{resolutionRate}%</p>
            <p className="text-blue-600 dark:text-blue-400 font-medium">Resolution Rate</p>
            <p className="text-sm text-blue-500 dark:text-blue-500">Above industry average</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{avgResolutionTime}</p>
            <p className="text-blue-600 dark:text-blue-400 font-medium">Avg Resolution (days)</p>
            <p className="text-sm text-blue-500 dark:text-blue-500">Faster than target</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{satisfactionRate}%</p>
            <p className="text-blue-600 dark:text-blue-400 font-medium">User Satisfaction</p>
            <p className="text-sm text-blue-500 dark:text-blue-500">Excellent rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{responseTime}h</p>
            <p className="text-blue-600 dark:text-blue-400 font-medium">Avg Response Time</p>
            <p className="text-sm text-blue-500 dark:text-blue-500">Within SLA</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;