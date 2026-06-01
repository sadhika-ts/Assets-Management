import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { AssetForm } from './pages/AssetForm';
import { AssetDetail } from './pages/AssetDetail';
import { Purchases } from './pages/Purchases';
import { Contracts } from './pages/Contracts';
import { Reports } from './pages/Reports';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Assets Routes */}
          <Route
            path="/assets"
            element={
              <PrivateRoute>
                <Assets />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets/new"
            element={
              <PrivateRoute>
                <AssetForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets/:id"
            element={
              <PrivateRoute>
                <AssetDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets/:id/edit"
            element={
              <PrivateRoute>
                <AssetForm />
              </PrivateRoute>
            }
          />

          {/* Purchases Routes */}
          <Route
            path="/purchases"
            element={
              <PrivateRoute>
                <Purchases />
              </PrivateRoute>
            }
          />

          {/* Contracts Routes */}
          <Route
            path="/contracts"
            element={
              <PrivateRoute>
                <Contracts />
              </PrivateRoute>
            }
          />

          {/* Reports Routes */}
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
