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
        backgroundColor: "rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(4px)",
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
          background: "linear-gradient(145deg, #f0f4fc, #dfe4ee)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "20px 20px 60px #cfd5e2, -20px -20px 60px #ffffff",
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
            padding: "20px 28px",
            borderBottom: "1px solid rgba(207, 213, 226, 0.5)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "21px", fontWeight: "700", color: "#1e1b4b" }}>
            {isEditing ? "Edit Internship Application" : "Add Internship Application"}
          </h2>
          <button
            onClick={onClose}
            className="neu-button"
            style={{
              border: "none",
              borderRadius: "50%",
              color: "#64748b",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "22px 28px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {formError && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                color: "#b91c1c",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "inset 2px 2px 4px rgba(220, 38, 38, 0.1)",
              }}
            >
              {formError}
            </div>
          )}

          {/* Row 1: Company & Role */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
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
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
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
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 2: Status & Applied Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KanbanColumnId)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  outline: "none",
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
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Application Date
              </label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Skills Input */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              Skills & Tags
            </label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Add a skill (press Enter)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="neu-button"
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "12px",
                  color: "#7c3aed",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#ede9fe",
                      border: "1px solid rgba(124, 58, 237, 0.2)",
                      color: "#6d28d9",
                      fontWeight: "600",
                      fontSize: "13px",
                      padding: "4px 11px",
                      borderRadius: "9999px",
                      boxShadow: "2px 2px 5px #d0d6e2, -2px -2px 5px #ffffff",
                    }}
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#8b5cf6",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Job URL & Recruiter Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Job URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Recruiter Email
              </label>
              <input
                type="email"
                placeholder="recruiter@company.com"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 4: Next Action & Deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Next Action
              </label>
              <input
                type="text"
                placeholder="e.g. Complete HackerRank by Friday"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  color: "#1e1b4b",
                  fontSize: "14.5px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Job Description & Notes */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              Job Description
            </label>
            <textarea
              rows={2}
              placeholder="Paste job description or requirements..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "#e4e8f1",
                boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                border: "1px solid rgba(255, 255, 255, 0.7)",
                borderRadius: "12px",
                color: "#1e1b4b",
                fontSize: "14.5px",
                boxSizing: "border-box",
                resize: "vertical",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
              Personal Notes
            </label>
            <textarea
              rows={2}
              placeholder="Preparation notes, interview insights, referral details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "#e4e8f1",
                boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                border: "1px solid rgba(255, 255, 255, 0.7)",
                borderRadius: "12px",
                color: "#1e1b4b",
                fontSize: "14.5px",
                boxSizing: "border-box",
                resize: "vertical",
                outline: "none",
              }}
            />
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "14px",
              marginTop: "8px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(207, 213, 226, 0.5)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="neu-button"
              style={{
                padding: "10px 20px",
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
              type="submit"
              disabled={submitting}
              className="neu-button-primary"
              style={{
                padding: "10px 24px",
                border: "none",
                borderRadius: "12px",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "14.5px",
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
