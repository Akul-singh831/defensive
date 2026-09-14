export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "enrolled";

export class WorkflowViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowViolationError";
  }
}

/**
 * Enforce strict Admissions State Machine transitions
 * Valid:
 * draft -> submitted
 * submitted -> under_review
 * under_review -> approved | rejected
 * approved -> enrolled
 */
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_review", "rejected"],
  under_review: ["approved", "rejected"],
  approved: ["enrolled"],
  rejected: [], // Terminal state unless reopened by admin
  enrolled: [], // Terminal state
};

export function validateStateTransition(
  currentState: ApplicationStatus,
  targetState: ApplicationStatus
): void {
  if (currentState === targetState) {
    return;
  }

  const allowed = VALID_TRANSITIONS[currentState] || [];
  if (!allowed.includes(targetState)) {
    throw new WorkflowViolationError(
      `Illegal workflow transition: Cannot transition application from '${currentState}' to '${targetState}'. Process flow must be followed.`
    );
  }
}

/**
 * Mass Assignment Protection:
 * Strips any sensitive or privileged keys that an attacker attempts to inject into payload
 */
export function sanitizeApplicationPayload<T extends Record<string, unknown>>(
  input: T
): Omit<T, "status" | "meritScore" | "meritRank" | "approvedBy" | "approvalDate" | "isMeritPublished" | "studentId"> {
  const sanitized = { ...input };
  delete sanitized.status;
  delete sanitized.meritScore;
  delete sanitized.meritRank;
  delete sanitized.approvedBy;
  delete sanitized.approvalDate;
  delete sanitized.isMeritPublished;
  delete sanitized.studentId;
  return sanitized;
}

export interface AnomalyReport {
  isSuspicious: boolean;
  reasons: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

/**
 * Defensive AI / Assistive Anomaly Detection:
 * Flags anomalous application characteristics for human review without auto-rejecting.
 */
export function analyzeApplicationAnomalies(application: {
  fullName: string;
  email: string;
  phone: string;
  qualifications: Record<string, string | number>;
}): AnomalyReport {
  const reasons: string[] = [];
  let riskScore = 0;

  // Check 1: Unusual or suspicious email pattern
  if (application.email.includes("+test") || application.email.endsWith("@trashmail.com")) {
    reasons.push("Disposable or suspicious test email address domain detected.");
    riskScore += 2;
  }

  // Check 2: Name formatting anomalies (e.g. single character or suspicious symbols)
  if (application.fullName.trim().length < 3 || /<[^>]*>|[;'"\\]/.test(application.fullName)) {
    reasons.push("Name contains unusual formatting or special syntax.");
    riskScore += 3;
  }

  // Check 3: Check qualification values for impossible scores
  for (const [exam, score] of Object.entries(application.qualifications)) {
    const num = typeof score === "number" ? score : parseFloat(String(score).replace("%", ""));
    if (!isNaN(num)) {
      if (num > 100 || num < 0) {
        reasons.push(`Qualification '${exam}' has out-of-bounds score (${num}%). Human verification required.`);
        riskScore += 3;
      }
    }
  }

  return {
    isSuspicious: riskScore >= 2,
    reasons,
    riskLevel: riskScore >= 4 ? "HIGH" : riskScore >= 2 ? "MEDIUM" : "LOW",
  };
}
