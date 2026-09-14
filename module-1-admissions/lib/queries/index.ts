import { db } from "@/lib/turso";
import {
  admissionEnquiries,
  admissionApplications,
  enrolledStudents,
  meritLists,
  users,
} from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/lib/id";
import { hashPassword } from "@/lib/auth/password";
import type { JwtPayload } from "@/lib/auth/jwt";
import type {
  EnquiryInput,
  ApplicationInput,
  UpdateApplicationInput,
  EnrollStudentInput,
} from "../validation";
import {
  assertRole,
  assertAdmissionsOwnership,
  assertCanApprove,
  assertCanManageMerit,
  AuthorizationError,
} from "../authorization";
import {
  validateStateTransition,
  sanitizeApplicationPayload,
  analyzeApplicationAnomalies,
  type ApplicationStatus,
} from "../security";
import { logAdmissionsAudit } from "../audit";
import {
  calculateCandidateMeritScore,
  rankCandidates,
  generateEnrollmentNumber,
} from "../services";

// ==========================================
// ENQUIRIES
// ==========================================

export async function createEnquiry(data: EnquiryInput, user?: JwtPayload, ip?: string) {
  const id = generateId();
  const now = new Date().toISOString();

  const newEnquiry = {
    id,
    email: data.email.toLowerCase().trim(),
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    interestedProgram: data.interestedProgram.trim(),
    enquiryDate: now,
    status: "new" as const,
    createdAt: now,
    updatedAt: now,
  };

  const [inserted] = await db.insert(admissionEnquiries).values(newEnquiry).returning();

  await logAdmissionsAudit({
    actor: user,
    action: "ENQUIRY_CREATED",
    resourceType: "enquiry",
    resourceId: id,
    newState: "new",
    ipAddress: ip,
    details: `Enquiry created for program: ${data.interestedProgram}`,
  });

  return inserted;
}

export async function getEnquiry(id: string, user: JwtPayload) {
  const enquiry = await db.query.admissionEnquiries.findFirst({
    where: eq(admissionEnquiries.id, id),
  });

  if (!enquiry) return null;

  assertAdmissionsOwnership(user, enquiry);
  return enquiry;
}

export async function listEnquiries(user: JwtPayload) {
  if (user.role === "admin") {
    return db.query.admissionEnquiries.findMany({
      orderBy: [desc(admissionEnquiries.createdAt)],
    });
  }

  // Student can only see enquiries registered with their email
  return db.query.admissionEnquiries.findMany({
    where: eq(admissionEnquiries.email, user.email.toLowerCase().trim()),
    orderBy: [desc(admissionEnquiries.createdAt)],
  });
}

export async function updateEnquiryStatus(
  id: string,
  newStatus: "new" | "contacted" | "converted" | "closed",
  user: JwtPayload,
  ip?: string
) {
  assertRole(user, ["admin"]);

  const existing = await db.query.admissionEnquiries.findFirst({
    where: eq(admissionEnquiries.id, id),
  });

  if (!existing) {
    throw new Error("Enquiry not found");
  }

  const now = new Date().toISOString();
  const [updated] = await db
    .update(admissionEnquiries)
    .set({
      status: newStatus,
      updatedAt: now,
    })
    .where(eq(admissionEnquiries.id, id))
    .returning();

  await logAdmissionsAudit({
    actor: user,
    action: "ENQUIRY_STATUS_UPDATED",
    resourceType: "enquiry",
    resourceId: id,
    previousState: existing.status,
    newState: newStatus,
    ipAddress: ip,
  });

  return updated;
}

// ==========================================
// APPLICATIONS
// ==========================================

