import { describe, expect, it } from "bun:test";
import {
  enquirySchema,
  applicationSchema,
  approveApplicationSchema,
  rejectApplicationSchema,
  enrollStudentSchema,
} from "../../lib/validation";
import {
  validateStateTransition,
  sanitizeApplicationPayload,
  analyzeApplicationAnomalies,
  WorkflowViolationError,
} from "../../lib/security";
import { calculateCandidateMeritScore, rankCandidates } from "../../lib/services";

describe("Module 1 (Admissions) - Unit Validation & Business Logic", () => {
  it("validates valid admission enquiry inputs", () => {
    const valid = {
      email: "applicant@example.com",
      fullName: "Jane Doe",
      phone: "1234567890",
      interestedProgram: "B.Tech Computer Science",
    };
    const result = enquirySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects malformed email in enquiry", () => {
    const invalid = {
      email: "not-an-email",
      fullName: "Jane Doe",
      phone: "1234567890",
      interestedProgram: "B.Tech Computer Science",
    };
    const result = enquirySchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("sanitizes privileged fields (Mass Assignment Protection)", () => {
    const maliciousPayload = {
      fullName: "Attacker",
      email: "attacker@example.com",
      status: "approved",
      meritScore: 100,
      meritRank: 1,
      approvedBy: "admin-root",
      isMeritPublished: true,
    };

    const sanitized = sanitizeApplicationPayload(maliciousPayload);
    expect((sanitized as any).status).toBeUndefined();
    expect((sanitized as any).meritScore).toBeUndefined();
    expect((sanitized as any).meritRank).toBeUndefined();
    expect((sanitized as any).approvedBy).toBeUndefined();
    expect((sanitized as any).isMeritPublished).toBeUndefined();
    expect(sanitized.fullName).toBe("Attacker");
  });

  it("enforces valid state machine transitions", () => {
    expect(() => validateStateTransition("draft", "submitted")).not.toThrow();
    expect(() => validateStateTransition("submitted", "under_review")).not.toThrow();
    expect(() => validateStateTransition("under_review", "approved")).not.toThrow();
    expect(() => validateStateTransition("approved", "enrolled")).not.toThrow();
  });

  it("blocks illegal state transitions (Workflow Bypass Defense)", () => {
    expect(() => validateStateTransition("draft", "enrolled")).toThrow(WorkflowViolationError);
    expect(() => validateStateTransition("submitted", "enrolled")).toThrow(WorkflowViolationError);
    expect(() => validateStateTransition("draft", "approved")).toThrow(WorkflowViolationError);
  });

  it("calculates candidate merit score correctly", () => {
    const qualifications = {
      tenthMarks: "90%",
      twelfthMarks: "80%",
    };
    const score = calculateCandidateMeritScore(qualifications);
    expect(score).toBe(85);
  });

  it("ranks candidates in descending order of merit", () => {
    const candidates = [
      { id: "app-1", meritScore: 78 },
      { id: "app-2", meritScore: 95 },
      { id: "app-3", meritScore: 88 },
    ];
    const ranked = rankCandidates(candidates);
    expect(ranked[0].id).toBe("app-2");
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].id).toBe("app-3");
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].id).toBe("app-1");
    expect(ranked[2].rank).toBe(3);
  });

  it("flags abnormal qualifications in defensive anomaly detection", () => {
    const anomaly = analyzeApplicationAnomalies({
      fullName: "Suspect Candidate",
      email: "test+test@trashmail.com",
      phone: "1234567890",
      qualifications: {
        tenthMarks: 150, // Impossible > 100% score
      },
    });

    expect(anomaly.isSuspicious).toBe(true);
    expect(anomaly.riskLevel).toBe("HIGH");
  });
});
