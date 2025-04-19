import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

interface UserContextType {
  tokenId: string | null;
  setTokenId: (tokenId: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [tokenId, setTokenIdState] = useState<string | null>(() => {
    // Load tokenId from localStorage on initialization
    return localStorage.getItem('id_token') || null;
  });

  const setTokenId = (newTokenId: string | null) => {
    setTokenIdState(newTokenId);
    // if (newTokenId) {
    //   localStorage.setItem('tokenId', newTokenId); // Save to localStorage
    // } else {
    //   localStorage.removeItem('tokenId'); // Remove from localStorage
    // }
  };

  return (
    <UserContext.Provider value={{ tokenId, setTokenId }}>
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