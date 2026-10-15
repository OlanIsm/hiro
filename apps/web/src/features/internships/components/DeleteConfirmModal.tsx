import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmModalProps) {
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
          borderRadius: "24px",
          width: "100%",
          maxWidth: "420px",
          padding: "26px",
          boxShadow: "20px 20px 60px #cfd5e2, -20px -20px 60px #ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              borderRadius: "14px",
              boxShadow: "inset 2px 2px 5px rgba(220, 38, 38, 0.15), 2px 2px 5px #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1e1b4b" }}>
            {title}
          </h3>
        </div>

        <p style={{ margin: "0 0 24px 0", fontSize: "15px", color: "#64748b", lineHeight: "1.6" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button
            onClick={onClose}
            className="neu-button"
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "12px",
              color: "#64748b",
              fontSize: "14.5px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(145deg, #ef4444, #dc2626)",
              boxShadow: "4px 4px 12px rgba(220, 38, 38, 0.35), -3px -3px 8px #ffffff",
              border: "none",
              borderRadius: "12px",
              color: "#ffffff",
              fontSize: "14.5px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Delete Application
          </button>
        </div>
      </div>
    </div>
  );
}