export async function createApplication(
  data: ApplicationInput,
  user: JwtPayload,
  enquiryId?: string,
  ip?: string
) {
  // Mass-assignment protection: strip any privileged fields
  const safeData = sanitizeApplicationPayload(data);

  // If user is a student, enforce their verified email
  const emailToUse = user.role === "student" ? user.email.toLowerCase() : safeData.email.toLowerCase();

  const id = generateId();
  const now = new Date().toISOString();

  // Run defensive anomaly detection
  const anomaly = analyzeApplicationAnomalies({
    fullName: safeData.fullName,
    email: emailToUse,
    phone: safeData.phone,
    qualifications: (safeData.qualifications as Record<string, string | number>) || {},
  });

  const calculatedMerit = calculateCandidateMeritScore(
    (safeData.qualifications as Record<string, string | number>) || {}
  );

  const newApp = {
    id,
    enquiryId: enquiryId || null,
    studentId: user.role === "student" ? user.userId : null,
    email: emailToUse,
    fullName: safeData.fullName.trim(),
    dateOfBirth: safeData.dateOfBirth,
    address: safeData.address.trim(),
    phone: safeData.phone.trim(),
    programAppliedFor: safeData.programAppliedFor.trim(),
    qualifications: JSON.stringify(safeData.qualifications),
    applicationDate: now,
    status: "draft" as const,
    meritScore: calculatedMerit,
    meritRank: null,
    isMeritPublished: false,
    createdAt: now,
    updatedAt: now,
  };

  const [inserted] = await db.insert(admissionApplications).values(newApp).returning();

  await logAdmissionsAudit({
    actor: user,
    action: "APPLICATION_CREATED",
    resourceType: "application",
    resourceId: id,
    newState: "draft",
    ipAddress: ip,
    details: anomaly.isSuspicious
      ? `[ANOMALY_FLAG] Risk: ${anomaly.riskLevel}. Notes: ${anomaly.reasons.join("; ")}`
      : "Application draft created",
  });

  return { ...inserted, anomalyReport: anomaly };
}

export async function getApplication(id: string, user: JwtPayload) {
  const application = await db.query.admissionApplications.findFirst({
    where: eq(admissionApplications.id, id),
  });

  if (!application) return null;

  assertAdmissionsOwnership(user, application);

  // Field minimization: hide internal approval metadata and unpublished merit from applicants
  if (user.role !== "admin" && !application.isMeritPublished) {
    return {
      ...application,
      meritScore: null,
      meritRank: null,
    };
  }

  return application;
}

export async function listApplications(user: JwtPayload) {
  if (user.role === "admin") {
    return db.query.admissionApplications.findMany({
      orderBy: [desc(admissionApplications.createdAt)],
    });
  }

  // Student sees only their own applications
  const apps = await db.query.admissionApplications.findMany({
    where: eq(admissionApplications.email, user.email.toLowerCase().trim()),
    orderBy: [desc(admissionApplications.createdAt)],
  });

  // Minimize fields: hide unpublished merit rankings from student list
  return apps.map((app) => ({
    ...app,
    meritScore: app.isMeritPublished ? app.meritScore : null,
    meritRank: app.isMeritPublished ? app.meritRank : null,
  }));
}

export async function updateDraftApplication(
  id: string,
  data: UpdateApplicationInput,
  user: JwtPayload,
  ip?: string
) {
  const app = await db.query.admissionApplications.findFirst({
    where: eq(admissionApplications.id, id),
  });

  if (!app) {
    throw new Error("Application not found");
  }

  assertAdmissionsOwnership(user, app);

  if (app.status !== "draft") {
    throw new Error("Cannot modify application after submission. Current status: " + app.status);
  }

  const safeData = sanitizeApplicationPayload(data);
  const now = new Date().toISOString();

  let newMeritScore = app.meritScore;
  if (safeData.qualifications) {
    newMeritScore = calculateCandidateMeritScore(
      safeData.qualifications as Record<string, string | number>
    );
  }

  const [updated] = await db
    .update(admissionApplications)
    .set({
      fullName: safeData.fullName?.trim() || app.fullName,
      dateOfBirth: safeData.dateOfBirth || app.dateOfBirth,
      address: safeData.address?.trim() || app.address,
      phone: safeData.phone?.trim() || app.phone,
      programAppliedFor: safeData.programAppliedFor?.trim() || app.programAppliedFor,
      qualifications: safeData.qualifications
        ? JSON.stringify(safeData.qualifications)
        : app.qualifications,
      meritScore: newMeritScore,
      updatedAt: now,
    })
    .where(eq(admissionApplications.id, id))
    .returning();

  await logAdmissionsAudit({
    actor: user,
    action: "APPLICATION_DRAFT_UPDATED",
    resourceType: "application",
    resourceId: id,
    ipAddress: ip,
  });

  return updated;
}

export async function submitApplication(id: string, user: JwtPayload, ip?: string) {
  const app = await db.query.admissionApplications.findFirst({
    where: eq(admissionApplications.id, id),
  });

  if (!app) throw new Error("Application not found");

  assertAdmissionsOwnership(user, app);
  validateStateTransition(app.status as ApplicationStatus, "submitted");

  const now = new Date().toISOString();
  const [updated] = await db
    .update(admissionApplications)
    .set({
      status: "submitted",
      updatedAt: now,
    })
    .where(eq(admissionApplications.id, id))
    .returning();

  await logAdmissionsAudit({
    actor: user,
    action: "APPLICATION_SUBMITTED",
    resourceType: "application",
    resourceId: id,
    previousState: app.status,
    newState: "submitted",
    ipAddress: ip,
  });

  return updated;
}

