export const KANBAN_COLUMNS = [
  { id: "APPLIED", title: "Applied", description: "Submitted applications" },
  { id: "TEST", title: "Test", description: "Online assessments & technical challenges" },
  { id: "INTERVIEW", title: "Interview", description: "User/technical interviews in progress" },
  { id: "NEXT_STEP", title: "Next Step", description: "Final round, offer, or decision" },
] as const;

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]["id"];

export interface Internship {
  id: string;
  companyName: string;
  role: string;
  jobDescription?: string | null;
  skills: string[];
  status: KanbanColumnId;
  appliedAt: string;
  jobUrl?: string | null;
  recruiterEmail?: string | null;
  notes?: string | null;
  nextAction?: string | null;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  id: string;
  internshipId: string;
  previousStatus?: string | null;
  newStatus: string;
  changedAt: string;
  source: "MANUAL" | "GMAIL";
  relatedEmailId?: string | null;
}

export interface InternshipFormData {
  companyName: string;
  role: string;
  jobDescription?: string;
  skills: string[];
  status: KanbanColumnId;
  appliedAt: string;
  jobUrl?: string;
  recruiterEmail?: string;
  notes?: string;
  nextAction?: string;
  deadline?: string;
}

export interface InternshipMetrics {
  total: number;
  active: number;
  test: number;
  interview: number;
}
