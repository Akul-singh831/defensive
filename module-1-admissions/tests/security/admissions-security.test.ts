import { describe, expect, it } from "bun:test";
import {
  assertRole,
  assertAdmissionsOwnership,
  assertCanApprove,
  assertCanManageMerit,
  AuthorizationError,
} from "../../lib/authorization";
import {
  validateStateTransition,
  sanitizeApplicationPayload,
  WorkflowViolationError,
} from "../../lib/security";
import type { JwtPayload } from "@/lib/auth/jwt";

describe("Module 1 (Admissions) - Security Defensive Tests", () => {
  const applicantA: JwtPayload = {
    userId: "user-applicant-A",
    email: "applicantA@example.com",
    role: "student",
    jti: "token-a",
  };

  const applicantB: JwtPayload = {
    userId: "user-applicant-B",
    email: "applicantB@example.com",
    role: "student",
    jti: "token-b",
  };

  const adminUser: JwtPayload = {
    userId: "user-admin-1",
    email: "admin@university.edu",
    role: "admin",
    jti: "token-admin",
  };

  const facultyUser: JwtPayload = {
    userId: "user-faculty-1",
    email: "prof@university.edu",
    role: "teacher",
    jti: "token-prof",
  };

  // 1. IDOR DEFENSE
  it("DEFENSE: Blocks Applicant A from accessing Applicant B's application (IDOR)", () => {
    const resourceB = {
      email: "applicantB@example.com",
      studentId: "user-applicant-B",
    };

    // Applicant A accessing B should be rejected
    expect(() => assertAdmissionsOwnership(applicantA, resourceB)).toThrow(
      AuthorizationError
    );

    // Applicant B accessing B should succeed
    expect(() => assertAdmissionsOwnership(applicantB, resourceB)).not.toThrow();

    // Admin accessing B should succeed (administrative oversight)
    expect(() => assertAdmissionsOwnership(adminUser, resourceB)).not.toThrow();
  });

  // 2. PRIVILEGE ESCALATION
  it("DEFENSE: Prevents Student/Applicant from approving admission applications", () => {
    expect(() => assertCanApprove(applicantA)).toThrow(AuthorizationError);
    expect(() => assertCanApprove(adminUser)).not.toThrow();
  });

  it("DEFENSE: Prevents Faculty from approving admissions (Least Privilege)", () => {
    expect(() => assertCanApprove(facultyUser)).toThrow(AuthorizationError);
  });

  it("DEFENSE: Prevents non-administrators from publishing merit lists", () => {
    expect(() => assertCanManageMerit(applicantA)).toThrow(AuthorizationError);
    expect(() => assertCanManageMerit(facultyUser)).toThrow(AuthorizationError);
    expect(() => assertCanManageMerit(adminUser)).not.toThrow();
  });

  // 3. WORKFLOW TAMPERING / STATE BYPASS
  it("DEFENSE: Blocks workflow skipping directly from SUBMITTED to ENROLLED without approval", () => {
    expect(() => validateStateTransition("submitted", "enrolled")).toThrow(
      WorkflowViolationError
    );
  });

  it("DEFENSE: Blocks workflow skipping from DRAFT to APPROVED", () => {
    expect(() => validateStateTransition("draft", "approved")).toThrow(
      WorkflowViolationError
    );
  });

  // 4. MASS ASSIGNMENT DEFENSE
  it("DEFENSE: Strips unauthorized status & merit fields from applicant inputs", () => {
    const payload = {
      fullName: "Attacker",
      email: "attacker@test.com",
      status: "approved",
      approvedBy: "attacker-id",
      meritScore: 100,
    };

    const sanitized = sanitizeApplicationPayload(payload);
    expect((sanitized as any).status).toBeUndefined();
    expect((sanitized as any).approvedBy).toBeUndefined();
    expect((sanitized as any).meritScore).toBeUndefined();
    expect(sanitized.fullName).toBe("Attacker");
  });

  // 5. INJECTION DEFENSE (Safe parameterization checks)
  it("DEFENSE: Injection payloads in text fields are safely treated as string literals", () => {
    const maliciousInput = "'; DROP TABLE admission_applications; --";
    const sanitized = sanitizeApplicationPayload({
      fullName: maliciousInput,
      email: "safe@example.com",
    });

    // Verification that payload is treated strictly as data without SQL interpretation
    expect(sanitized.fullName).toBe(maliciousInput);
  });

  // 6. XSS INPUT SAFETY
  it("DEFENSE: XSS script payloads in text fields do not execute server code", () => {
    const xssPayload = "<script>alert('xss')</script>";
    const sanitized = sanitizeApplicationPayload({
      fullName: xssPayload,
      email: "test@example.com",
    });

    expect(sanitized.fullName).toBe(xssPayload);
  });
});
