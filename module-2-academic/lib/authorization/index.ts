import type { JwtPayload } from "@/lib/auth/jwt";
import { db } from "@/lib/turso";
import { courseAssignments } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export class AcademicAuthorizationError extends Error {
  constructor(
    public status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "AcademicAuthorizationError";
  }
}

/**
 * Verify role requirement
 */
export function assertAcademicRole(user: JwtPayload, allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new AcademicAuthorizationError(
      403,
      `Forbidden: Role '${user.role}' is not authorized for this academic operation. Required: [${allowedRoles.join(", ")}]`
    );
  }
}

/**
 * Student IDOR Defense: Assert student is accessing only their own academic data
 */
export function assertStudentSelfAccess(user: JwtPayload, targetStudentId: string) {
  if (user.role === "student" && user.userId !== targetStudentId) {
    throw new AcademicAuthorizationError(
      403,
      "Access Denied (IDOR Defense): You are only permitted to access your own academic records."
    );
  }
}

/**
 * Faculty Ownership Check (Section 13):
 * Verifies that the authenticated faculty member is officially assigned to the target course/section.
 * Admins are permitted supervisory access.
 */
export async function assertFacultyCourseOwnership(
  user: JwtPayload,
  courseId: string,
  sectionCode?: string
): Promise<void> {
  if (user.role === "admin") {
    return; // Admin supervisory override
  }

  if (user.role !== "teacher") {
    throw new AcademicAuthorizationError(
      403,
      "Forbidden: Only assigned faculty members or administrators can record academic assessments/attendance."
    );
  }

  const conditions = [
    eq(courseAssignments.courseId, courseId),
    eq(courseAssignments.teacherId, user.userId),
  ];

  if (sectionCode) {
    conditions.push(eq(courseAssignments.sectionCode, sectionCode));
  }

  const assignment = await db.query.courseAssignments.findFirst({
    where: and(...conditions),
  });

  if (!assignment) {
    throw new AcademicAuthorizationError(
      403,
      `Access Denied (Faculty Isolation): You are not assigned as instructor for course '${courseId}' and cannot record or alter its records.`
    );
  }
}
