import { useState, useEffect } from "react";
import {
  Mail,
  RefreshCw,
  CheckCircle,
  X,
  AlertCircle,
  Sparkles,
  Link,
  Unlink,
  ChevronRight,
} from "lucide-react";

interface GmailStatus {
  connected: boolean;
  emailAddress: string | null;
  lastSyncedAt: string | null;
  syncEnabled: boolean;
}

interface Recommendation {
  id: string;
  gmailMessageId: string;
  internshipId: string;
  companyName: string;
  role: string;
  currentStatus: string;
  recommendedStatus: string;
  detectedCategory: string;
  confidence: number;
  processedAt: string;
}

interface GmailSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshBoard: () => void;
}

const API_BASE = "/api";

export function GmailSyncModal({ isOpen, onClose, onRefreshBoard }: GmailSyncModalProps) {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStatusAndRecs = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statusRes, recsRes] = await Promise.all([
        fetch(`${API_BASE}/gmail/status`, { credentials: "include" }),
        fetch(`${API_BASE}/gmail/recommendations`, { credentials: "include" }),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setStatus(sData);
      }
      if (recsRes.ok) {
        const rData = await recsRes.json();
        setRecommendations(rData);
      }
    } catch {
      setError("Failed to fetch Gmail status and recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndRecs();
    }
  }, [isOpen]);

  const handleConnect = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/gmail/connect`, { credentials: "include" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to start Google OAuth flow");
      }
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Google");
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/gmail/disconnect`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setSuccessMsg("Gmail account disconnected safely.");
        await fetchStatusAndRecs();
      } else {
        throw new Error("Failed to disconnect Gmail");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect Gmail");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (useSimulation = false) => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMsg(null);

      const payload = useSimulation
        ? {
            mockMessages: [
              {
                id: `sim-${Date.now()}`,
                sender: "Stripe Recruiting <recruiting@stripe.com>",
                subject: "Stripe Internship: Complete your HackerRank Assessment",
                snippet: "Hi there! Please complete your coding challenge within 5 days.",
              },
            ],
          }
        : {};

      const res = await fetch(`${API_BASE}/gmail/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Email sync failed");
      }

      const result = await res.json();
      setSuccessMsg(
        `Sync completed: ${result.syncedCount} new email(s) checked, ${result.newRecommendations} status update recommendation(s) found.`
      );
      await fetchStatusAndRecs();
      onRefreshBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleApplyRecommendation = async (recId: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/gmail/recommendations/${recId}/apply`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to apply status update");
      }

      setSuccessMsg("Status updated successfully from email verification!");
      await fetchStatusAndRecs();
      onRefreshBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply recommendation");
    }
  };

  const handleDismissRecommendation = async (recId: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/gmail/recommendations/${recId}/dismiss`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to dismiss recommendation");
      }

      await fetchStatusAndRecs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dismiss recommendation");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #f0f4fc, #dfe4ee)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          borderRadius: "26px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "20px 20px 60px #cfd5e2, -20px -20px 60px #ffffff",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 26px",
            borderBottom: "1px solid rgba(207, 213, 226, 0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: "linear-gradient(145deg, #8b5cf6, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "3px 3px 8px rgba(124, 58, 237, 0.3)",
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e1b4b" }}>
                Gmail Integration & Sync
              </h2>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Phase 7: Review recruitment emails & verified status changes
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="neu-button"
            style={{
              border: "none",
              borderRadius: "50%",
              color: "#64748b",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px 26px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Notifications */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "14px",
                color: "#b91c1c",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "14px",
                color: "#047857",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Connection Card */}
          <div
            style={{
              backgroundColor: "#e4e8f1",
              boxShadow: "inset 3px 3px 7px #d0d6e2, inset -3px -3px 7px #ffffff",
              padding: "18px 20px",
              borderRadius: "18px",
              border: "1px solid rgba(255, 255, 255, 0.7)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: status?.connected ? "#10b981" : "#94a3b8",
                      boxShadow: status?.connected ? "0 0 8px #10b981" : "none",
                    }}
                  />
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e1b4b" }}>
                    {status?.connected ? `Connected: ${status.emailAddress}` : "Gmail Disconnected"}
                  </span>
                </div>
                <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px" }}>
                  {status?.connected
                    ? `Last synced: ${
                        status.lastSyncedAt
                          ? new Date(status.lastSyncedAt).toLocaleString()
                          : "Never"
                      }`
                    : "Connect your Google account to automatically identify test links, interview invites, and offers."}
                </div>
              </div>

              <div>
                {status?.connected ? (
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="neu-button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: "12px",
                      color: "#dc2626",
                      fontSize: "13.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    <Unlink size={15} /> Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="neu-button-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "13.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    <Link size={15} /> Connect Gmail
                  </button>
                )}
              </div>
            </div>

            {/* Sync Controls */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "14px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(207, 213, 226, 0.6)",
              }}
            >
              <button
                onClick={() => handleManualSync(false)}
                disabled={syncing || !status?.connected}
                className="neu-button-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  cursor: syncing || !status?.connected ? "not-allowed" : "pointer",
                  opacity: syncing || !status?.connected ? 0.6 : 1,
                }}
              >
                <RefreshCw size={15} className={syncing ? "spin" : ""} />
                <span>{syncing ? "Syncing..." : "Sync Emails Now"}</span>
              </button>

              <button
                onClick={() => handleManualSync(true)}
                disabled={syncing}
                className="neu-button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  color: "#7c3aed",
                  cursor: syncing ? "not-allowed" : "pointer",
                }}
                title="Simulate recruitment email matching without requiring live Google API credentials"
              >
                <Sparkles size={15} />
                <span>Simulate Test Email Match</span>
              </button>
            </div>
          </div>

          {/* Pending Recommendations Section */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1e1b4b" }}>
                  Pending Status Recommendations
                </h3>
                <span
                  style={{
                    backgroundColor: "#ede9fe",
                    color: "#7c3aed",
                    fontSize: "12px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    boxShadow: "inset 1px 1px 2px #d0d6e2, inset -1px -1px 2px #ffffff",
                  }}
                >
                  {recommendations.length}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Human verification required before moving status
              </span>
            </div>

            {recommendations.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.35)",
                  border: "1px dashed rgba(160, 174, 192, 0.6)",
                  borderRadius: "16px",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                No unapplied status recommendations. Sync your inbox to check for new recruitment updates!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="neu-flat"
                    style={{
                      padding: "16px 18px",
                      borderRadius: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "16px", fontWeight: "800", color: "#1e1b4b" }}>
                            {rec.companyName}
                          </span>
                          <span style={{ fontSize: "13.5px", color: "#64748b", fontWeight: "600" }}>
                            — {rec.role}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "2px 8px",
                              borderRadius: "8px",
                              backgroundColor: "#e0e7ff",
                              color: "#4338ca",
                            }}
                          >
                            {rec.detectedCategory}
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                            Confidence: {Math.round(rec.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Transition visual */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "#f5f3ff",
                          border: "1px solid rgba(124, 58, 237, 0.2)",
                          padding: "4px 10px",
                          borderRadius: "10px",
                        }}
                      >
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>
                          {rec.currentStatus}
                        </span>
                        <ChevronRight size={13} color="#7c3aed" />
                        <span style={{ fontSize: "12px", fontWeight: "800", color: "#7c3aed" }}>
                          {rec.recommendedStatus}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
                      <button
                        onClick={() => handleDismissRecommendation(rec.id)}
                        className="neu-button"
                        style={{
                          padding: "6px 14px",
                          border: "none",
                          borderRadius: "10px",
                          color: "#64748b",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleApplyRecommendation(rec.id)}
                        className="neu-button-primary"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 16px",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle size={14} /> Apply Status Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
