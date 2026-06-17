import React, { createContext, useContext, useCallback, useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );
  const [currentUser, setCurrentUser] = useState(
    () => {
      try { return JSON.parse(localStorage.getItem('currentUser')) || null; }
      catch { return null; }
    }
  );

  // returns { success, message }
  const login = useCallback(async (username, password) => {
    try {
      const res = await API.post('/auth/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(res.data.data.user));
        setIsAuthenticated(true);
        setCurrentUser(res.data.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid username or password.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  // returns { success, message }
  const updateCredentials = useCallback(async (username, currentPassword, newPassword) => {
    try {
      const res = await API.put('/auth/update-credentials', { username, currentPassword, newPassword });
      if (res.data.success) {
        const updated = { ...currentUser, username };
        localStorage.setItem('currentUser', JSON.stringify(updated));
        setCurrentUser(updated);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update credentials.' };
    }
  }, [currentUser]);

  const listUsers = useCallback(async () => {
    try {
      const res = await API.get('/auth/users');
      return { success: true, users: res.data.data.users };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to fetch users.' };
    }
  }, []);

  const addUser = useCallback(async ({ username, password, role }) => {
    try {
      const res = await API.post('/auth/users', { username, password, role });
      return { success: true, user: res.data.data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create user.' };
    }
  }, []);

  const removeUser = useCallback(async (id) => {
    try {
      await API.delete(`/auth/users/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete user.' };
    }
  }, []);

  const canCreate = useCallback(() => true, []);
  const canEdit   = useCallback(() => true, []);
  const canDelete = useCallback(() => true, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, currentUser,
      login, logout, updateCredentials,
      listUsers, addUser, removeUser,
      canCreate, canEdit, canDelete,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
