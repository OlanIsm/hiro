const API_BASE =
  typeof window !== "undefined" && window.location.port === "4000"
    ? "/api"
    : "http://127.0.0.1:4000/api";

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
    credentials: "include", // Send and receive session cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.error?.message || `Request failed with status ${response.status}`);
  }

  return json;
}
