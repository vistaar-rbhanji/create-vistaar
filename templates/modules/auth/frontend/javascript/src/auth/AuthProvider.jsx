/**
 * Auth provider stub for {{PROJECT_NAME}}.
 * No authentication logic yet — replace with your session strategy.
 */
import { createContext, useContext } from "react";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{ user: null, isAuthenticated: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
