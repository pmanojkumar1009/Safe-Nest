import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings, Shield, Bell, Database, Users, Mail, 
  Server, Lock, Eye, Save, AlertTriangle, CheckCircle,
  Activity, Upload, Zap
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);

  const [systemSettings, setSystemSettings] = useState({
    siteName: 'SafeNest',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    maxComplaintsPerUser: 10,
    autoAssignComplaints: true,
    complaintTimeout: 7, // days
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    adminAlerts: true,
    complaintUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    passwordExpiry: 90, // days
    loginAttempts: 5,
    ipWhitelist: '',
  });

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`${section} settings saved successfully!`);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const SectionButton: React.FC<{ id: string; label: string; icon: React.ReactNode }> = ({ 
    id, label, icon 
  }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg text-left transition-all ${
        activeSection === id
          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">System Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 space-y-2">
            <SectionButton 
              id="general" 
              label="General" 
              icon={<Settings className="w-5 h-5" />} 
            />
            <SectionButton 
              id="security" 
              label="Security" 
              icon={<Shield className="w-5 h-5" />} 
            />
            <SectionButton 
              id="notifications" 
              label="Notifications" 
              icon={<Bell className="w-5 h-5" />} 
            />
            <SectionButton 
              id="users" 
              label="User Management" 
              icon={<Users className="w-5 h-5" />} 
            />
            <SectionButton 
              id="database" 
              label="Database" 
              icon={<Database className="w-5 h-5" />} 
            />
            <SectionButton 
              id="system" 
              label="System Info" 
              icon={<Server className="w-5 h-5" />} 
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">General Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Configure basic system settings</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Complaints per User
                      </label>
                      <input
                        type="number"
                        value={systemSettings.maxComplaintsPerUser}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maxComplaintsPerUser: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Complaint Timeout (days)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.complaintTimeout}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, complaintTimeout: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put the system in maintenance mode' },
                      { key: 'registrationEnabled', label: 'User Registration', desc: 'Allow new users to register' },
                      { key: 'emailVerificationRequired', label: 'Email Verification', desc: 'Require email verification for new accounts' },
                      { key: 'autoAssignComplaints', label: 'Auto-assign Complaints', desc: 'Automatically assign complaints to department admins' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings[key as keyof typeof systemSettings] as boolean}
                            onChange={(e) => setSystemSettings(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSaveSettings('General')}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Saving...' : 'Save General Settings'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Configure security and authentication settings</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password Expiry (days)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IP Whitelist (comma-separated)
                    </label>
                    <textarea
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="192.168.1.1, 10.0.0.1"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for admin accounts</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorAuth}
                          onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveSettings('Security')}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Shield className="w-5 h-5" />
                    <span>{loading ? 'Saving...' : 'Save Security Settings'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* System Info */}
            {activeSection === 'system' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">View system status and information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">System Status</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Status:</span>
                        <span className="font-medium text-green-900 dark:text-green-100">Online</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Uptime:</span>
                        <span className="font-medium text-green-900 dark:text-green-100">15 days, 3 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Version:</span>
                        <span className="font-medium text-green-900 dark:text-green-100">v2.1.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Database</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Connection:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Size:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">245 MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-300">Last Backup:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[
                      { time: '2 minutes ago', action: 'New complaint submitted by John Student' },
                      { time: '15 minutes ago', action: 'Sub admin created for IT Department' },
                      { time: '1 hour ago', action: 'System backup completed successfully' },
                      { time: '3 hours ago', action: 'Complaint #1234 resolved by Civil Admin' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">{activity.time}</span>
                        <span className="text-gray-900 dark:text-white">{activity.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other sections can be implemented similarly */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notification Settings</h2>
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

            {activeSection === 'users' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage user accounts, permissions, and access control</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">1,247</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Active accounts</p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Sub Admins</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">15</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Department admins</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Students</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">1,232</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Student accounts</p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Management Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Account Management</h4>
                      <div className="space-y-2">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          View All Users
                        </button>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Create New User
                        </button>
                        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Bulk User Import
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Permission Management</h4>
                      <div className="space-y-2">
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Manage Roles
                        </button>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Access Control
                        </button>
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Deactivate Users
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'database' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Database Management</h2>
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

                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200/50 dark:border-red-800/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">MongoDB Connection Info</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                    <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Connection String:</strong></p>
                    <p className="text-blue-600 dark:text-blue-400 break-all">mongodb://localhost:27017/safenest</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-4 mb-2"><strong>Collections:</strong></p>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• users (login credentials, profiles)</li>
                      <li>• complaints (all complaint data)</li>
                      <li>• sessions (user sessions)</li>
                      <li>• notifications (system notifications)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;