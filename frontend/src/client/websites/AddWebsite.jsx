import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AddWebsite() {
  return <Navigate to="/websites?add=true" replace />;
}
