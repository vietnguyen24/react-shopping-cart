import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserContextType {
  tokenId: string | null;
  setTokenId: (newTokenId: string | null) => void;
  isTokenExpired: boolean;
  refreshToken: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Function to check if token is expired
const checkTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    // Check if the expiration time (exp) is in the past
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    // If we can't decode the token, assume it's expired
    console.error('Error decoding token:', error);
    return true;
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [tokenId, setTokenIdState] = useState<string | null>(() => {
    // Load tokenId from localStorage on initialization
    const storedToken = localStorage.getItem('id_token');
    
    // If token exists but is expired, remove it
    if (storedToken && checkTokenExpired(storedToken)) {
      localStorage.removeItem('id_token');
      return null;
    }
    
    return storedToken;
  });
  
  const [isTokenExpired, setIsTokenExpired] = useState<boolean>(false);
  
  // Check token expiration periodically
  useEffect(() => {
    if (!tokenId) {
      setIsTokenExpired(false);
      return;
    }
    
    // Check immediately
    setIsTokenExpired(checkTokenExpired(tokenId));
    
    // Set up a timer to check token expiration every minute
    const intervalId = setInterval(() => {
      if (tokenId && checkTokenExpired(tokenId)) {
        setIsTokenExpired(true);
        // Optionally auto-logout
        setTokenId(null);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [tokenId]);

  const setTokenId = (newTokenId: string | null) => {
    setTokenIdState(newTokenId);
    if (newTokenId) {
      localStorage.setItem('id_token', newTokenId); // Save to localStorage
      setIsTokenExpired(false);
    } else {
      localStorage.removeItem('id_token'); // Remove from localStorage
      setIsTokenExpired(false);
    }
  };
  
  // Function to refresh the token (redirect to login)
  const refreshToken = () => {
    // Clear current token
    setTokenId(null);
    
    // Redirect to Cognito login
    const domain = process.env.REACT_APP_COGNITO_DOMAIN;
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.REACT_APP_COGNITO_LOGIN_REDIRECT_URI || 
      window.location.origin + '/callback'
    );
    const responseType = 'token';
    const scope = 'email+openid+phone';
  
    window.location.href = `https://${domain}/oauth2/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <UserContext.Provider value={{ tokenId, setTokenId, isTokenExpired, refreshToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export default UserContext;