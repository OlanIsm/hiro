export const INTERNSHIP_STATUSES = [
  "APPLIED",
  "TEST",
  "INTERVIEW",
  "NEXT_STEP",
] as const;

export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

export const STATUS_CHANGE_SOURCES = ["MANUAL", "GMAIL", "IMPORT"] as const;
export type StatusChangeSource = (typeof STATUS_CHANGE_SOURCES)[number];
