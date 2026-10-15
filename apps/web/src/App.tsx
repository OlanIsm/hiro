import { useState } from "react";
import { AuthProvider } from "./features/auth/AuthContext";
import { useAuth } from "./features/auth/useAuth";
import { LoginScreen } from "./features/auth/LoginScreen";
import { KanbanBoard } from "./features/internships/components/KanbanBoard";
import { Sidebar } from "./components/Sidebar";
import { LayoutDashboard, LogOut } from "lucide-react";

function Dashboard() {
  const { logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#e8ecf4",
        color: "#1e1b4b",
        fontFamily: "var(--sans)",
      }}
    >
      {/* Collapsible Neumorphic Purple Sidebar */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded((prev) => !prev)}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100vh",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 24px",
            backgroundColor: "#e8ecf4",
            boxShadow: "0 3px 14px rgba(207, 213, 226, 0.6)",
            zIndex: 20,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "21px",
                fontWeight: "900",
                color: "#5b21b6",
                letterSpacing: "-0.03em",
              }}
            >
              Hiro
            </span>
            <span
              style={{
                fontSize: "12px",
                padding: "2px 9px",
                backgroundColor: "#ede9fe",
                borderRadius: "12px",
                color: "#7c3aed",
                fontWeight: "700",
                boxShadow: "inset 1px 1px 3px #cfd5e2, inset -1px -1px 3px #ffffff",
              }}
            >
              Internship Tracker
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#7c3aed",
                fontSize: "13.5px",
                fontWeight: "700",
                backgroundColor: "#e8ecf4",
                padding: "6px 14px",
                borderRadius: "12px",
                boxShadow: "inset 2px 2px 4px #d0d6e2, inset -2px -2px 4px #ffffff",
              }}
            >
              <LayoutDashboard size={15} />
              <span>Kanban Board</span>
            </div>

            <button
              onClick={logout}
              className="neu-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "12px",
                border: "none",
                color: "#ef4444",
                fontWeight: "700",
                fontSize: "13.5px",
                cursor: "pointer",
              }}
              title="Log out of local session"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Area (Strictly no page scroll, height 100%) */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            padding: "10px 18px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <KanbanBoard />
        </main>
      </div>
    </div>
  );
}

function MainApp() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e8ecf4",
          color: "#7c3aed",
          fontWeight: "600",
          fontSize: "15px",
          fontFamily: "var(--sans)",
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
