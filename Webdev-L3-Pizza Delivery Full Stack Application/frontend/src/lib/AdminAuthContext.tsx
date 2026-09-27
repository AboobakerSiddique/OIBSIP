import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient, ApiClientError } from "../lib/apiClient";
import type { AuthAdmin } from "../types/auth";

type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthContextValue {
  status: AdminAuthStatus;
  admin: AuthAdmin | null;
  login: (email: string, password: string) => Promise<{ admin: AuthAdmin }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [admin, setAdmin] = useState<AuthAdmin | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: AuthAdmin }>("/admin/me");
      setAdmin(res.data);
      setStatus("authenticated");
    } catch (err) {
      setAdmin(null);
      setStatus("unauthenticated");
      if (!(err instanceof ApiClientError && err.status === 401)) {
        // Same rationale as AuthContext — degrade to logged-out rather
        // than surface a boot-time crash.
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<{ data: { admin: AuthAdmin } }>("/admin/login", {
      email,
      password,
    });
    setAdmin(res.data.admin);
    setStatus("authenticated");
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await apiClient.post("/admin/logout");
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AdminAuthContext.Provider value={{ status, admin, login, logout, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return ctx;
}
