import { AuthProvider } from "./features/auth/AuthContext";
import { useAuth } from "./features/auth/useAuth";
import { LoginScreen } from "./features/auth/LoginScreen";
import { KanbanBoard } from "./features/internships/components/KanbanBoard";
import { LayoutDashboard, LogOut, Briefcase } from "lucide-react";

function Dashboard() {
  const { logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#090d16",
        color: "#f3f4f6",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Desktop-First Application Shell Top Navigation */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 28px",
          borderBottom: "1px solid #1f2937",
          backgroundColor: "#111827",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
            }}
          >
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", letterSpacing: "-0.02em" }}>
                Olan's Jira
              </span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "9999px",
                  color: "#38bdf8",
                  fontWeight: "600",
                }}
              >
                Local-First MVP
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Internship Application Tracker
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#94a3b8",
              fontSize: "13px",
              backgroundColor: "#1f2937",
              padding: "6px 12px",
              borderRadius: "6px",
            }}
          >
            <LayoutDashboard size={16} />
            <span>Kanban Board</span>
          </div>

          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              backgroundColor: "#27272a",
              border: "1px solid #3f3f46",
              borderRadius: "6px",
              color: "#f43f5e",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            title="Log out of local session"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: "24px 28px" }}>
        <KanbanBoard />
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
