import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Moon, Sun, Shield, Users, FileText, Settings, Bell, Check } from 'lucide-react';
import { notificationsAPI, NotificationItem } from '../../services/api';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread notifications count on mount and when dropdown opens
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!user) return;
        const res = await notificationsAPI.list(true);
        setNotifs(res.data);
      } catch (e) {
        // silently ignore
      }
    };
    fetchUnread();
  }, [user?._id]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggleDropdown = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const res = await notificationsAPI.list(false);
        setNotifs(res.data);
      } catch (e) {
        // ignore
      }
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const markOneRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifs(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'mainadmin': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'subadmin': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'student': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'mainadmin': return <Shield className="w-4 h-4" />;
      case 'subadmin': return <Users className="w-4 h-4" />;
      case 'student': return <FileText className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 transition-all duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 h-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SafeNest</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Smart Complaint Portal</p>
              </div>
            </div>

            {/* User Info & Actions */}
            {user && (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    {notifs.some(n => !n.read) && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                    )}
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
                        <button
                          onClick={markAllRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifs.length === 0 ? (
                          <div className="p-4 text-sm text-gray-600 dark:text-gray-400">No notifications</div>
                        ) : (
                          notifs.map(n => (
                            <div
                              key={n._id}
                              className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${n.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50/60 dark:bg-blue-900/10'}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                                {!n.read && (
                                  <button
                                    onClick={() => markOneRead(n._id)}
                                    className="p-1 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
                                    title="Mark as read"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Badge */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role.replace('admin', ' Admin')}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
                </button>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;