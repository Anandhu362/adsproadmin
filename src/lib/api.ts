import { authStorage } from "./auth";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (res.status === 401) {
    authStorage.clear();
    window.location.href = "/login";
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}