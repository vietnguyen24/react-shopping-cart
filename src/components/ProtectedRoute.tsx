import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserContext } from 'contexts/user-context/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { tokenId, isTokenExpired, refreshToken } = useUserContext();
  
  // Check if user is not authenticated or token is expired
  if (!tokenId || isTokenExpired) {
    // Save current location for redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/callback') {
      localStorage.setItem('auth_redirect_url', currentPath);
    }
    
    // Initiate login flow
    refreshToken();
    
    // Return null while redirecting
    return null;
  }
  
  // User is authenticated with valid token, render children
  return <>{children}</>;
};