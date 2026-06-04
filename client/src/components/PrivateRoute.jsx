import React from 'react';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Show content if authenticated, otherwise show message
  if (!isAuthenticated) {
    return <div className="p-8 text-center">Please authenticate to continue.</div>;
  }

  return children;
};
