import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  async function login(usernameInput, password) {
    const { data } = await client.post('/auth/token/', { username: usernameInput, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('username', usernameInput);
    setUsername(usernameInput);
  }

  async function register(usernameInput, email, password) {
    await client.post('/auth/register/', { username: usernameInput, email, password });
    // auto-login right after registering
    await login(usernameInput, password);
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ username, isAuthenticated: !!username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
