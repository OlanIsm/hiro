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
        backgroundColor: "#e8ecf4",
        color: "#1e1b4b",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Desktop-First Application Shell Top Navigation (Neumorphic) */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 36px",
          backgroundColor: "#e8ecf4",
          boxShadow: "0 6px 20px rgba(207, 213, 226, 0.7)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "16px",
              background: "linear-gradient(145deg, #8b5cf6, #7c3aed)",
              boxShadow: "5px 5px 12px #cfd5e2, -4px -4px 10px #ffffff",
              color: "#ffffff",
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "#5b21b6",
                  letterSpacing: "-0.02em",
                }}
              >
                Olan's Jira
              </span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  backgroundColor: "#ede9fe",
                  borderRadius: "20px",
                  color: "#7c3aed",
                  fontWeight: "700",
                  boxShadow: "inset 2px 2px 4px #cfd5e2, inset -2px -2px 4px #ffffff",
                }}
              >
                Local-First MVP
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
              Internship Application Tracker
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#7c3aed",
              fontSize: "13px",
              fontWeight: "600",
              backgroundColor: "#e8ecf4",
              padding: "8px 16px",
              borderRadius: "16px",
              boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
            }}
          >
            <LayoutDashboard size={16} />
            <span>Kanban Board</span>
          </div>

          <button
            onClick={logout}
            className="neu-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "16px",
              border: "none",
              color: "#ef4444",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title="Log out of local session"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: "28px 36px" }}>
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
          backgroundColor: "#e8ecf4",
          color: "#7c3aed",
          fontWeight: "600",
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
