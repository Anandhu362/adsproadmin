import { authStorage } from "./auth";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  
  // FIX: Read from the .env.local file
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  // Ensure path starts with / if baseUrl doesn't end with one (safety check)
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      authStorage.clear();
      window.location.href = "/"; // Redirect to login
      return;
    }

    // Handle 204 No Content
    if (res.status === 204) return null;

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  } catch (error: any) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

// FIX: Add the default export so MarkAttendance.tsx stops crashing
const api = {
  get: (path: string) => apiFetch(path, { method: "GET" }),
  post: (path: string, body: any) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: any) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: "DELETE" }),
};

export default api;
