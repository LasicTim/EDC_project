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
      localStorage.removeItem('username');
      localStorage.removeItem('userid');
      window.dispatchEvent(new Event('auth-change'));
    },

    setUser: (username: string, userid: string): void => {
        localStorage.setItem('username', username);
        localStorage.setItem('userid', userid);
        window.dispatchEvent(new Event('auth-change'));
    },
  };