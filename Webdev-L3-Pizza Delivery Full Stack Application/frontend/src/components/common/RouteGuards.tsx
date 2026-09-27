import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { useAdminAuth } from "../../lib/AdminAuthContext";
import { LoadingState } from "./States";

export function RequireUser({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <div className="container section"><LoadingState label="Checking your session..." /></div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();

  if (status === "loading") {
    return <div className="container section"><LoadingState label="Checking admin session..." /></div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