// ==========================================
// MERIT MANAGEMENT
// ==========================================

export async function calculateAndRankMerit(program: string, user: JwtPayload, ip?: string) {
  assertCanManageMerit(user);

  // Fetch all submitted or under_review applications for this program
  const apps = await db.query.admissionApplications.findMany({
    where: and(
      eq(admissionApplications.programAppliedFor, program),
      sql`${admissionApplications.status} IN ('submitted', 'under_review', 'approved')`
    ),
  });

  if (apps.length === 0) {
    return { count: 0, ranked: [] };
  }

  // Calculate scores
  const evaluated = apps.map((a) => {
    let qualObj = {};
    try {
      qualObj = JSON.parse(a.qualifications);
    } catch {
      qualObj = {};
    }
    const score = a.meritScore ?? calculateCandidateMeritScore(qualObj);
    return {
      id: a.id,
      meritScore: score,
    };
  });

  const ranked = rankCandidates(evaluated);

  // Update ranks in database
  const now = new Date().toISOString();
  for (const item of ranked) {
    await db
      .update(admissionApplications)
      .set({
        meritScore: item.meritScore,
        meritRank: item.rank,
        status: "under_review",
        updatedAt: now,
      })
      .where(eq(admissionApplications.id, item.id));
  }

  await logAdmissionsAudit({
    actor: user,
    action: "MERIT_LIST_CALCULATED",
    resourceType: "merit_list",
    details: `Calculated merit scores and ranks for ${ranked.length} candidates in ${program}`,
    ipAddress: ip,
  });

  return { count: ranked.length, ranked };
}

export async function publishMeritList(
  program: string,
  academicYear: string,
  user: JwtPayload,
  ip?: string
) {
  assertCanManageMerit(user);

  const now = new Date().toISOString();

  // Mark all applications in program as merit published
  await db
    .update(admissionApplications)
    .set({
      isMeritPublished: true,
      updatedAt: now,
    })
    .where(eq(admissionApplications.programAppliedFor, program));

  // Record in meritLists registry
  const meritListId = generateId();
  await db.insert(meritLists).values({
    id: meritListId,
    program,
    academicYear,
    generatedBy: user.userId,
    isVerified: true,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await logAdmissionsAudit({
    actor: user,
    action: "MERIT_PUBLISHED",
    resourceType: "merit_list",
    resourceId: meritListId,
    details: `Published official verified merit list for ${program} (${academicYear})`,
    ipAddress: ip,
  });

  return { ok: true, meritListId, program, publishedAt: now };
}

export async function getMeritList(program: string, user: JwtPayload) {
  if (user.role === "admin") {
    // Admin sees complete ranking with all applicant data
    return db.query.admissionApplications.findMany({
      where: eq(admissionApplications.programAppliedFor, program),
      orderBy: [desc(admissionApplications.meritScore)],
    });
  }

  // Applicants can only view published merit lists
  const published = await db.query.admissionApplications.findMany({
    where: and(
      eq(admissionApplications.programAppliedFor, program),
      eq(admissionApplications.isMeritPublished, true)
    ),
    orderBy: [desc(admissionApplications.meritScore)],
  });

  // Data minimization: mask personal contact details (phone, full address) from public merit rank
  return published.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    programAppliedFor: p.programAppliedFor,
    meritScore: p.meritScore,
    meritRank: p.meritRank,
    isOwn: p.email.toLowerCase() === user.email.toLowerCase(),
  }));
}

// ==========================================
// APPROVAL & ENROLLMENT
// ==========================================

export async function approveApplication(
  applicationId: string,
  approver: JwtPayload,
  approvalNotes?: string,
  ip?: string
) {
  assertCanApprove(approver);

  const app = await db.query.admissionApplications.findFirst({
    where: eq(admissionApplications.id, applicationId),
  });

  if (!app) throw new Error("Application not found");

  validateStateTransition(app.status as ApplicationStatus, "approved");

  const now = new Date().toISOString();
  const [updated] = await db
    .update(admissionApplications)
    .set({
      status: "approved",
      approvedBy: approver.userId,
      approvalDate: now,
      updatedAt: now,
    })
    .where(eq(admissionApplications.id, applicationId))
    .returning();

  await logAdmissionsAudit({
    actor: approver,
    action: "APPLICATION_APPROVED",
    resourceType: "application",
    resourceId: applicationId,
    previousState: app.status,
    newState: "approved",
    details: approvalNotes || "Application approved by administrator",
    ipAddress: ip,
  });

  return updated;
}

