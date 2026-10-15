import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/apiService';
import { tokenService, userService } from '../services/tokenService';

const AuthContext = createContext();

const getStoredUser = () => {
  const token = tokenService.getToken();
  const user = userService.getUser();

  if (!token || tokenService.isTokenExpired(token) || !user) {
    tokenService.removeToken();
    userService.removeUser();
    return null;
  }

  return user;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredUser()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const { token, user: userData } = response;

      tokenService.saveToken(token);
      userService.saveUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      const { token, user: newUser } = response;

      tokenService.saveToken(token);
      userService.saveUser(newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    tokenService.removeToken();
    userService.removeUser();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
