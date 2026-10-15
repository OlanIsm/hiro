import { useEffect, useState } from "react";
import { type Internship, type StatusHistoryItem, KANBAN_COLUMNS } from "../types";
import {
  X,
  Building,
  ExternalLink,
  Mail,
  Edit2,
  Trash2,
  History,
} from "lucide-react";

interface InternshipDetailModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (internship: Internship) => void;
  onDelete: (id: string) => void;
  fetchHistory: (id: string) => Promise<StatusHistoryItem[]>;
}

export function InternshipDetailModal({
  internship,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  fetchHistory,
}: InternshipDetailModalProps) {
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let ignore = false;
    if (internship && isOpen) {
      fetchHistory(internship.id)
        .then((res) => {
          if (!ignore) {
            setHistory(res);
            setLoadingHistory(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            setHistory([]);
            setLoadingHistory(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [internship, isOpen, fetchHistory]);

  if (!isOpen || !internship) return null;

  const currentColumn = KANBAN_COLUMNS.find((c) => c.id === internship.status);

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
        zIndex: 50,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #f0f4fc, #dfe4ee)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "650px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "20px 20px 60px #cfd5e2, -20px -20px 60px #ffffff",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "22px 28px",
            borderBottom: "1px solid rgba(207, 213, 226, 0.5)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontWeight: "700",
                  backgroundColor: "#ede9fe",
                  border: "1px solid rgba(124, 58, 237, 0.25)",
                  color: "#7c3aed",
                  boxShadow: "2px 2px 5px #d0d6e2, -2px -2px 5px #ffffff",
                }}
              >
                {currentColumn?.title || internship.status}
              </span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Applied on {new Date(internship.appliedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1e1b4b" }}>
              {internship.role}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", marginTop: "4px", fontSize: "14px", fontWeight: "500" }}>
              <Building size={16} color="#7c3aed" />
              <span>{internship.companyName}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => onEdit(internship)}
              className="neu-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                border: "none",
                borderRadius: "12px",
                color: "#7c3aed",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              title="Edit application"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={() => onDelete(internship.id)}
              className="neu-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                border: "none",
                borderRadius: "12px",
                color: "#dc2626",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              title="Delete application"
            >
              <Trash2 size={14} /> Delete
            </button>
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
        </div>

        {/* Modal Content */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Quick Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              backgroundColor: "#e4e8f1",
              boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
              padding: "16px 20px",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.7)",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block" }}>Job Posting</span>
              {internship.jobUrl ? (
                <a
                  href={internship.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#7c3aed",
                    fontSize: "13px",
                    fontWeight: "600",
                    textDecoration: "none",
                    marginTop: "3px",
                  }}
                >
                  View Job Link <ExternalLink size={12} />
                </a>
              ) : (
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>None</span>
              )}
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block" }}>Recruiter Email</span>
              {internship.recruiterEmail ? (
                <a
                  href={`mailto:${internship.recruiterEmail}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#7c3aed",
                    fontSize: "13px",
                    fontWeight: "600",
                    textDecoration: "none",
                    marginTop: "3px",
                  }}
                >
                  <Mail size={12} /> {internship.recruiterEmail}
                </a>
              ) : (
                <span style={{ fontSize: "13px", color: "#94a3b8" }}>None</span>
              )}
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block" }}>Next Action</span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: internship.nextAction ? "#1e1b4b" : "#94a3b8" }}>
                {internship.nextAction || "None specified"}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block" }}>Deadline</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: internship.deadline ? "#b45309" : "#94a3b8" }}>
                {internship.deadline
                  ? new Date(internship.deadline).toLocaleDateString()
                  : "None specified"}
              </span>
            </div>
          </div>

          {/* Skills / Tags */}
          {internship.skills && internship.skills.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Skills & Tech Stack</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {internship.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: "#ede9fe",
                      color: "#6d28d9",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      boxShadow: "2px 2px 5px #d0d6e2, -2px -2px 5px #ffffff",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          {internship.jobDescription && (
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Job Description</h4>
              <div
                style={{
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: "1.6",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {internship.jobDescription}
              </div>
            </div>
          )}

          {/* Notes */}
          {internship.notes && (
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "600", color: "#475569" }}>Personal Notes</h4>
              <div
                style={{
                  fontSize: "13px",
                  color: "#334155",
                  lineHeight: "1.6",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {internship.notes}
              </div>
            </div>
          )}

          {/* Status Transition History */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <History size={17} color="#7c3aed" />
              <h4 style={{ margin: 0, fontSize: "14px", color: "#1e1b4b", fontWeight: "700" }}>
                Status History
              </h4>
            </div>

            {loadingHistory ? (
              <div style={{ fontSize: "13px", color: "#64748b" }}>Loading history...</div>
            ) : history.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#64748b" }}>No status changes recorded yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="neu-flat"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#64748b" }}>
                        {item.previousStatus ? `${item.previousStatus} → ` : "Initial: "}
                      </span>
                      <span style={{ fontWeight: "700", color: "#7c3aed" }}>{item.newStatus}</span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          padding: "2px 8px",
                          backgroundColor: "#ede9fe",
                          borderRadius: "9999px",
                          color: "#6d28d9",
                        }}
                      >
                        {item.source}
                      </span>
                    </div>

                    <span style={{ color: "#64748b", fontSize: "11px" }}>
                      {new Date(item.changedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
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
