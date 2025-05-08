import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, role: string, gender: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<string>;
  isAuthenticated: boolean;
  isTeamLead: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setError(null);
    setIsAuthenticating(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      await fetchUserDetails(data.access_token);
      navigate('/teams');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, role: string, gender: string) => {
    setError(null);
    setIsAuthenticating(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, confirmPassword: password, role, gender }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Registration failed');
      }
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      await fetchUserDetails(data.access_token);
      navigate('/teams');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
    }
  };

  const refreshAuthToken = async (): Promise<string> => {
    if (!refreshToken) {
      setError('No refresh token available');
      await logout();
      throw new Error('No refresh token');
    }
    try {
      const response = await fetch('http://localhost:8080/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${refreshToken}` },
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Token refresh failed');
      }
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      setError(null);
      return data.access_token;
    } catch (err: any) {
      setError(err.message);
      await logout();
      throw err;
    }
  };

  const fetchUserDetails = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await res.json();
      setUser({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        gender: data.gender,
      });
      console.log("Role of the user: " + data.role);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken && !user && !isAuthenticating) {
        try {
          await fetchUserDetails(accessToken);
        } catch (err) {
          try {
            const newToken = await refreshAuthToken();
            await fetchUserDetails(newToken);
          } catch (refreshErr) {
            setError('Session expired. Please log in again.');
            await logout();
          }
        }
      }
    };
    initializeAuth();
  }, [accessToken, isAuthenticating]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        setAccessToken,
        setRefreshToken,
        login,
        register,
        logout,
        refreshAuthToken,
        isAuthenticated: !!accessToken && !!user,
        isTeamLead: user?.role === 'TEAM_LEAD',
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};