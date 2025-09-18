import React from 'react';
import { Calendar, Clock, User, Building, AlertTriangle, CheckCircle, XCircle, Hourglass, Edit, Trash2 } from 'lucide-react';
import { Complaint } from '../../types';

interface ComplaintCardProps {
  complaint: Complaint;
  showStudentInfo?: boolean;
  onStatusUpdate?: (id: string, status: Complaint['status']) => void;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ 
  complaint, 
  showStudentInfo = false, 
  onStatusUpdate,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'in-progress': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'resolved': return 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'text-orange-700 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'urgent': return 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <Hourglass className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {complaint.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
              {getStatusIcon(complaint.status)}
              <span className="capitalize">{complaint.status.replace('-', ' ')}</span>
            </div>
            <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
              <AlertTriangle className="w-3 h-3" />
              <span className="capitalize">{complaint.priority}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">#{complaint._id.slice(-6).toUpperCase()}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{getTimeAgo(complaint.createdAt)}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
        {complaint.description}
      </p>

      {/* Remarks - Always visible to students */}
      {complaint.remarks && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            {complaint.assignedToName ? `${complaint.assignedToName}'s Review:` : 'Admin Remarks:'}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">{complaint.remarks}</p>
        </div>
      )}

      {/* Assigned To */}
      {complaint.assignedToName && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Assigned To:</p>
          <p className="text-sm text-green-700 dark:text-green-300">{complaint.assignedToName}</p>
        </div>
      )}

      {/* Resolution Status for Students */}
      {complaint.status === 'resolved' && complaint.resolvedAt && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">✅ Complaint Resolved</p>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()} at {new Date(complaint.resolvedAt).toLocaleTimeString()}
          </p>
          {complaint.remarks && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              <strong>Resolution:</strong> {complaint.remarks}
            </p>
          )}
        </div>
      )}

      {/* Progress Status for Students */}
      {complaint.status === 'in-progress' && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Hourglass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">🔄 In Progress</p>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Your complaint is being actively worked on by our team.
          </p>
          {complaint.assignedToName && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              <strong>Handled by:</strong> {complaint.assignedToName}
            </p>
          )}
        </div>
      )}
      {/* Meta Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Building className="w-4 h-4" />
          <span>{complaint.department}</span>
        </div>
        
        {showStudentInfo && (
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>{complaint.studentName}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Created {formatDate(complaint.createdAt)}</span>
        </div>
        
        {complaint.updatedAt !== complaint.createdAt && (
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Updated {formatDate(complaint.updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Student Actions */}
      {showActions && onEdit && onDelete && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {complaint.status === 'pending' && (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(complaint._id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </>
            )}
            {complaint.status !== 'pending' && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm">
                Cannot edit after review
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions for Admin */}
      {onStatusUpdate && complaint.status !== 'resolved' && complaint.status !== 'rejected' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {complaint.status === 'pending' && (
              <>
                <button
                  onClick={() => onStatusUpdate(complaint._id, 'in-progress')}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                >
                  Start Progress
                </button>
                <button
                  onClick={() => onStatusUpdate(complaint._id, 'rejected')}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            {complaint.status === 'in-progress' && (
              <button
                onClick={() => onStatusUpdate(complaint._id, 'resolved')}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;