import React, { useState } from "react";
import { KANBAN_COLUMNS, type Internship, type InternshipFormData, type KanbanColumnId } from "../types";
import { X, Plus } from "lucide-react";

interface InternshipFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InternshipFormData) => Promise<void>;
  initialData?: Internship | null;
}

export function InternshipFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: InternshipFormModalProps) {
  const isEditing = Boolean(initialData);

  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [jobDescription, setJobDescription] = useState(initialData?.jobDescription || "");
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState<KanbanColumnId>(initialData?.status || "APPLIED");
  const [appliedAt, setAppliedAt] = useState(() => {
    if (initialData?.appliedAt) {
      return new Date(initialData.appliedAt).toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });
  const [jobUrl, setJobUrl] = useState(initialData?.jobUrl || "");
  const [recruiterEmail, setRecruiterEmail] = useState(initialData?.recruiterEmail || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [nextAction, setNextAction] = useState(initialData?.nextAction || "");
  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? new Date(initialData.deadline).toISOString().split("T")[0]
      : ""
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validations
    if (!companyName.trim()) {
      setFormError("Company name is required.");
      return;
    }

    if (!role.trim()) {
      setFormError("Role is required.");
      return;
    }

    if (jobUrl.trim()) {
      try {
        new URL(jobUrl.trim());
      } catch {
        setFormError("Please enter a valid Job URL (e.g. https://example.com/jobs/1).");
        return;
      }
    }

    if (recruiterEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recruiterEmail.trim())) {
        setFormError("Please enter a valid Recruiter Email.");
        return;
      }
    }

    try {
      setSubmitting(true);
      await onSubmit({
        companyName: companyName.trim(),
        role: role.trim(),
        jobDescription: jobDescription.trim() || undefined,
        skills,
        status,
        appliedAt: new Date(appliedAt).toISOString(),
        jobUrl: jobUrl.trim() || undefined,
        recruiterEmail: recruiterEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        nextAction: nextAction.trim() || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
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
          maxWidth: "600px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: "1px solid #283141",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
            {isEditing ? "Edit Internship Application" : "Add Internship Application"}
          </h2>
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {formError && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                color: "#fca5a5",
                fontSize: "13px",
              }}
            >
              {formError}
            </div>
          )}

          {/* Row 1: Company & Role */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google, Discord"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Role *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineer Intern"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Row 2: Status & Applied Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KanbanColumnId)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Application Date
              </label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Skills Input */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
              Skills & Tags
            </label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Add a skill (press Enter)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                }}
              >
                <Plus size={15} /> Add
              </button>
            </div>

            {skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e3a5f",
                      color: "#38bdf8",
                      fontSize: "12px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Job URL & Recruiter Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Job URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Recruiter Email
              </label>
              <input
                type="email"
                placeholder="recruiter@company.com"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Row 4: Next Action & Deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Next Action
              </label>
              <input
                type="text"
                placeholder="e.g. Complete HackerRank by Friday"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Job Description & Notes */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
              Job Description
            </label>
            <textarea
              rows={2}
              placeholder="Paste job description or requirements..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                backgroundColor: "#0d1117",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#f3f4f6",
                fontSize: "13px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#d1d5db", marginBottom: "6px" }}>
              Personal Notes
            </label>
            <textarea
              rows={2}
              placeholder="Preparation notes, interview insights, referral details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                backgroundColor: "#0d1117",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#f3f4f6",
                fontSize: "13px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "12px",
              paddingTop: "16px",
              borderTop: "1px solid #283141",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "9px 16px",
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
              type="submit"
              disabled={submitting}
              style={{
                padding: "9px 20px",
                backgroundColor: "#0284c7",
                border: "none",
                borderRadius: "6px",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "13px",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
