import { useEffect, useState } from 'react';
import { useUserContext } from 'contexts/user-context/UserContext';
import { jwtDecode } from 'jwt-decode';
import styled from 'styled-components';

const ExpirationWarning = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff9800;
  color: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RefreshButton = styled.button`
  background-color: white;
  color: #ff9800;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const TokenExpirationHandler = () => {
  const { tokenId, refreshToken } = useUserContext();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    if (!tokenId) {
      setShowWarning(false);
      setTimeRemaining(null);
      return;
    }
    
    try {
      const decoded: any = jwtDecode(tokenId);
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      
      const updateTimeRemaining = () => {
        const now = Date.now();
        const remaining = Math.max(0, expirationTime - now);
        const remainingMinutes = Math.floor(remaining / 60000);
        
        setTimeRemaining(remainingMinutes);
        
        // Show warning when less than 5 minutes remaining
        setShowWarning(remainingMinutes < 5 && remainingMinutes > 0);
      };
      
      // Update immediately and then every 15 seconds
      updateTimeRemaining();
      const intervalId = setInterval(updateTimeRemaining, 15000);
      
      return () => clearInterval(intervalId);
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }, [tokenId, refreshToken]);
  
  if (!showWarning || timeRemaining === null) {
    return null;
  }
  
  return (
    <ExpirationWarning>
      <div>Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}.</div>
      <RefreshButton onClick={refreshToken}>
        Refresh Session
      </RefreshButton>
    </ExpirationWarning>
  );
};

export default TokenExpirationHandler;