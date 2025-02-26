export const auth = {
    isAuthenticated: (): boolean => {
      const token = localStorage.getItem('access_token');
      return !!token;
    },
    
    setToken: (token: string): void => {
      localStorage.setItem('access_token', token);
      window.dispatchEvent(new Event('auth-change'));
    },
    
    removeToken: (): void => {
      localStorage.removeItem('access_token');
      window.dispatchEvent(new Event('auth-change'));
    }
  };