import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ChildrenPage from './pages/ChildrenPage';
import ChildDetailPage from './pages/ChildDetailPage';
import StaffPage from './pages/StaffPage';
import DonationsPage from './pages/DonationsPage';
import InventoryPage from './pages/InventoryPage';
import HealthPage from './pages/HealthPage';
import ActivitiesPage from './pages/ActivitiesPage';
import IncidentsPage from './pages/IncidentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="children" element={<ChildrenPage />} />
          <Route path="children/:id" element={<ChildDetailPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="donations" element={<DonationsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
