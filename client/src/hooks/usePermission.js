import { useAuth } from '../context/AuthContext';

export const usePermission = () => {
  const { user } = useAuth();

  const canCreate = () => user?.role === 'admin' || user?.role === 'staff';
  const canEdit = () => user?.role === 'admin' || user?.role === 'staff';
  const canDelete = () => user?.role === 'admin';
  const canManagePurchases = () => user?.role === 'admin';
  const isAdmin = () => user?.role === 'admin';
  const isStaff = () => user?.role === 'staff';
  const isViewer = () => user?.role === 'viewer';

  return {
    canCreate,
    canEdit,
    canDelete,
    canManagePurchases,
    isAdmin,
    isStaff,
    isViewer,
    userRole: user?.role
  };
};
