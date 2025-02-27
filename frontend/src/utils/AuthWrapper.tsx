import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initial check
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      if (!token && location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login');
      }
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        setIsAuthenticated(!!e.newValue);
        if (!e.newValue && location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/login');
        }
      }
    };

    // Listen for auth changes in current tab
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [navigate, location]);

  return <>{children}</>;
};

export default AuthWrapper;