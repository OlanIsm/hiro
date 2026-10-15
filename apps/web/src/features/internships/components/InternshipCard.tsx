import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KANBAN_COLUMNS, type Internship, type KanbanColumnId } from "../types";
import { Calendar, Building, Clock, ChevronRight, ChevronLeft } from "lucide-react";

interface InternshipCardProps {
  internship: Internship;
  onMoveToStatus?: (id: string, status: KanbanColumnId) => void;
  onClick?: (internship: Internship) => void;
  isOverlay?: boolean;
}

export function InternshipCard({
  internship,
  onMoveToStatus,
  onClick,
  isOverlay = false,
}: InternshipCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: internship.id,
    data: { internship },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    background: "linear-gradient(145deg, #ffffff, #eaf0f9)",
    borderRadius: "16px",
    padding: "12px 14px",
    marginBottom: "10px",
    cursor: "grab",
    userSelect: "none",
    boxShadow: isOverlay
      ? "16px 16px 32px #b0b9ca, -12px -12px 24px #ffffff"
      : "6px 6px 14px #b8c1d1, -5px -5px 12px #ffffff",
    border: "1px solid rgba(255, 255, 255, 0.95)",
  };

  const formattedAppliedDate = new Date(internship.appliedAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  );

  const formattedUpdatedAt = new Date(internship.updatedAt).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric" }
  );

  const currentIndex = KANBAN_COLUMNS.findIndex((c) => c.id === internship.status);
  const prevColumn = currentIndex > 0 ? KANBAN_COLUMNS[currentIndex - 1] : null;
  const nextColumn =
    currentIndex < KANBAN_COLUMNS.length - 1 ? KANBAN_COLUMNS[currentIndex + 1] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-label={`${internship.companyName} - ${internship.role}`}
      onClick={(e) => {
        if (!isDragging && onClick) {
          e.stopPropagation();
          onClick(internship);
        }
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#1e1b4b" }}>
          {internship.role}
        </h4>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6d28d9", fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>
        <Building size={13} />
        <span>{internship.companyName}</span>
      </div>

      {internship.skills && internship.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
          {internship.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: "10px",
                fontWeight: "600",
                backgroundColor: "#ede9fe",
                color: "#7c3aed",
                padding: "2px 7px",
                borderRadius: "8px",
                boxShadow: "inset 1px 1px 2px #d0d6e2, inset -1px -1px 2px #ffffff",
              }}
            >
              {skill}
            </span>
          ))}
          {internship.skills.length > 4 && (
            <span style={{ fontSize: "10px", color: "#94a3b8", alignSelf: "center", fontWeight: "500" }}>
              +{internship.skills.length - 4}
            </span>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10px",
          color: "#64748b",
          borderTop: "1px solid rgba(207, 213, 226, 0.6)",
          paddingTop: "6px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Calendar size={11} color="#8b5cf6" /> {formattedAppliedDate}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={11} color="#8b5cf6" /> {formattedUpdatedAt}
        </span>
      </div>

      {/* Accessible Quick-Move controls */}
      {!isOverlay && onMoveToStatus && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            paddingTop: "4px",
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {prevColumn ? (
            <button
              onClick={() => onMoveToStatus(internship.id, prevColumn.id)}
              title={`Move to ${prevColumn.title}`}
              className="neu-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 8px",
                borderRadius: "10px",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={12} /> {prevColumn.title}
            </button>
          ) : (
            <span />
          )}

          {nextColumn ? (
            <button
              onClick={() => onMoveToStatus(internship.id, nextColumn.id)}
              title={`Move to ${nextColumn.title}`}
              className="neu-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 8px",
                borderRadius: "10px",
                border: "none",
                color: "#7c3aed",
                cursor: "pointer",
              }}
            >
              {nextColumn.title} <ChevronRight size={12} />
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
