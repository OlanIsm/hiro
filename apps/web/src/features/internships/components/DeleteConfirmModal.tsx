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
        backgroundColor: "rgba(0, 0, 0, 0.75)",
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
          backgroundColor: "#161b26",
          border: "1px solid #374151",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "420px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              padding: "10px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#ef4444",
              borderRadius: "8px",
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#f8fafc" }}>
            {title}
          </h3>
        </div>

        <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#9ca3af", lineHeight: "1.5" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#d1d5db",
              fontSize: "13px",
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
              padding: "8px 18px",
              backgroundColor: "#ef4444",
              border: "none",
              borderRadius: "6px",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Delete Application
          </button>
        </div>
      </div>
    </div>
  );
}
