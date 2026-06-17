import { createContext, useContext, useState, useEffect } from 'react';
import { saveSession, loadSession, clearSession } from './sessionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  function login(googleUser) {
    setSession(prev => ({
      ...googleUser,
      role: prev?.sub === googleUser.sub ? prev.role : null // null role = trigger RoleSelector
    }));
  }

  function setRole(role) {
    setSession(prev => ({ ...prev, role }));
  }

  function logout() {
    clearSession();
    setSession(null);
    window.google?.accounts.id.disableAutoSelect();
  }

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, login, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
