import type { JwtPayload } from "@/lib/auth/jwt";

export class AuthorizationError extends Error {
  constructor(
    public status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Verify that the user has one of the allowed roles
 */
export function assertRole(user: JwtPayload, allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      403,
      `Forbidden. Role '${user.role}' is not authorized. Required: [${allowedRoles.join(", ")}]`
    );
  }
}

/**
 * IDOR Defense: Assert that an applicant or student only accesses their own resource
 * Admins are permitted full access.
 */
export function assertAdmissionsOwnership(
  user: JwtPayload,
  resource: { email?: string | null; studentId?: string | null }
) {
  if (user.role === "admin") {
    return; // Admin has supervisory access
  }

  const isOwner =
    (resource.email && resource.email.toLowerCase() === user.email.toLowerCase()) ||
    (resource.studentId && resource.studentId === user.userId);

  if (!isOwner) {
    throw new AuthorizationError(
      403,
      "Access Denied: You do not have permission to view or modify this admissions record."
    );
  }
}

/**
 * Assert that only an admin can perform approval, merit publishing, and enrollment
 */
export function assertCanApprove(user: JwtPayload) {
  if (user.role !== "admin") {
    throw new AuthorizationError(
      403,
      "Privilege Escalation Blocked: Only authorized administrators can approve admissions or enroll students."
    );
  }
}

/**
 * Assert that only an admin can modify or publish merit lists
 */
export function assertCanManageMerit(user: JwtPayload) {
  if (user.role !== "admin") {
    throw new AuthorizationError(
      403,
      "Privilege Escalation Blocked: Only administrators can calculate, verify, or publish merit lists."
    );
  }
}
