import { useUserContext } from 'contexts/user-context/UserContext';

export const useAuthCheck = () => {
  const { tokenId, isTokenExpired, refreshToken } = useUserContext();
  
  const checkAuth = (callback: () => void) => {
    if (tokenId && !isTokenExpired) {
      callback();
    } else {
      // Save current path before redirecting
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== '/callback') {
        localStorage.setItem('auth_redirect_url', currentPath);
      }
      
      // Redirect to login
      refreshToken();
    }
  };
  
  return { checkAuth, isAuthenticated: !!tokenId && !isTokenExpired };
};