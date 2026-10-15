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
        backgroundColor: "rgba(0, 0, 0, 0.75)",
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
          backgroundColor: "#161b26",
          border: "1px solid #283141",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "650px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
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
            padding: "20px 24px",
            borderBottom: "1px solid #283141",
            backgroundColor: "#111827",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  fontWeight: "600",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  color: "#38bdf8",
                }}
              >
                {currentColumn?.title || internship.status}
              </span>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Applied on {new Date(internship.appliedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
              {internship.role}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9ca3af", marginTop: "4px", fontSize: "14px" }}>
              <Building size={16} />
              <span>{internship.companyName}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => onEdit(internship)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#e2e8f0",
                fontSize: "12px",
                cursor: "pointer",
              }}
              title="Edit application"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={() => onDelete(internship.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                color: "#fca5a5",
                fontSize: "12px",
                cursor: "pointer",
              }}
              title="Delete application"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div
          style={{
            padding: "24px",
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
              gap: "12px",
              backgroundColor: "#0d1117",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #1f2937",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "#6b7280", display: "block" }}>Job Posting</span>
              {internship.jobUrl ? (
                <a
                  href={internship.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#38bdf8",
                    fontSize: "13px",
                    textDecoration: "none",
                    marginTop: "2px",
                  }}
                >
                  View Job Link <ExternalLink size={12} />
                </a>
              ) : (
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>None</span>
              )}
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#6b7280", display: "block" }}>Recruiter Email</span>
              {internship.recruiterEmail ? (
                <a
                  href={`mailto:${internship.recruiterEmail}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#38bdf8",
                    fontSize: "13px",
                    textDecoration: "none",
                    marginTop: "2px",
                  }}
                >
                  <Mail size={12} /> {internship.recruiterEmail}
                </a>
              ) : (
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>None</span>
              )}
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#6b7280", display: "block" }}>Next Action</span>
              <span style={{ fontSize: "13px", color: internship.nextAction ? "#f3f4f6" : "#9ca3af" }}>
                {internship.nextAction || "None specified"}
              </span>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#6b7280", display: "block" }}>Deadline</span>
              <span style={{ fontSize: "13px", color: internship.deadline ? "#fbbf24" : "#9ca3af" }}>
                {internship.deadline
                  ? new Date(internship.deadline).toLocaleDateString()
                  : "None specified"}
              </span>
            </div>
          </div>

          {/* Skills / Tags */}
          {internship.skills && internship.skills.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#d1d5db" }}>Skills & Tech Stack</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {internship.skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "12px",
                      backgroundColor: "#0f172a",
                      color: "#38bdf8",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      border: "1px solid #1e3a5f",
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
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#d1d5db" }}>Job Description</h4>
              <div
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  lineHeight: "1.6",
                  backgroundColor: "#0d1117",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "1px solid #1f2937",
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
              <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#d1d5db" }}>Personal Notes</h4>
              <div
                style={{
                  fontSize: "13px",
                  color: "#cbd5e1",
                  lineHeight: "1.6",
                  backgroundColor: "#0d1117",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "1px solid #1f2937",
                  whiteSpace: "pre-wrap",
                }}
              >
                {internship.notes}
              </div>
            </div>
          )}

          {/* Status Transition History */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <History size={16} color="#38bdf8" />
              <h4 style={{ margin: 0, fontSize: "14px", color: "#f8fafc", fontWeight: "600" }}>
                Status History
              </h4>
            </div>

            {loadingHistory ? (
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>Loading history...</div>
            ) : history.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>No status changes recorded yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      backgroundColor: "#0d1117",
                      border: "1px solid #1f2937",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#9ca3af" }}>
                        {item.previousStatus ? `${item.previousStatus} → ` : "Initial: "}
                      </span>
                      <span style={{ fontWeight: "600", color: "#38bdf8" }}>{item.newStatus}</span>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          backgroundColor: "#1e293b",
                          borderRadius: "4px",
                          color: "#94a3b8",
                        }}
                      >
                        {item.source}
                      </span>
                    </div>

                    <span style={{ color: "#64748b" }}>
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
