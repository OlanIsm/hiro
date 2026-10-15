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
  onCardClick?: (internship: Internship) => void;
}

const COLUMN_COLORS: Record<KanbanColumnId, { dot: string; lightBg: string; text: string }> = {
  APPLIED: { dot: "#6366f1", lightBg: "#e0e7ff", text: "#4338ca" }, // Indigo
  TEST: { dot: "#f59e0b", lightBg: "#fef3c7", text: "#b45309" }, // Amber
  INTERVIEW: { dot: "#8b5cf6", lightBg: "#ede9fe", text: "#6d28d9" }, // Purple
  NEXT_STEP: { dot: "#10b981", lightBg: "#d1fae5", text: "#047857" }, // Emerald
};

export function KanbanColumn({
  id,
  title,
  description,
  internships,
  onMoveToStatus,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnTheme = COLUMN_COLORS[id] || { dot: "#8b5cf6", lightBg: "#ede9fe", text: "#6d28d9" };

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: "1 1 0",
        minWidth: "220px",
        backgroundColor: isOver ? "#e1e7f3" : "#e8ecf4",
        borderRadius: "20px",
        boxShadow: isOver
          ? "inset 4px 4px 10px #cfd5e2, inset -4px -4px 10px #ffffff, 0 0 0 2px #8b5cf6"
          : "6px 6px 14px #cfd5e2, -6px -6px 14px #ffffff",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "100%",
        overflow: "hidden",
        transition: "all 0.2s ease",
        border: "1px solid rgba(255, 255, 255, 0.7)",
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: "10px 14px 8px 14px",
          borderBottom: "1px solid rgba(207, 213, 226, 0.5)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: columnTheme.dot,
                boxShadow: `0 0 6px ${columnTheme.dot}`,
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "800",
                color: "#1e1b4b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {title}
            </h3>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: columnTheme.text,
              backgroundColor: columnTheme.lightBg,
              padding: "1px 8px",
              borderRadius: "12px",
              boxShadow: "inset 1px 1px 2px #d0d6e2, inset -1px -1px 2px #ffffff",
            }}
          >
            {internships.length}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>
          {description}
        </p>
      </div>

      {/* Cards List / Droppable Area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "10px 8px",
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
                onClick={onCardClick}
              />
            ))
          ) : (
            <div
              style={{
                height: "90px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "14px",
                backgroundColor: "#e4e8f1",
                boxShadow: "inset 2px 2px 5px #d0d6e2, inset -2px -2px 5px #ffffff",
                color: "#94a3b8",
                gap: "4px",
              }}
            >
              <Inbox size={20} color="#a5b4fc" />
              <span style={{ fontSize: "12px", fontWeight: "500" }}>No applications yet</span>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
