import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config, options = {}) => {
    const { showSuccess = true, showError = true } = options;
    setLoading(true);
    setError(null);

    try {
      const response = await api(config);
      if (showSuccess && options.successMessage) {
        toast.success(options.successMessage || 'Success');
      }
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      if (showError) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
};
