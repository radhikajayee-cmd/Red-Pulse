import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Chatbot from './components/Chatbot.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DonorManagement from './pages/DonorManagement.jsx';
import InventoryManagement from './pages/InventoryManagement.jsx';
import BloodRequests from './pages/BloodRequests.jsx';
import Appointments from './pages/Appointments.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';

// Protected route — redirects to /login if not authenticated
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-hospital-gray-abyss">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-hospital-red border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard wrapped in layout + chatbot
const DashboardPage = ({ children }) => (
  <DashboardLayout>
    {children}
    <Chatbot />
  </DashboardLayout>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage><Dashboard /></DashboardPage>
        </ProtectedRoute>
      } />

      <Route path="/donors" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardPage><DonorManagement /></DashboardPage>
        </ProtectedRoute>
      } />

      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardPage><InventoryManagement /></DashboardPage>
        </ProtectedRoute>
      } />

      <Route path="/requests" element={
        <ProtectedRoute allowedRoles={['admin', 'hospital']}>
          <DashboardPage><BloodRequests /></DashboardPage>
        </ProtectedRoute>
      } />

      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['admin', 'donor']}>
          <DashboardPage><Appointments /></DashboardPage>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardPage><Reports /></DashboardPage>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardPage><Profile /></DashboardPage>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
