import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  database: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function useApiHealth() {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setStatus("loading");
      try {
        const res = await apiClient.get<HealthResponse>("/health");
        if (!cancelled) {
          setData(res);
          setStatus("success");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setStatus("error");
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, data, error };
}

export default useApiHealth;
