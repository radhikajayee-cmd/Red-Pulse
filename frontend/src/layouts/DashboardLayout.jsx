import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/NotificationContext.jsx';
import api from '../services/api.js';
import {
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Sun,
  Moon,
  Home,
  Users,
  Droplet,
  FileText,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const notifRef = useRef(null);

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s for stock alerts
    return () => clearInterval(interval);
  }, []);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    const role = user?.role;
    const baseLinks = [
      { path: '/dashboard', label: 'Dashboard', icon: <Layers className="w-5 h-5" /> },
    ];

    if (role === 'admin') {
      return [
        ...baseLinks,
        { path: '/donors', label: 'Donors', icon: <Users className="w-5 h-5" /> },
        { path: '/inventory', label: 'Blood Inventory', icon: <Droplet className="w-5 h-5" /> },
        { path: '/requests', label: 'Blood Requests', icon: <FileText className="w-5 h-5" /> },
        { path: '/appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
        { path: '/reports', label: 'Reports & Analytics', icon: <FileText className="w-5 h-5" /> },
        { path: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
      ];
    } else if (role === 'donor') {
      return [
        ...baseLinks,
        { path: '/appointments', label: 'Book Appointment', icon: <Calendar className="w-5 h-5" /> },
        { path: '/profile', label: 'My Profile', icon: <User className="w-5 h-5" /> },
      ];
    } else if (role === 'hospital') {
      return [
        ...baseLinks,
        { path: '/requests', label: 'Blood Requests', icon: <FileText className="w-5 h-5" /> },
        { path: '/profile', label: 'Hospital Profile', icon: <User className="w-5 h-5" /> },
      ];
    }

    return baseLinks;
  };

  const menuItems = getSidebarLinks();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-hospital-gray-abyss transition-colors duration-300 font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-hospital-gray-deep border-r border-gray-200 dark:border-gray-800 p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-hospital-red flex items-center justify-center text-white shadow-md shadow-red-500/20">
            <Heart className="w-6 h-6 animate-pulse-slow fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-hospital-gray-deep dark:text-white">LifeFlow</h1>
            <span className="text-xs text-hospital-red font-semibold tracking-wider uppercase">Blood Bank</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
          <div className="flex items-center gap-3 p-2 rounded-xl mb-4 bg-gray-50 dark:bg-hospital-gray-abyss/50">
            <div className="w-9 h-9 rounded-lg bg-hospital-red/10 text-hospital-red flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate dark:text-gray-200">{user?.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Menu Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-hospital-gray-deep border-r border-gray-200 dark:border-gray-800 p-6 z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-hospital-red flex items-center justify-center text-white">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h1 className="font-bold text-base leading-tight dark:text-white">LifeFlow</h1>
                    <span className="text-[10px] text-hospital-red font-semibold uppercase">Blood Bank</span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5 dark:text-white" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Navbar */}
        <header className="bg-white/80 dark:bg-hospital-gray-deep/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden dark:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-hospital-gray-deep dark:text-white capitalize">
              {location.pathname.replace('/', '') || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors duration-200"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 relative transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-hospital-red text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-hospital-gray-deep border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <span className="font-bold text-sm dark:text-white">Notifications</span>
                      <span className="text-xs text-hospital-red font-semibold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">
                        {unreadCount} Unread
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const typeStyles = {
                            success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                            error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                            info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
                          };
                          return (
                            <div
                              key={notif._id}
                              onClick={() => markAsRead(notif._id)}
                              className={`p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer flex gap-3 transition-colors ${
                                !notif.read ? 'bg-red-50/10 dark:bg-red-900/5' : ''
                              }`}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <span className={`w-2 h-2 rounded-full inline-block ${!notif.read ? 'bg-hospital-red' : 'bg-transparent'}`} />
                              </div>
                              <div>
                                <h5 className={`text-xs font-semibold dark:text-gray-200 ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {notif.title}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Avatar */}
            <div className="w-9 h-9 rounded-xl bg-hospital-red text-white flex items-center justify-center font-bold shadow-md shadow-red-500/10">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
