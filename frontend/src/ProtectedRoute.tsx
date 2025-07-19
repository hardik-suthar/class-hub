import React, { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 