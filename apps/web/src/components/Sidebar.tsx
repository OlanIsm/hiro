import {
  LayoutDashboard,
  Briefcase,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Download,
} from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export function Sidebar({ isExpanded, onToggle, onLogout }: SidebarProps) {
  return (
    <aside
      style={{
        width: isExpanded ? "230px" : "72px",
        height: "100vh",
        backgroundColor: "#e8ecf4",
        borderRight: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "6px 0 18px #cfd5e2",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isExpanded ? "18px 16px" : "18px 12px",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s ease",
        zIndex: 30,
        flexShrink: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top Brand & Logo */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isExpanded ? "space-between" : "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
            onClick={!isExpanded ? onToggle : undefined}
            title={!isExpanded ? "Expand Hiro Sidebar" : undefined}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                background: "linear-gradient(145deg, #8b5cf6, #7c3aed)",
                boxShadow: "4px 4px 10px #cfd5e2, -4px -4px 10px #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} />
            </div>

            {isExpanded && (
              <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "900",
                      color: "#5b21b6",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Hiro
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      backgroundColor: "#ede9fe",
                      color: "#7c3aed",
                      padding: "2px 7px",
                      borderRadius: "10px",
                      boxShadow: "inset 1px 1px 2px #d0d6e2, inset -1px -1px 2px #ffffff",
                    }}
                  >
                    MVP
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
                  Tracker
                </div>
              </div>
            )}
          </div>

          {isExpanded && (
            <button
              onClick={onToggle}
              className="neu-button"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7c3aed",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
              title="Minimize Sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Active: Kanban Board */}
          <button
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isExpanded ? "flex-start" : "center",
              gap: "12px",
              padding: isExpanded ? "10px 14px" : "10px 0",
              background: "linear-gradient(145deg, #8b5cf6, #7c3aed)",
              boxShadow: "4px 4px 12px rgba(124, 58, 237, 0.35), -3px -3px 8px #ffffff",
              border: "none",
              borderRadius: "14px",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            title="Kanban Board"
          >
            <LayoutDashboard size={18} />
            {isExpanded && <span>Kanban Board</span>}
          </button>

          {/* Secondary nav: Applications */}
          <button
            className="neu-button"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isExpanded ? "flex-start" : "center",
              gap: "12px",
              padding: isExpanded ? "10px 14px" : "10px 0",
              border: "none",
              borderRadius: "14px",
              color: "#6d28d9",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title="All Applications"
          >
            <Briefcase size={18} />
            {isExpanded && <span>Applications</span>}
          </button>

          {/* History */}
          <button
            className="neu-button"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isExpanded ? "flex-start" : "center",
              gap: "12px",
              padding: isExpanded ? "10px 14px" : "10px 0",
              border: "none",
              borderRadius: "14px",
              color: "#6d28d9",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title="Status History"
          >
            <History size={18} />
            {isExpanded && <span>History</span>}
          </button>

          {/* Export CSV Data */}
          <button
            onClick={() => {
              const exportUrl =
                typeof window !== "undefined" && window.location.port === "4000"
                  ? "/api/internships/export?format=csv"
                  : "http://127.0.0.1:4000/api/internships/export?format=csv";
              window.open(exportUrl, "_blank");
            }}
            className="neu-button"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: isExpanded ? "flex-start" : "center",
              gap: "12px",
              padding: isExpanded ? "10px 14px" : "10px 0",
              border: "none",
              borderRadius: "14px",
              color: "#6d28d9",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title="Export CSV Data"
          >
            <Download size={18} />
            {isExpanded && <span>Export CSV</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Actions: Expand Toggle (if minimized) & Logout */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {!isExpanded && (
          <button
            onClick={onToggle}
            className="neu-button"
            style={{
              width: "100%",
              height: "38px",
              borderRadius: "12px",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c3aed",
              cursor: "pointer",
            }}
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <button
          onClick={onLogout}
          className="neu-button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: isExpanded ? "flex-start" : "center",
            gap: "10px",
            padding: isExpanded ? "10px 14px" : "10px 0",
            border: "none",
            borderRadius: "14px",
            color: "#dc2626",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
          }}
          title="Log out of session"
        >
          <LogOut size={18} />
          {isExpanded && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
