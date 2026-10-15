import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KANBAN_COLUMNS, type KanbanColumnId, type Internship, type InternshipFormData } from "../types";
import { KanbanColumn } from "./KanbanColumn";
import { InternshipCard } from "./InternshipCard";
import { InternshipFormModal } from "./InternshipFormModal";
import { InternshipDetailModal } from "./InternshipDetailModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { useInternships } from "../hooks/useInternships";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
} from "lucide-react";

export function KanbanBoard() {
  const {
    internships,
    rawCount,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    updateStatus,
    createInternship,
    updateInternship,
    deleteInternship,
    fetchStatusHistory,
    refreshInternships,
    metrics,
  } = useInternships();

  const [activeInternship, setActiveInternship] = useState<Internship | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [detailInternship, setDetailInternship] = useState<Internship | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Avoid accidental drags when clicking
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = internships.find((i) => i.id === active.id);
    if (found) {
      setActiveInternship(found);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveInternship(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Determine target column
    let targetStatus: KanbanColumnId | null = null;

    const isColumn = KANBAN_COLUMNS.some((col) => col.id === overId);
    if (isColumn) {
      targetStatus = overId as KanbanColumnId;
    } else {
      const targetCard = internships.find((i) => i.id === overId);
      if (targetCard) {
        targetStatus = targetCard.status;
      }
    }

    if (!targetStatus) return;

    const currentCard = internships.find((i) => i.id === activeId);
    if (!currentCard || currentCard.status === targetStatus) return;

    try {
      await updateStatus(activeId, targetStatus);
    } catch {
      // Handled and reverted by useInternships
    }
  };

  const handleManualMove = async (id: string, status: KanbanColumnId) => {
    try {
      await updateStatus(id, status);
    } catch {
      // Handled and reverted by useInternships
    }
  };

  const handleFormSubmit = async (data: InternshipFormData) => {
    if (editingInternship) {
      const updated = await updateInternship(editingInternship.id, data);
      if (detailInternship && detailInternship.id === editingInternship.id) {
        setDetailInternship(updated);
      }
    } else {
      await createInternship(data);
    }
  };

  const handleCardClick = (internship: Internship) => {
    setDetailInternship(internship);
  };

  const handleEditFromDetail = (internship: Internship) => {
    setDetailInternship(null);
    setEditingInternship(internship);
    setIsFormModalOpen(true);
  };

  const handleDeleteFromDetail = (id: string) => {
    setDetailInternship(null);
    setDeletingId(id);
  };

  const deletingTarget = internships.find((i) => i.id === deletingId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#161b26",
            border: "1px solid #283141",
            borderRadius: "8px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              backgroundColor: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              borderRadius: "8px",
            }}
          >
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>Total Applications</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#f3f4f6" }}>{metrics.total}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#161b26",
            border: "1px solid #283141",
            borderRadius: "8px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              backgroundColor: "rgba(251, 191, 36, 0.1)",
              color: "#fbbf24",
              borderRadius: "8px",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>Test Phase</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#f3f4f6" }}>{metrics.test}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#161b26",
            border: "1px solid #283141",
            borderRadius: "8px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              backgroundColor: "rgba(168, 85, 247, 0.1)",
              color: "#a855f7",
              borderRadius: "8px",
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>Interview Phase</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#f3f4f6" }}>{metrics.interview}</div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#161b26",
            border: "1px solid #283141",
            borderRadius: "8px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              padding: "10px",
              backgroundColor: "rgba(52, 211, 153, 0.1)",
              color: "#34d399",
              borderRadius: "8px",
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>Active In Pipeline</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#f3f4f6" }}>{metrics.active}</div>
          </div>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          backgroundColor: "#161b26",
          padding: "14px 18px",
          borderRadius: "8px",
          border: "1px solid #283141",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 280px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#0d1117",
              border: "1px solid #374151",
              borderRadius: "6px",
              padding: "6px 12px",
              width: "100%",
              maxWidth: "340px",
            }}
          >
            <Search size={16} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search company, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f3f4f6",
                fontSize: "13px",
                width: "100%",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <SlidersHorizontal size={15} color="#9ca3af" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: "#0d1117",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#e5e7eb",
                padding: "6px 10px",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Stages</option>
              {KANBAN_COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0d1117",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#e5e7eb",
              padding: "7px 12px",
              fontSize: "13px",
              cursor: "pointer",
            }}
            title="Sort by Last Updated"
          >
            <ArrowUpDown size={14} />
            <span>Updated: {sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </button>

          <button
            onClick={refreshInternships}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0d1117",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#e5e7eb",
              padding: "7px 12px",
              fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            title="Refresh Board"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>

          {/* Add Internship CTA Button */}
          <button
            onClick={() => {
              setEditingInternship(null);
              setIsFormModalOpen(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0284c7",
              border: "none",
              borderRadius: "6px",
              color: "#ffffff",
              padding: "7px 16px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(2, 132, 199, 0.3)",
            }}
          >
            <Plus size={16} />
            <span>Add Internship</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Dismiss */}
      {error && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fca5a5",
            fontSize: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fca5a5",
              cursor: "pointer",
              fontSize: "13px",
              textDecoration: "underline",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && rawCount === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#9ca3af",
            fontSize: "15px",
          }}
        >
          Loading your Kanban workspace...
        </div>
      ) : (
        /* The 4 Ordered Kanban Columns */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              paddingBottom: "16px",
            }}
          >
            {KANBAN_COLUMNS.map((col) => {
              const columnItems = internships.filter((i) => i.status === col.id);
              return (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  description={col.description}
                  internships={columnItems}
                  onMoveToStatus={handleManualMove}
                  onCardClick={handleCardClick}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeInternship ? (
              <InternshipCard internship={activeInternship} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Add / Edit Modal */}
      <InternshipFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingInternship(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingInternship}
      />

      {/* Detail Modal */}
      <InternshipDetailModal
        internship={detailInternship}
        isOpen={Boolean(detailInternship)}
        onClose={() => setDetailInternship(null)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        fetchHistory={fetchStatusHistory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await deleteInternship(deletingId);
          }
        }}
        title="Delete Internship"
        message={`Are you sure you want to delete ${
          deletingTarget ? `"${deletingTarget.role} at ${deletingTarget.companyName}"` : "this application"
        }? All associated status history will also be permanently deleted. This action cannot be undone.`}
      />
    </div>
  );
}
