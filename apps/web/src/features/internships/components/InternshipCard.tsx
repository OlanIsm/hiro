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
    opacity: isDragging ? 0.3 : 1,
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "grab",
    userSelect: "none",
    boxShadow: isOverlay
      ? "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
      : "0 1px 3px rgba(0,0,0,0.2)",
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#f8fafc" }}>
          {internship.role}
        </h4>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "13px", marginBottom: "12px" }}>
        <Building size={14} />
        <span style={{ fontWeight: "500" }}>{internship.companyName}</span>
      </div>

      {internship.skills && internship.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
          {internship.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: "11px",
                backgroundColor: "#0f172a",
                color: "#38bdf8",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #1e3a5f",
              }}
            >
              {skill}
            </span>
          ))}
          {internship.skills.length > 4 && (
            <span style={{ fontSize: "11px", color: "#64748b", alignSelf: "center" }}>
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
          fontSize: "11px",
          color: "#64748b",
          borderTop: "1px solid #334155",
          paddingTop: "8px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Calendar size={12} /> {formattedAppliedDate}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={12} /> {formattedUpdatedAt}
        </span>
      </div>

      {/* Accessible Quick-Move controls */}
      {!isOverlay && onMoveToStatus && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            paddingTop: "6px",
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {prevColumn ? (
            <button
              onClick={() => onMoveToStatus(internship.id, prevColumn.id)}
              title={`Move to ${prevColumn.title}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "#cbd5e1",
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "4px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "#cbd5e1",
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
