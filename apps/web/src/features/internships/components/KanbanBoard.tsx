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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%", gap: "10px", overflow: "hidden" }}>
      {/* 4 Colored Compact Neumorphic Pills (No Icons: Ungu, Kuning, Biru, Hijau) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        {/* Total Applications - Ungu */}
        <div
          style={{
            background: "linear-gradient(145deg, #f5f3ff, #ede9fe)",
            border: "1px solid rgba(124, 58, 237, 0.25)",
            borderRadius: "9999px",
            padding: "6px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "3px 3px 8px #d0d6e2, -3px -3px 8px #ffffff",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#6d28d9" }}>
            Total Applications
          </span>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#5b21b6" }}>
            {metrics.total}
          </span>
        </div>

        {/* Test Phase - Kuning */}
        <div
          style={{
            background: "linear-gradient(145deg, #fffbeb, #fef3c7)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "9999px",
            padding: "6px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "3px 3px 8px #d0d6e2, -3px -3px 8px #ffffff",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#b45309" }}>
            Test Phase
          </span>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#92400e" }}>
            {metrics.test}
          </span>
        </div>

        {/* Interview Phase - Biru */}
        <div
          style={{
            background: "linear-gradient(145deg, #eff6ff, #dbeafe)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "9999px",
            padding: "6px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "3px 3px 8px #d0d6e2, -3px -3px 8px #ffffff",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#1d4ed8" }}>
            Interview Phase
          </span>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#1e40af" }}>
            {metrics.interview}
          </span>
        </div>

        {/* Active In Pipeline - Hijau */}
        <div
          style={{
            background: "linear-gradient(145deg, #ecfdf5, #d1fae5)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "9999px",
            padding: "6px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "3px 3px 8px #d0d6e2, -3px -3px 8px #ffffff",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#047857" }}>
            Active In Pipeline
          </span>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "#065f46" }}>
            {metrics.active}
          </span>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          backgroundColor: "#e8ecf4",
          padding: "8px 16px",
          borderRadius: "18px",
          boxShadow: "6px 6px 14px #cfd5e2, -6px -6px 14px #ffffff",
          border: "1px solid rgba(255, 255, 255, 0.7)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 240px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#e4e8f1",
              boxShadow: "inset 2px 2px 5px #d0d6e2, inset -2px -2px 5px #ffffff",
              borderRadius: "12px",
              padding: "6px 12px",
              width: "100%",
              maxWidth: "320px",
            }}
          >
            <Search size={15} color="#7c3aed" />
            <input
              type="text"
              placeholder="Search company, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#1e1b4b",
                fontSize: "12px",
                width: "100%",
                fontWeight: "500",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <SlidersHorizontal size={14} color="#7c3aed" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: "#e4e8f1",
                boxShadow: "inset 2px 2px 4px #d0d6e2, inset -2px -2px 4px #ffffff",
                border: "none",
                borderRadius: "12px",
                color: "#1e1b4b",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: "600",
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
            className="neu-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "12px",
              border: "none",
              color: "#475569",
              padding: "7px 12px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            title="Sort by Last Updated"
          >
            <ArrowUpDown size={13} color="#7c3aed" />
            <span>Updated: {sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </button>

          <button
            onClick={refreshInternships}
            disabled={loading}
            className="neu-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              borderRadius: "12px",
              border: "none",
              color: "#475569",
              padding: "7px 12px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            title="Refresh Board"
          >
            <RefreshCw size={13} className={loading ? "spin" : ""} color="#7c3aed" />
            <span>Refresh</span>
          </button>

          {/* Add Internship CTA Button */}
          <button
            onClick={() => {
              setEditingInternship(null);
              setIsFormModalOpen(true);
            }}
            className="neu-button-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "none",
              borderRadius: "12px",
              padding: "7px 16px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <Plus size={15} />
            <span>Add Internship</span>
          </button>
        </div>
      </div>

      {/* Error Banner with Dismiss */}
      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "14px",
            boxShadow: "inset 2px 2px 4px rgba(220, 38, 38, 0.1), 3px 3px 8px #cfd5e2",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#b91c1c",
            fontSize: "13px",
            fontWeight: "500",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={16} color="#dc2626" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#dc2626",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
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
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: "500",
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
              flex: 1,
              minHeight: 0,
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: "2px",
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
