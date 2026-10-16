import type { Internship } from "@prisma/client";

export interface EmailData {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date?: string;
}

export interface MatchResult {
  emailId: string;
  matchedInternshipId: string | null;
  companyName?: string;
  role?: string;
  currentStatus?: string;
  detectedCategory: string | null;
  recommendedStatus: "APPLIED" | "TEST" | "INTERVIEW" | "NEXT_STEP" | null;
  confidence: number;
  evidence: string[];
  isAmbiguous: boolean;
  sender: string;
  subject: string;
  snippet: string;
}

const TEST_KEYWORDS = [
  "hackerrank",
  "codesignal",
  "online assessment",
  "coding assessment",
  "technical assessment",
  "take-home assignment",
  "take-home",
  "coding challenge",
  "coding test",
  "assessment link",
  "online test",
  "technical test",
];

const INTERVIEW_KEYWORDS = [
  "interview invitation",
  "interview schedule",
  "schedule interview",
  "invitation to interview",
  "schedule a call",
  "schedule a chat",
  "hiring manager",
  "screening call",
  "phone screen",
  "video interview",
  "technical interview",
  "interview with",
  "chat with the team",
  "zoom meeting",
  "google meet",
  "calendly.com",
  "interview",
];

const NEXT_STEP_KEYWORDS = [
  "offer letter",
  "pleased to offer",
  "congratulations",
  "job offer",
  "welcome to the team",
  "final round results",
  "next steps in your process",
  "background check",
  "verbal offer",
];

/**
 * Normalizes text for matching by removing non-alphanumeric punctuation and lowercasing.
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

/**
 * Checks if any keyword exists as a phrase or substring within the text.
 */
function findKeywords(text: string, keywords: string[]): string[] {
  const norm = normalize(text);
  return keywords.filter((kw) => norm.includes(kw.toLowerCase()));
}

/**
 * Evaluates an email message against all existing internships to find matches and stage recommendations.
 */
export function matchEmail(email: EmailData, internships: Internship[]): MatchResult {
  const combinedText = `${email.sender} ${email.subject} ${email.snippet}`;
  const normSubject = normalize(email.subject);
  const normSender = normalize(email.sender);
  const normSnippet = normalize(email.snippet);

  // 1. Detect Category & Recommended Status
  const testHits = findKeywords(combinedText, TEST_KEYWORDS);
  const interviewHits = findKeywords(combinedText, INTERVIEW_KEYWORDS);
  const nextStepHits = findKeywords(combinedText, NEXT_STEP_KEYWORDS);

  let detectedCategory: string | null = null;
  let recommendedStatus: "APPLIED" | "TEST" | "INTERVIEW" | "NEXT_STEP" | null = null;
  const statusEvidence: string[] = [];

  if (nextStepHits.length > 0) {
    detectedCategory = "OFFER_OR_NEXT_STEP";
    recommendedStatus = "NEXT_STEP";
    statusEvidence.push(`Detected keywords: ${nextStepHits.join(", ")}`);
  } else if (interviewHits.length > 0) {
    detectedCategory = "INTERVIEW_INVITATION";
    recommendedStatus = "INTERVIEW";
    statusEvidence.push(`Detected keywords: ${interviewHits.join(", ")}`);
  } else if (testHits.length > 0) {
    detectedCategory = "ONLINE_ASSESSMENT";
    recommendedStatus = "TEST";
    statusEvidence.push(`Detected keywords: ${testHits.join(", ")}`);
  }

  // 2. Score against each internship
  const scoredInternships: Array<{
    internship: Internship;
    score: number;
    evidence: string[];
  }> = [];

  for (const internship of internships) {
    let score = 0;
    const evidence: string[] = [];

    // Recruiter email exact match
    if (
      internship.recruiterEmail &&
      email.sender.toLowerCase().includes(internship.recruiterEmail.toLowerCase())
    ) {
      score += 0.55;
      evidence.push(`Sender matches recruiter email (${internship.recruiterEmail})`);
    }

    // Company name match
    const companyClean = normalize(internship.companyName);
    if (companyClean.length >= 2) {
      if (normSubject.includes(companyClean)) {
        score += 0.45;
        evidence.push(`Company name "${internship.companyName}" found in subject`);
      }
      if (normSender.includes(companyClean)) {
        score += 0.45;
        evidence.push(`Company name "${internship.companyName}" found in sender address`);
      } else if (normSnippet.includes(companyClean)) {
        score += 0.2;
        evidence.push(`Company name "${internship.companyName}" found in email body snippet`);
      }
    }

    // Role keywords match
    const roleWords = normalize(internship.role)
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["intern", "internship", "junior"].includes(w));
    const matchingRoleWords = roleWords.filter(
      (w) => normSubject.includes(w) || normSnippet.includes(w)
    );
    if (matchingRoleWords.length > 0) {
      score += 0.15;
      evidence.push(`Role keywords matched: ${matchingRoleWords.join(", ")}`);
    }

    if (score > 0.2) {
      scoredInternships.push({ internship, score, evidence });
    }
  }

  // Sort by highest score
  scoredInternships.sort((a, b) => b.score - a.score);

  if (scoredInternships.length === 0 || !recommendedStatus) {
    return {
      emailId: email.id,
      matchedInternshipId: null,
      detectedCategory,
      recommendedStatus: null,
      confidence: 0,
      evidence: statusEvidence,
      isAmbiguous: false,
      sender: email.sender,
      subject: email.subject,
      snippet: email.snippet,
    };
  }

  const best = scoredInternships[0];
  const allEvidence = [...best.evidence, ...statusEvidence];

  // Ambiguity check: if top candidate has low score or 2 candidates have very close scores
  const isAmbiguous =
    best.score < 0.55 ||
    (scoredInternships.length > 1 &&
      Math.abs(scoredInternships[0].score - scoredInternships[1].score) < 0.15);

  const confidence = Math.min(1.0, Math.round(best.score * 100) / 100);

  return {
    emailId: email.id,
    matchedInternshipId: isAmbiguous ? null : best.internship.id,
    companyName: best.internship.companyName,
    role: best.internship.role,
    currentStatus: best.internship.status,
    detectedCategory,
    recommendedStatus,
    confidence,
    evidence: allEvidence,
    isAmbiguous,
    sender: email.sender,
    subject: email.subject,
    snippet: email.snippet,
  };
}
