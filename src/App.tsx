import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';

const AppRoutes: React.FC = () => {
  const { user, isLoading, isManager } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600 gap-3 p-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs sm:text-sm 2xl:text-base tracking-wider uppercase font-mono text-slate-500 font-semibold text-center">Initializing LiveTracker...</span>
      </div>
    );
  }

  // Not authenticated -> show login or register page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated routing by role
  return (
    <Routes>
      {isManager ? (
        <>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </>
      ) : (
        <>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="*" element={<Navigate to="/employee" replace />} />
        </>
      )}
    </Routes>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
