import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Generic ProtectedRoute with optional role checking
const ProtectedRoute = ({ children, allowRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    // Corrupted storage, treat as unauthenticated
  }

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Role based authorization
  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    if (!user.role || !allowRoles.includes(user.role)) {
      // Optionally route to a 403 page; fallback to login
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
