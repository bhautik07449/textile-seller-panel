import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerListingsPage from './pages/SellerListingsPage';
import CreateListingPage from './pages/CreateListingPage';
import SellerProfilePage from './pages/SellerProfilePage';
import SellerSubscriptionPage from './pages/SellerSubscriptionPage';
import SellerAnalyticsPage from './pages/SellerAnalyticsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs font-semibold">
        Verifying seller session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

import { Toaster } from './components/ui/toast';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster />
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Seller Console */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboardPage />} />
            <Route path="analytics" element={<SellerAnalyticsPage />} />
            <Route path="listings" element={<SellerListingsPage />} />
            <Route path="listings/new" element={<CreateListingPage />} />
            <Route path="listings/:id/edit" element={<CreateListingPage />} />
            <Route path="profile" element={<SellerProfilePage />} />
            <Route path="subscription" element={<SellerSubscriptionPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
