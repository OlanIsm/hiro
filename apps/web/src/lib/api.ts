export const API_BASE = "/api";

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: {
    message: string;
    details?: unknown;
  };
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Always include session cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && endpoint !== "/auth/status") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hiro:unauthorized"));
      }
    }
    throw new Error(
      json.error?.message || json.message || `Request failed with status ${response.status}`
    );
  }

  return json;
}
