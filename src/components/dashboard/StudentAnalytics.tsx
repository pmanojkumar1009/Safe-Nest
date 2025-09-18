import React from 'react';
import { 
  BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, 
  Calendar, Target, Award, Activity 
} from 'lucide-react';
import { Complaint } from '../../types';

interface StudentAnalyticsProps {
  complaints: Complaint[];
}

const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({ complaints }) => {
  // Calculate analytics data
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
  
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
  
  // Department breakdown
  const departmentStats = complaints.reduce((acc, complaint) => {
    acc[complaint.department] = (acc[complaint.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority breakdown
  const priorityStats = complaints.reduce((acc, complaint) => {
    acc[complaint.priority] = (acc[complaint.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly stats (last 6 months)
  const monthlyStats = Array.from({ length: 6 }, (_, i) => {
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

  // Average resolution time (mock calculation)
  const resolvedWithTime = complaints.filter(c => c.status === 'resolved' && c.resolvedAt);
  const avgResolutionTime = resolvedWithTime.length > 0 
    ? Math.round(resolvedWithTime.reduce((acc, c) => {
        const created = new Date(c.createdAt).getTime();
        const resolved = new Date(c.resolvedAt!).getTime();
        return acc + (resolved - created) / (1000 * 60 * 60 * 24); // days
      }, 0) / resolvedWithTime.length)
    : 0;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Insights into your complaint history and patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={totalComplaints}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          subtitle="All time"
        />
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
          subtitle="Success rate"
        />
        <StatCard
          title="Avg Resolution"
          value={`${avgResolutionTime} days`}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          subtitle="Time to resolve"
        />
        <StatCard
          title="Active Issues"
          value={pendingComplaints + inProgressComplaints}
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          subtitle="Pending + In Progress"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Status Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'Resolved', count: resolvedComplaints, color: 'bg-green-500', icon: CheckCircle },
              { label: 'In Progress', count: inProgressComplaints, color: 'bg-blue-500', icon: Activity },
              { label: 'Pending', count: pendingComplaints, color: 'bg-yellow-500', icon: Clock },
              { label: 'Rejected', count: complaints.filter(c => c.status === 'rejected').length, color: 'bg-red-500', icon: AlertTriangle },
            ].map(({ label, count, color, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${color}`}></div>
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${totalComplaints > 0 ? (count / totalComplaints) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Department Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(departmentStats).map(([dept, count], index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
              const color = colors[index % colors.length];
              return (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{dept}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${color}`}
                        style={{ width: `${(count / totalComplaints) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Trend</h3>
        <div className="flex items-end justify-between h-64 space-x-2">
          {monthlyStats.map(({ month, count }) => {
            const maxCount = Math.max(...monthlyStats.map(s => s.count));
            const height = maxCount > 0 ? (count / maxCount) * 200 : 0;
            return (
              <div key={month} className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center justify-end h-52">
                  <span className="text-xs font-medium text-gray-900 dark:text-white mb-2">{count}</span>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg min-h-[4px]"
                    style={{ height: `${height}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Analysis */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Priority Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(priorityStats).map(([priority, count]) => {
            const colors = {
              low: 'from-green-500 to-green-600',
              medium: 'from-yellow-500 to-yellow-600',
              high: 'from-orange-500 to-orange-600',
              urgent: 'from-red-500 to-red-600',
            };
            return (
              <div key={priority} className={`bg-gradient-to-r ${colors[priority as keyof typeof colors]} rounded-xl p-4 text-white`}>
                <div className="text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm opacity-90 capitalize">{priority}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Performance Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-blue-800 dark:text-blue-200">
            <p className="font-medium">Most Active Department</p>
            <p>{Object.entries(departmentStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}</p>
          </div>
          <div className="text-blue-800 dark:text-blue-200">
            <p className="font-medium">Average Response Time</p>
            <p>{avgResolutionTime > 0 ? `${avgResolutionTime} days` : 'N/A'}</p>
          </div>
          <div className="text-blue-800 dark:text-blue-200">
            <p className="font-medium">Success Rate</p>
            <p>{resolutionRate}% complaints resolved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;