export async function rejectApplication(
  applicationId: string,
  reason: string,
  approver: JwtPayload,
  ip?: string
) {
  assertCanApprove(approver);

  const app = await db.query.admissionApplications.findFirst({
    where: eq(admissionApplications.id, applicationId),
  });

  if (!app) throw new Error("Application not found");

  validateStateTransition(app.status as ApplicationStatus, "rejected");

  const now = new Date().toISOString();
  const [updated] = await db
    .update(admissionApplications)
    .set({
      status: "rejected",
      rejectionReason: reason,
      approvedBy: approver.userId,
      approvalDate: now,
      updatedAt: now,
    })
    .where(eq(admissionApplications.id, applicationId))
    .returning();

  await logAdmissionsAudit({
    actor: approver,
    action: "APPLICATION_REJECTED",
    resourceType: "application",
    resourceId: applicationId,
    previousState: app.status,
    newState: "rejected",
    details: `Reason: ${reason}`,
    ipAddress: ip,
  });

  return updated;
}

export async function enrollStudent(
  data: EnrollStudentInput,
  admin: JwtPayload,
  ip?: string
) {
  assertCanApprove(admin);

  const app = await db.query.admissionApplications.findFirst({
    where: eq(admissionApplications.id, data.applicationId),
  });

  if (!app) throw new Error("Application not found");

  // Workflow integrity check: can only enroll an APPROVED application!
  validateStateTransition(app.status as ApplicationStatus, "enrolled");

  const now = new Date().toISOString();
  const newUserId = generateId();
  const enrollmentId = generateId();
  const enrollmentNumber = generateEnrollmentNumber(data.program, data.batch);
  const passwordHash = await hashPassword(data.password);

  // 1. Create student user account
  await db.insert(users).values({
    id: newUserId,
    email: data.email.toLowerCase().trim(),
    passwordHash,
    role: "student",
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    isActive: true,
    failedLoginAttempts: 0,
    createdAt: now,
    updatedAt: now,
  });

  // 2. Create enrolled student record
  await db.insert(enrolledStudents).values({
    id: enrollmentId,
    userId: newUserId,
    applicationId: app.id,
    enrollmentNumber,
    enrollmentDate: now,
    program: data.program,
    batch: data.batch,
    rollNumber: data.rollNumber,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // 3. Mark application as enrolled
  await db
    .update(admissionApplications)
    .set({
      status: "enrolled",
      studentId: newUserId,
      updatedAt: now,
    })
    .where(eq(admissionApplications.id, app.id));

  await logAdmissionsAudit({
    actor: admin,
    action: "ENROLLMENT_CREATED",
    resourceType: "enrollment",
    resourceId: enrollmentId,
    previousState: "approved",
    newState: "enrolled",
    details: `Created enrollment ${enrollmentNumber} for roll ${data.rollNumber}`,
    ipAddress: ip,
  });

  return {
    userId: newUserId,
    enrollmentId,
    enrollmentNumber,
    rollNumber: data.rollNumber,
    program: data.program,
  };
}

export async function getAdmissionsMetrics(user: JwtPayload) {
  assertRole(user, ["admin"]);

  const allApps = await db.query.admissionApplications.findMany();
  const allEnquiries = await db.query.admissionEnquiries.findMany();

  const metrics = {
    totalEnquiries: allEnquiries.length,
    newEnquiries: allEnquiries.filter((e) => e.status === "new").length,
    totalApplications: allApps.length,
    draftApplications: allApps.filter((a) => a.status === "draft").length,
    submittedApplications: allApps.filter((a) => a.status === "submitted").length,
    underReviewApplications: allApps.filter((a) => a.status === "under_review").length,
    approvedApplications: allApps.filter((a) => a.status === "approved").length,
    rejectedApplications: allApps.filter((a) => a.status === "rejected").length,
    enrolledCount: allApps.filter((a) => a.status === "enrolled").length,
    conversionRate:
      allEnquiries.length > 0
        ? Math.round((allApps.filter((a) => a.status === "enrolled").length / allEnquiries.length) * 100)
        : 0,
  };

  return metrics;
}
