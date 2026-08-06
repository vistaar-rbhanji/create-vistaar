/**
 * Auth provider stub for {{PROJECT_NAME}}.
 * No authentication logic yet — replace with your session strategy.
 */
import { createContext, useContext, type ReactNode } from "react";

export type AuthUser = { id: string; email: string };

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null, isAuthenticated: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
