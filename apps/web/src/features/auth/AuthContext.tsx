import { useState, useEffect, useCallback, type ReactNode } from "react";
import { apiFetch } from "../../lib/api";
import { AuthContext } from "./useAuth";

interface AuthStatus {
  initialized: boolean;
  authenticated: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<AuthStatus>("/auth/status");
      if (res.data) {
        setInitialized(res.data.initialized);
        setAuthenticated(res.data.authenticated);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load auth status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    apiFetch<AuthStatus>("/auth/status")
      .then((res) => {
        if (!ignore && res.data) {
          setInitialized(res.data.initialized);
          setAuthenticated(res.data.authenticated);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load auth status");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (password: string) => {
    setError(null);
    const res = await apiFetch<{ authenticated: boolean }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    if (res.data?.authenticated) {
      setAuthenticated(true);
    }
  };

  const setup = async (password: string) => {
    setError(null);
    const res = await apiFetch<{ authenticated: boolean }>("/auth/setup", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    if (res.data?.authenticated) {
      setInitialized(true);
      setAuthenticated(true);
    }
  };

  const logout = async () => {
    setError(null);
    await apiFetch("/auth/logout", {
      method: "POST",
    });
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        initialized,
        authenticated,
        loading,
        error,
        login,
        setup,
        logout,
        refreshStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
