import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from 'contexts/user-context/UserContext';

/**
 * A hook that checks if the user is authenticated before accessing a route.
 * If not authenticated, redirects to login.
 */
export function useRequireAuth(redirectUrl: string = '/') {
  const navigate = useNavigate();
  const { tokenId, isTokenExpired, refreshToken } = useUserContext();
  
  useEffect(() => {
    // If no token or token is expired, redirect to login
    if (!tokenId || isTokenExpired) {
      // Save current location for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/callback') {
        localStorage.setItem('auth_redirect_url', currentPath);
      }
      
      // Redirect to login
      refreshToken();
    }
  }, [tokenId, isTokenExpired, refreshToken]);
  
  return !!tokenId && !isTokenExpired;
}