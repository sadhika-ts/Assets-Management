import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { AssetForm } from './pages/AssetForm';
import { AssetDetail } from './pages/AssetDetail';
import { Purchases } from './pages/Purchases';
import { PurchaseForm } from './pages/PurchaseForm';
import { Contracts } from './pages/Contracts';
import { ContractForm } from './pages/ContractForm';
import { Reports } from './pages/Reports';
import { Warranty } from './pages/Warranty';
import { NotFound } from './pages/NotFound';
import { Login } from './pages/Login';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/assets" element={<PrivateRoute><Assets /></PrivateRoute>} />
        <Route path="/assets/new" element={<PrivateRoute><AssetForm /></PrivateRoute>} />
        <Route path="/assets/:id" element={<PrivateRoute><AssetDetail /></PrivateRoute>} />
        <Route path="/assets/:id/edit" element={<PrivateRoute><AssetForm /></PrivateRoute>} />
        <Route path="/purchases" element={<PrivateRoute><Purchases /></PrivateRoute>} />
        <Route path="/purchases/new" element={<PrivateRoute><PurchaseForm /></PrivateRoute>} />
        <Route path="/contracts" element={<PrivateRoute><Contracts /></PrivateRoute>} />
        <Route path="/contracts/new" element={<PrivateRoute><ContractForm /></PrivateRoute>} />
        <Route path="/contracts/:id/edit" element={<PrivateRoute><ContractForm /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/warranty" element={<PrivateRoute><Warranty /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
