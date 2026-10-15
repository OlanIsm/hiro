import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Internship, KanbanColumnId } from "../types";
import { InternshipCard } from "./InternshipCard";
import { Inbox } from "lucide-react";

interface KanbanColumnProps {
  id: KanbanColumnId;
  title: string;
  description: string;
  internships: Internship[];
  onMoveToStatus: (id: string, status: KanbanColumnId) => void;
}

const COLUMN_COLORS: Record<KanbanColumnId, string> = {
  APPLIED: "#38bdf8", // Sky blue
  TEST: "#fbbf24", // Amber
  INTERVIEW: "#a855f7", // Purple
  NEXT_STEP: "#34d399", // Emerald
};

export function KanbanColumn({
  id,
  title,
  description,
  internships,
  onMoveToStatus,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnAccent = COLUMN_COLORS[id] || "#64748b";

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: "1 0 300px",
        minWidth: "280px",
        maxWidth: "360px",
        backgroundColor: isOver ? "#1a2234" : "#111827",
        borderRadius: "10px",
        border: `1px solid ${isOver ? columnAccent : "#1f2937"}`,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 230px)",
        minHeight: "450px",
        transition: "all 0.15s ease",
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #1f2937",
          borderTop: `3px solid ${columnAccent}`,
          borderTopLeftRadius: "9px",
          borderTopRightRadius: "9px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: columnAccent,
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "700",
                color: "#f3f4f6",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {title}
            </h3>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#9ca3af",
              backgroundColor: "#1f2937",
              padding: "2px 8px",
              borderRadius: "12px",
            }}
          >
            {internships.length}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
          {description}
        </p>
      </div>

      {/* Cards List / Droppable Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
        }}
      >
        <SortableContext
          items={internships.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {internships.length > 0 ? (
            internships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onMoveToStatus={onMoveToStatus}
              />
            ))
          ) : (
            <div
              style={{
                height: "140px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #1f2937",
                borderRadius: "8px",
                color: "#4b5563",
                gap: "6px",
              }}
            >
              <Inbox size={22} />
              <span style={{ fontSize: "12px" }}>No applications</span>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
