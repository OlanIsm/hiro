import React, { useState } from "react";
import { useAuth } from "./useAuth";
import { Lock, Sparkles } from "lucide-react";

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
        backgroundColor: "#e8ecf4",
        color: "#1e1b4b",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "36px",
          borderRadius: "32px",
          background: "linear-gradient(145deg, #f0f4fc, #dfe4ee)",
          boxShadow: "16px 16px 36px #cfd5e2, -16px -16px 36px #ffffff",
          border: "1px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 16px auto",
              borderRadius: "20px",
              background: "linear-gradient(145deg, #8b5cf6, #7c3aed)",
              boxShadow: "6px 6px 16px rgba(124, 58, 237, 0.3), -4px -4px 12px #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            {initialized ? <Lock size={24} /> : <Sparkles size={24} />}
          </div>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: "900",
              margin: "0 0 6px 0",
              color: "#5b21b6",
              letterSpacing: "-0.03em",
            }}
          >
            Hiro
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            {initialized
              ? "Welcome back. Enter password to unlock."
              : "First-run setup: Create your master password."}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderRadius: "16px",
              boxShadow: "inset 2px 2px 5px rgba(239, 68, 68, 0.2)",
              color: "#dc2626",
              fontSize: "13px",
              marginBottom: "20px",
              fontWeight: "500",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#475569",
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
                padding: "12px 16px",
                borderRadius: "16px",
                border: "none",
                outline: "none",
                backgroundColor: "#e4e8f1",
                boxShadow: "inset 4px 4px 8px #d0d6e2, inset -4px -4px 8px #ffffff",
                color: "#1e1b4b",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          {!initialized && (
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#475569",
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
                  padding: "12px 16px",
                  borderRadius: "16px",
                  border: "none",
                  outline: "none",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 4px 4px 8px #d0d6e2, inset -4px -4px 8px #ffffff",
                  color: "#1e1b4b",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="neu-button-primary"
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: "18px",
              border: "none",
              fontSize: "14px",
              fontWeight: "700",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              marginTop: "8px",
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
