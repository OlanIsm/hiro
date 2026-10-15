import React, { useState } from "react";
import { useAuth } from "./useAuth";

export function LoginScreen() {
  const { initialized, login, setup } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password) {
      setErrorMsg("Password is required");
      return;
    }

    if (!initialized) {
      if (password.length < 6) {
        setErrorMsg("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match");
        return;
      }
    }

    try {
      setSubmitting(true);
      if (!initialized) {
        await setup(password);
      } else {
        await login(password);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#090d16",
        color: "#f3f4f6",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          borderRadius: "12px",
          backgroundColor: "#161b26",
          border: "1px solid #283141",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              color: "#38bdf8",
            }}
          >
            Olan's Jira
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#9ca3af" }}>
            {initialized
              ? "Welcome back. Enter your password to unlock."
              : "First run setup: Create your master password."}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              borderRadius: "6px",
              color: "#fca5a5",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#d1d5db",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #374151",
                backgroundColor: "#0d1117",
                color: "#f3f4f6",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
              }}
              required
            />
          </div>

          {!initialized && (
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "#d1d5db",
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #374151",
                  backgroundColor: "#0d1117",
                  color: "#f3f4f6",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "background-color 0.2s",
            }}
          >
            {submitting
              ? "Please wait..."
              : initialized
              ? "Unlock Workspace"
              : "Set Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
