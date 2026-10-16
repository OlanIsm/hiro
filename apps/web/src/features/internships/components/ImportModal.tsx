import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  CheckCircle,
  AlertCircle,
  X,
  Database,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "../../../lib/api";

interface ImportItem {
  companyName: string;
  role: string;
  status: "APPLIED" | "TEST" | "INTERVIEW" | "NEXT_STEP";
  skills?: string[];
  appliedAt?: string;
  jobUrl?: string;
  recruiterEmail?: string;
  notes?: string;
  nextAction?: string;
  deadline?: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshBoard: () => void;
}

export function ImportModal({ isOpen, onClose, onRefreshBoard }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ImportItem[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Status mapping normalizer
  const normalizeStatus = (raw: string | undefined): ImportItem["status"] => {
    if (!raw) return "APPLIED";
    const s = raw.toLowerCase().trim();
    if (s.includes("oa") || s.includes("test") || s.includes("assess") || s.includes("hackerrank") || s.includes("codility")) {
      return "TEST";
    }
    if (s.includes("interview") || s.includes("hr") || s.includes("user") || s.includes("tech") || s.includes("screen")) {
      return "INTERVIEW";
    }
    if (s.includes("offer") || s.includes("accepted") || s.includes("next") || s.includes("final")) {
      return "NEXT_STEP";
    }
    return "APPLIED";
  };

  // Robust CSV parser
  const parseCsvText = (text: string): ImportItem[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header line and 1 application row.");
    }

    // Parse header
    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());

    const companyIdx = headers.findIndex((h) => h.includes("company") || h.includes("perusahaan") || h.includes("employer") || h.includes("name"));
    const roleIdx = headers.findIndex((h) => h.includes("role") || h.includes("position") || h.includes("job") || h.includes("posisi") || h.includes("title"));
    const statusIdx = headers.findIndex((h) => h.includes("status") || h.includes("stage") || h.includes("phase"));
    const skillsIdx = headers.findIndex((h) => h.includes("skill") || h.includes("tech") || h.includes("stack"));
    const dateIdx = headers.findIndex((h) => h.includes("applied") || h.includes("date") || h.includes("tanggal"));
    const notesIdx = headers.findIndex((h) => h.includes("note") || h.includes("catatan") || h.includes("desc"));
    const urlIdx = headers.findIndex((h) => h.includes("url") || h.includes("link"));

    if (companyIdx === -1 && headers.length >= 2) {
      // Fallback: Assume column 0 is Company, column 1 is Role
      return parseFallbackRows(lines);
    }

    const items: ImportItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const company = cols[companyIdx >= 0 ? companyIdx : 0]?.trim();
      const role = cols[roleIdx >= 0 ? roleIdx : 1]?.trim();

      if (!company || !role) continue;

      const rawSkills = skillsIdx >= 0 ? cols[skillsIdx] : undefined;
      const skills = rawSkills
        ? rawSkills.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
        : [];

      items.push({
        companyName: company,
        role: role,
        status: normalizeStatus(statusIdx >= 0 ? cols[statusIdx] : undefined),
        skills,
        appliedAt: dateIdx >= 0 && cols[dateIdx] ? safeDate(cols[dateIdx]) : undefined,
        notes: notesIdx >= 0 ? cols[notesIdx] : undefined,
        jobUrl: urlIdx >= 0 && cols[urlIdx]?.startsWith("http") ? cols[urlIdx] : undefined,
      });
    }

    if (items.length === 0) {
      throw new Error("Could not find any valid applications. Please make sure Company and Role columns are present.");
    }

    return items;
  };

  const parseFallbackRows = (lines: string[]): ImportItem[] => {
    const items: ImportItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length >= 2 && cols[0] && cols[1]) {
        items.push({
          companyName: cols[0].trim(),
          role: cols[1].trim(),
          status: normalizeStatus(cols[2]),
          skills: cols[3] ? cols[3].split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [],
        });
      }
    }
    return items;
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let insideQuote = false;
    let entry = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === "," && !insideQuote) {
        result.push(entry.trim());
        entry = "";
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  const safeDate = (raw: string): string | undefined => {
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {
      // ignore invalid dates
    }
    return undefined;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParsingError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(content);
          const list = Array.isArray(parsed) ? parsed : parsed.items || [];
          const validated: ImportItem[] = list.map((item: any) => ({
            companyName: String(item.companyName || item.company || "").trim(),
            role: String(item.role || item.position || "").trim(),
            status: normalizeStatus(item.status),
            skills: Array.isArray(item.skills) ? item.skills : [],
            appliedAt: item.appliedAt || item.date,
            jobUrl: item.jobUrl || item.url,
            notes: item.notes,
          })).filter((i: ImportItem) => i.companyName && i.role);

          if (validated.length === 0) {
            throw new Error("No valid applications found in JSON. Format must be an array of objects with companyName and role.");
          }
          setParsedItems(validated);
        } else {
          const items = parseCsvText(content);
          setParsedItems(items);
        }
      } catch (err: any) {
        setParsingError(err.message || "Failed to parse file.");
        setParsedItems([]);
      }
    };

    reader.readAsText(file);
  };

  const handleParseText = () => {
    setParsingError(null);
    setImportSuccess(null);
    if (!rawText.trim()) {
      setParsingError("Please paste your CSV data first.");
      return;
    }

    try {
      if (rawText.trim().startsWith("[") || rawText.trim().startsWith("{")) {
        const parsed = JSON.parse(rawText);
        const list = Array.isArray(parsed) ? parsed : parsed.items || [];
        const validated: ImportItem[] = list.map((item: any) => ({
          companyName: String(item.companyName || item.company || "").trim(),
          role: String(item.role || item.position || "").trim(),
          status: normalizeStatus(item.status),
          skills: Array.isArray(item.skills) ? item.skills : [],
          appliedAt: item.appliedAt,
          jobUrl: item.jobUrl,
          notes: item.notes,
        })).filter((i: ImportItem) => i.companyName && i.role);
        setParsedItems(validated);
      } else {
        const items = parseCsvText(rawText);
        setParsedItems(items);
      }
    } catch (err: any) {
      setParsingError(err.message || "Failed to parse data.");
      setParsedItems([]);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedItems.length === 0) return;
    setImporting(true);
    setParsingError(null);

    try {
      const res = await apiFetch<{ count: number }>("/internships/import", {
        method: "POST",
        body: JSON.stringify({ items: parsedItems }),
      });

      setImportSuccess(`Successfully imported ${res.data?.count || parsedItems.length} applications!`);
      setTimeout(() => {
        onRefreshBoard();
        onClose();
      }, 1200);
    } catch (err: any) {
      setParsingError(err.message || "Import failed. Please check your network or inputs.");
    } finally {
      setImporting(false);
    }
  };

  const getStatusBadgeStyle = (status: ImportItem["status"]) => {
    switch (status) {
      case "APPLIED":
        return { bg: "#ede9fe", color: "#6d28d9", label: "Applied" };
      case "TEST":
        return { bg: "#fef3c7", color: "#b45309", label: "Test" };
      case "INTERVIEW":
        return { bg: "#dbeafe", color: "#1d4ed8", label: "Interview" };
      case "NEXT_STEP":
        return { bg: "#d1fae5", color: "#047857", label: "Next Step" };
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "28px",
          background: "linear-gradient(145deg, #f0f4fc, #dfe4ee)",
          boxShadow: "20px 20px 60px #cfd5e2, -20px -20px 60px #ffffff",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 26px 16px 26px",
            borderBottom: "1px solid rgba(207, 213, 226, 0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                background: "linear-gradient(145deg, #8b5cf6, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "4px 4px 10px rgba(124, 58, 237, 0.3)",
              }}
            >
              <Upload size={22} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: "800",
                  color: "#1e1b4b",
                  letterSpacing: "-0.02em",
                }}
              >
                Import Applications
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#64748b" }}>
                Import your spreadsheet from Excel, Google Sheets, or Notion (CSV / JSON)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="neu-button"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 26px", overflowY: "auto", flex: 1 }}>
          {/* Success banner */}
          {importSuccess && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              <CheckCircle size={18} color="#059669" />
              <span>{importSuccess}</span>
            </div>
          )}

          {/* Error banner */}
          {parsingError && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "14px",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13.5px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              <AlertCircle size={18} color="#dc2626" />
              <span>{parsingError}</span>
            </div>
          )}

          {/* Tabs: File Upload vs Paste Text */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "4px",
              borderRadius: "14px",
              backgroundColor: "#e1e6f0",
              boxShadow: "inset 2px 2px 5px #d0d6e2, inset -2px -2px 5px #ffffff",
              marginBottom: "18px",
            }}
          >
            <button
              onClick={() => setActiveTab("file")}
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "13.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: activeTab === "file" ? "#ffffff" : "transparent",
                color: activeTab === "file" ? "#7c3aed" : "#64748b",
                boxShadow: activeTab === "file" ? "2px 2px 6px #cfd5e2" : "none",
              }}
            >
              <FileSpreadsheet size={16} />
              <span>Upload CSV / JSON</span>
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "13.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: activeTab === "paste" ? "#ffffff" : "transparent",
                color: activeTab === "paste" ? "#7c3aed" : "#64748b",
                boxShadow: activeTab === "paste" ? "2px 2px 6px #cfd5e2" : "none",
              }}
            >
              <FileCode size={16} />
              <span>Paste CSV Text</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === "file" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #a78bfa",
                borderRadius: "18px",
                padding: "28px 20px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.4)",
                transition: "all 0.2s ease",
                marginBottom: "20px",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "16px",
                  backgroundColor: "#ede9fe",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px auto",
                  boxShadow: "inset 2px 2px 4px #cfd5e2, inset -2px -2px 4px #ffffff",
                }}
              >
                <Upload size={24} />
              </div>
              <div style={{ fontWeight: "800", fontSize: "15px", color: "#1e1b4b" }}>
                {fileName ? fileName : "Click to select or drop CSV / JSON file"}
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                Supports exported Google Sheets, Excel (.csv), Notion tables, and JSON arrays
              </p>
            </div>
          )}

          {/* Tab 2: Paste Raw Text */}
          {activeTab === "paste" && (
            <div style={{ marginBottom: "20px" }}>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={"Company,Role,Status,Skills\nGoogle,Software Engineer Intern,Applied,React; Go\nStripe,Backend Intern,Interview,Java; AWS"}
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: "none",
                  outline: "none",
                  backgroundColor: "#e4e8f1",
                  boxShadow: "inset 3px 3px 6px #d0d6e2, inset -3px -3px 6px #ffffff",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#1e1b4b",
                  boxSizing: "border-box",
                  resize: "vertical",
                  marginBottom: "10px",
                }}
              />
              <button
                type="button"
                onClick={handleParseText}
                className="neu-button"
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  border: "none",
                  color: "#7c3aed",
                  fontWeight: "700",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={16} />
                <span>Parse Text</span>
              </button>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedItems.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e1b4b" }}>
                  Preview ({parsedItems.length} applications found)
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                  Showing top {Math.min(5, parsedItems.length)} items
                </div>
              </div>

              <div
                style={{
                  borderRadius: "16px",
                  backgroundColor: "#e1e6f0",
                  boxShadow: "inset 3px 3px 7px #c5cddb, inset -3px -3px 7px #ffffff",
                  padding: "10px",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {parsedItems.slice(0, 5).map((item, idx) => {
                  const badge = getStatusBadgeStyle(item.status);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        boxShadow: "2px 2px 5px #cfd5e2",
                        marginBottom: idx < Math.min(5, parsedItems.length) - 1 ? "6px" : 0,
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: "800", fontSize: "14px", color: "#1e1b4b" }}>
                          {item.companyName}
                        </div>
                        <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                          {item.role}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.skills && item.skills.length > 0 && (
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              fontWeight: "600",
                            }}
                          >
                            {item.skills.slice(0, 2).join(", ")}
                            {item.skills.length > 2 && "..."}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: "11.5px",
                            padding: "3px 8px",
                            borderRadius: "10px",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontWeight: "800",
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 26px",
            borderTop: "1px solid rgba(207, 213, 226, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="neu-button"
            disabled={importing}
            style={{
              padding: "10px 18px",
              borderRadius: "14px",
              border: "none",
              fontWeight: "700",
              fontSize: "14px",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0 || importing}
            className="neu-button-primary"
            style={{
              padding: "10px 22px",
              borderRadius: "14px",
              border: "none",
              fontWeight: "800",
              fontSize: "14px",
              color: "#ffffff",
              cursor: parsedItems.length === 0 || importing ? "not-allowed" : "pointer",
              opacity: parsedItems.length === 0 || importing ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {importing ? (
              <span>Importing...</span>
            ) : (
              <>
                <Database size={16} />
                <span>
                  {parsedItems.length > 0
                    ? `Confirm & Import (${parsedItems.length})`
                    : "Select File to Import"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
