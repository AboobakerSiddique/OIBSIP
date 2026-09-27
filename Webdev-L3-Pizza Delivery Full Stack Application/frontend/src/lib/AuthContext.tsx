import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient, ApiClientError } from "../lib/apiClient";
import type { AuthUser } from "../types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface LoginResult {
  user: AuthUser;
}

interface RegisterResult {
  user: { id: string; name: string; email: string };
  verificationToken?: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: AuthUser }>("/auth/me");
      setUser(res.data);
      setStatus("authenticated");
    } catch (err) {
      setUser(null);
      setStatus("unauthenticated");
      if (!(err instanceof ApiClientError && err.status === 401)) {
        // Non-auth errors (e.g. network/server down) are swallowed here
        // deliberately — the app should still render in a logged-out
        // state rather than crash on boot.
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ data: { user: AuthUser } }>("/auth/login", {
      email,
      password,
    });
    setUser(res.data.user);
    setStatus("authenticated");
    return res.data;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiClient.post<{ data: RegisterResult }>("/auth/register", {
      name,
      email,
      password,
    });
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await apiClient.post("/auth/logout");
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
