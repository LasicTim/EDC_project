import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';

export interface TokenData {
  sub: {
    username: string;
    Id: string;
    // Add other user properties from your token_data
  };
  exp: number;
}

export interface User {
  username: string;
  Id: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation(); // Get current URL path
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<TokenData>(token);
        console.log("checking for valida token")
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('Token expired');
          localStorage.removeItem('token');
          setUser(null);
          return;
        }

        // Extract user data from nested sub object
        const userData: User = {
          username: decoded.sub.username,
          Id: decoded.sub.Id
        };
        
        // Check if user data has actually changed
        if (
          !user || // no current user
          user.username !== userData.username ||
          user.Id !== userData.Id
        ) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [location.pathname]);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user && localStorage.getItem('token') !== null
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
