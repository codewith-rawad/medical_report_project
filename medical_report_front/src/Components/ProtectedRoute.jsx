import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return <Navigate to="/" replace />;
  }

  const parsed = JSON.parse(storedUser);
  if (!parsed._id) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
