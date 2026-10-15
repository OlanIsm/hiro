import { AuthProvider } from "./features/auth/AuthContext";
import { useAuth } from "./features/auth/useAuth";
import { LoginScreen } from "./features/auth/LoginScreen";

function Dashboard() {
  const { logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#090d16",
        color: "#f3f4f6",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #283141",
          backgroundColor: "#161b26",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#38bdf8" }}>
            Olan's Jira
          </span>
          <span
            style={{
              fontSize: "12px",
              padding: "2px 8px",
              backgroundColor: "#1e293b",
              borderRadius: "4px",
              color: "#94a3b8",
            }}
          >
            Phase 2 Authenticated
          </span>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "8px 14px",
            backgroundColor: "#ef4444",
            border: "none",
            borderRadius: "6px",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Log Out
        </button>
      </header>

      <main style={{ padding: "32px 24px" }}>
        <div
          style={{
            backgroundColor: "#161b26",
            border: "1px solid #283141",
            borderRadius: "8px",
            padding: "24px",
            maxWidth: "600px",
          }}
        >
          <h2 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
            Session Active & Protected
          </h2>
          <p style={{ margin: 0, color: "#9ca3af", fontSize: "14px", lineHeight: "1.5" }}>
            You are securely logged into Olan's Jira. The server-side session cookie is active.
            Ready for Phase 3 (Kanban Board).
          </p>
        </div>
      </main>
    </div>
  );
}

function MainApp() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090d16",
          color: "#9ca3af",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Checking workspace authorization...
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
