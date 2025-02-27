import { jwtDecode } from 'jwt-decode';
import { TokenData } from './UserContext';


class Auth {
  setToken(token: string) {
    localStorage.setItem('token', token);
    window.dispatchEvent(new Event('auth-change'));
  }

  removeToken() {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<TokenData>(token);
      // Convert to seconds to match JWT exp format
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }
}


export const auth = new Auth();