import { apiClient } from "../apiClient";

export interface AppSettings {
  notifyEmail: string;
  defaultThreshold: number;
}

interface ApiSettings extends AppSettings {
  _id: string;
  updatedAt: string;
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await apiClient.get<{ data: ApiSettings }>("/admin/settings");
  return { notifyEmail: res.data.notifyEmail, defaultThreshold: res.data.defaultThreshold };
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const res = await apiClient.patch<{ data: ApiSettings }>("/admin/settings", patch);
  return { notifyEmail: res.data.notifyEmail, defaultThreshold: res.data.defaultThreshold };
}
