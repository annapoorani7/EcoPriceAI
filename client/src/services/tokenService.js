// Auth Service for token management
const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export const tokenService = {
  saveToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

export const userService = {
  saveUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  removeUser: () => localStorage.removeItem(USER_KEY),
};
