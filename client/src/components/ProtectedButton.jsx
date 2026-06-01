import React from 'react';
import { usePermission } from '../hooks/usePermission';

export const ProtectedButton = ({
  requiredRole = 'admin',
  onClick,
  children,
  className = '',
  title = '',
  ...props
}) => {
  const { userRole } = usePermission();

  const roleHierarchy = {
    admin: ['admin'],
    staff: ['admin', 'staff'],
    viewer: []
  };

  const hasPermission = roleHierarchy[requiredRole]?.includes(userRole);

  if (!hasPermission) {
    return (
      <button
        disabled
        className={`opacity-50 cursor-not-allowed ${className}`}
        title={title || `Only ${requiredRole}s can perform this action`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title} {...props}>
      {children}
    </button>
  );
};
