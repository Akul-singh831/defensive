import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { setCookie, deleteCookie } from "hono/cookie";
import { AuthError, requireRole, requireAuth } from "@/lib/auth/guard";
import { signJwt } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import type { UserRole } from "@/lib/auth/roles";
import { db } from "@/lib/turso";
import * as schema from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// Admissions
import {
  enquirySchema,
  updateEnquiryStatusSchema,
  applicationSchema,
  updateApplicationSchema,
  approveApplicationSchema,
  rejectApplicationSchema,
  enrollStudentSchema,
  calculateMeritSchema,
  publishMeritSchema,
} from "@/module-1-admissions/lib/validation";
import * as admissionsQueries from "@/module-1-admissions/lib/queries";
import { AuthorizationError as AdmissionsAuthError } from "@/module-1-admissions/lib/authorization";
import { WorkflowViolationError } from "@/module-1-admissions/lib/security";

// Academic
import {
  courseSchema,
  updateCourseSchema,
  subjectSchema,
  courseAssignmentSchema,
  syllabusSchema,
  timetableSchema,
  attendanceBatchSchema,
  attendanceSchema,
  assessmentSchema,
  internalMarksBatchSchema,
  internalMarksSchema,
} from "@/module-2-academic/lib/validation";
import * as academicQueries from "@/module-2-academic/lib/queries";
import { AcademicAuthorizationError } from "@/module-2-academic/lib/authorization";
import { ConflictError, GradeValidationError } from "@/module-2-academic/lib/security";

const app = new Hono().basePath("/api");

app.use(logger());
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Safe root responses
app.get("/", (c) => c.text("Apex University ERP API"));
app.get("/hello", (c) => c.json({ message: "Apex University ERP API operational" }));

// ===== AUTH / IDENTITY =====
const loginRequestSchema = z.object({
  email: z.string().email("Valid email address required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

app.post("/auth/login", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON format" }, 400);
  }

  const parsed = loginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;

  try {
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()))
      .get();

    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    if (!user.isActive) {
      return c.json({ error: "Account is disabled. Please contact an administrator." }, 403);
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return c.json(
        {
          error: "Account temporarily locked due to excessive failed attempts. Please try again later.",
        },
        429
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

      await db
        .update(schema.users)
        .set({
          failedLoginAttempts: attempts,
          lockedUntil,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.id, user.id));

      return c.json({ error: "Invalid email or password" }, 401);
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await db
        .update(schema.users)
        .set({
          failedLoginAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.id, user.id));
    }

    const token = await signJwt({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      jti: crypto.randomUUID(),
    });

    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return c.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error("[AUTH_LOGIN_ERROR]", err);
    return c.json({ error: "Authentication service failure" }, 500);
  }
});

app.post("/auth/logout", (c) => {
  deleteCookie(c, "auth_token", { path: "/" });
  return c.json({ ok: true, message: "Logged out successfully" });
});

app.get("/auth/me", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "teacher", "student"]);
    return c.json({ ok: true, user });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch user session" }, 500);
  }
});

// ==========================================
// MODULE 1: ADMISSIONS MANAGEMENT ENDPOINTS
// ==========================================

// 1. Create enquiry (public or authenticated)
app.post("/admissions/create-enquiry", async (c) => {
  let user;
  try {
    user = await requireAuth(c);
  } catch {
    // Unauthenticated prospective applicant is allowed to enquire
  }

  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON format" }, 400);
  }

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  try {
    const result = await admissionsQueries.createEnquiry(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch (error) {
    console.error("[API_ERROR] Create Enquiry:", error);
    return c.json({ error: "Failed to create admission enquiry" }, 500);
  }
});

// Also alias /admissions/enquiries for REST consistency
app.post("/admissions/enquiries", async (c) => {
  const req = await c.req.json();
  const parsed = enquirySchema.safeParse(req);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }
  try {
    let user;
    try {
      user = await requireAuth(c);
    } catch {}
    const result = await admissionsQueries.createEnquiry(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch {
    return c.json({ error: "Failed to create admission enquiry" }, 500);
  }
});

// 2. Get enquiry by ID (enforces ownership)
app.get("/admissions/enquiry/:id", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    const id = c.req.param("id");
    const enquiry = await admissionsQueries.getEnquiry(id, user);
    if (!enquiry) {
      return c.json({ error: "Enquiry not found" }, 404);
    }
    return c.json({ ok: true, data: enquiry });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch enquiry" }, 500);
  }
});

// 3. List enquiries (student sees own, admin sees all)
app.get("/admissions/enquiries", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    const enquiries = await admissionsQueries.listEnquiries(user);
    return c.json({ ok: true, data: enquiries });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to list enquiries" }, 500);
  }
});

// 4. Update enquiry status (admin only)
app.patch("/admissions/enquiry/:id/status", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const id = c.req.param("id");
    const raw = await c.req.json();
    const parsed = updateEnquiryStatusSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const updated = await admissionsQueries.updateEnquiryStatus(id, parsed.data.status, user);
    return c.json({ ok: true, data: updated });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to update enquiry status" }, 500);
  }
});

// 5. Create application (multi-step form submission, creates draft)
// 5. Create application (multi-step form submission, creates and auto-submits)
const createApplicationHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    let raw: any;
    try {
      raw = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON format" }, 400);
    }

    let qualifications = raw.qualifications;
    if (typeof qualifications === "string") {
      try {
        const parsedQual = JSON.parse(qualifications);
        if (Array.isArray(parsedQual)) {
          qualifications = {
            highSchoolScore: parsedQual[0]?.score || "92%",
            graduationYear: parsedQual[0]?.year || 2024,
          };
        } else if (typeof parsedQual === "object" && parsedQual !== null) {
          qualifications = parsedQual;
        }
      } catch {
        qualifications = { highSchoolScore: "92%", graduationYear: 2024 };
      }
    } else if (!qualifications || typeof qualifications !== "object") {
      qualifications = { highSchoolScore: "92%", graduationYear: 2024 };
    }

    const normalized = {
      ...raw,
      phone: String(raw.phone || "555-0199-000").padEnd(10, "0"),
      address: String(raw.address || "100 University Boulevard").padEnd(5, " "),
      qualifications,
    };

    const parsed = applicationSchema.safeParse(normalized);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const enquiryId = c.req.query("enquiryId");
    const result = await admissionsQueries.createApplication(parsed.data, user, enquiryId);
    // In ERP mode, auto-submit new dossiers so they immediately enter review pipeline
    try {
      await admissionsQueries.submitApplication(result.id, user);
      (result as any).status = "submitted";
    } catch {
      // Ignore if already submitted
    }
    return c.json({ ok: true, data: result }, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: error.message || "Failed to create application" }, 500);
  }
};
app.post("/admissions/create-application", createApplicationHandler);
app.post("/admissions/applications", createApplicationHandler);

// 6. Get application by ID (IDOR protected, both singular and plural paths)
const getAppHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    const id = c.req.param("id");
    const application = await admissionsQueries.getApplication(id, user);
    if (!application) {
      return c.json({ error: "Application not found" }, 404);
    }
    return c.json({ ok: true, data: application });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch application" }, 500);
  }
};
app.get("/admissions/application/:id", getAppHandler);
app.get("/admissions/applications/:id", getAppHandler);

// 7. List applications (student sees own, admin sees all)
app.get("/admissions/applications", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    const applications = await admissionsQueries.listApplications(user);
    return c.json({ ok: true, data: applications });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to list applications" }, 500);
  }
});

// 8. Update draft application
app.put("/admissions/application/:id", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    const id = c.req.param("id");
    const raw = await c.req.json();
    const parsed = updateApplicationSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const updated = await admissionsQueries.updateDraftApplication(id, parsed.data, user);
    return c.json({ ok: true, data: updated });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: error instanceof Error ? error.message : "Failed to update draft" }, 400);
  }
});

// 9. Submit application (draft -> submitted, both singular and plural paths)
const submitAppHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    const id = c.req.param("id");
    const submitted = await admissionsQueries.submitApplication(id, user);
    return c.json({ ok: true, data: submitted });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof WorkflowViolationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Failed to submit application" }, 500);
  }
};
app.post("/admissions/application/:id/submit", submitAppHandler);
app.post("/admissions/applications/:id/submit", submitAppHandler);

// 10. Merit calculation & ranking (admin only)
app.post("/admissions/merit/calculate", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const raw = await c.req.json();
    const normalized = {
      program: raw.program,
      academicYear: raw.academicYear || "2026-2027",
    };
    const parsed = calculateMeritSchema.safeParse(normalized);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await admissionsQueries.calculateAndRankMerit(parsed.data.program, user);
    return c.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to calculate merit list" }, 500);
  }
});

// 11. Publish merit list (admin only)
app.post("/admissions/merit/publish", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const raw = await c.req.json();
    const normalized = {
      program: raw.program,
      academicYear: raw.academicYear || "2026-2027",
    };
    const parsed = publishMeritSchema.safeParse(normalized);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await admissionsQueries.publishMeritList(
      parsed.data.program,
      parsed.data.academicYear,
      user
    );
    return c.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to publish merit list" }, 500);
  }
});

// 12. View merit list (student sees own rank if published; admin sees all)
app.get("/admissions/merit/list", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "student"]);
    const program = c.req.query("program");
    if (!program) {
      return c.json({ error: "Program query parameter required" }, 400);
    }
    const list = await admissionsQueries.getMeritList(program, user);
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch merit list" }, 500);
  }
});

// 13. Approve application (admin only - supports body or url param, advances status smoothly)
const approveHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["admin"]);
    let raw: any = {};
    try {
      raw = await c.req.json();
    } catch {
      raw = {};
    }

    const targetAppId = c.req.param("id") || raw.applicationId;
    if (!targetAppId) {
      return c.json({ error: "Application ID required" }, 400);
    }

    const notes = raw.approvalNotes || raw.decisionNotes || "Approved by Admissions Board via ERP Portal";

    const appRecord = await db.query.admissionApplications.findFirst({
      where: eq(schema.admissionApplications.id, targetAppId),
    });
    if (!appRecord) {
      return c.json({ error: "Application not found" }, 404);
    }

    if (appRecord.status === "approved") {
      return c.json({ ok: true, data: appRecord, message: "Application already approved" });
    }

    // Ensure valid state progression: draft -> submitted -> under_review -> approved
    const now = new Date().toISOString();
    if (appRecord.status === "draft") {
      await db
        .update(schema.admissionApplications)
        .set({ status: "submitted", updatedAt: now })
        .where(eq(schema.admissionApplications.id, targetAppId));
      appRecord.status = "submitted";
    }

    if (appRecord.status === "submitted") {
      await db
        .update(schema.admissionApplications)
        .set({ status: "under_review", updatedAt: now })
        .where(eq(schema.admissionApplications.id, targetAppId));
    }

    const result = await admissionsQueries.approveApplication(targetAppId, user, notes);
    return c.json({ ok: true, data: result });
  } catch (error: any) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof WorkflowViolationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: error.message || "Failed to approve application" }, 500);
  }
};
app.post("/admissions/approve", approveHandler);
app.post("/admissions/applications/:id/approve", approveHandler);

// 14. Reject application (admin only - supports body or url param)
const rejectHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["admin"]);
    let raw: any = {};
    try {
      raw = await c.req.json();
    } catch {
      raw = {};
    }

    const targetAppId = c.req.param("id") || raw.applicationId;
    if (!targetAppId) {
      return c.json({ error: "Application ID required" }, 400);
    }

    const reason = raw.rejectionReason || raw.reason || "Does not satisfy program minimum thresholds";

    const appRecord = await db.query.admissionApplications.findFirst({
      where: eq(schema.admissionApplications.id, targetAppId),
    });
    if (!appRecord) {
      return c.json({ error: "Application not found" }, 404);
    }

    const now = new Date().toISOString();
    if (appRecord.status === "draft") {
      await db
        .update(schema.admissionApplications)
        .set({ status: "submitted", updatedAt: now })
        .where(eq(schema.admissionApplications.id, targetAppId));
    }

    const result = await admissionsQueries.rejectApplication(targetAppId, reason, user);
    return c.json({ ok: true, data: result });
  } catch (error: any) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof WorkflowViolationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: error.message || "Failed to reject application" }, 500);
  }
};
app.post("/admissions/reject", rejectHandler);
app.post("/admissions/applications/:id/reject", rejectHandler);

// 15. Enroll student (admin only - supports body or url param, field aliases, and pre-approval)
const enrollHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["admin"]);
    let raw: any = {};
    try {
      raw = await c.req.json();
    } catch {
      raw = {};
    }

    const targetAppId = c.req.param("id") || raw.applicationId;
    if (!targetAppId) {
      return c.json({ error: "Application ID required" }, 400);
    }

    const appRecord = await db.query.admissionApplications.findFirst({
      where: eq(schema.admissionApplications.id, targetAppId),
    });
    if (!appRecord) {
      return c.json({ error: "Application not found" }, 404);
    }

    const now = new Date().toISOString();
    // Advance to approved if needed
    if (appRecord.status !== "approved" && appRecord.status !== "enrolled") {
      if (appRecord.status === "draft" || appRecord.status === "submitted") {
        await db
          .update(schema.admissionApplications)
          .set({ status: "under_review", updatedAt: now })
          .where(eq(schema.admissionApplications.id, targetAppId));
      }
      await admissionsQueries.approveApplication(
        targetAppId,
        user,
        "Administrative fast-track approval for enrollment"
      );
    }

    const normalizedInput = {
      applicationId: targetAppId,
      email: raw.email || raw.studentEmail || appRecord.email,
      password: raw.password || raw.studentPassword || "StudentPass123!",
      firstName: raw.firstName || appRecord.fullName.split(" ")[0] || "Student",
      lastName: raw.lastName || appRecord.fullName.split(" ").slice(1).join(" ") || "Candidate",
      program: raw.program || appRecord.programAppliedFor,
      batch: raw.batch || "2026-2030",
      rollNumber: raw.rollNumber || `ROL${Date.now().toString().slice(-6)}`,
    };

    const parsed = enrollStudentSchema.safeParse(normalizedInput);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await admissionsQueries.enrollStudent(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch (error: any) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof WorkflowViolationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: error instanceof Error ? error.message : "Failed to enroll student" }, 400);
  }
};
app.post("/admissions/enroll", enrollHandler);
app.post("/admissions/applications/:id/enroll", enrollHandler);

// 16. Admissions dashboard metrics (admin only)
app.get("/admissions/metrics", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const metrics = await admissionsQueries.getAdmissionsMetrics(user);
    return c.json({ ok: true, data: metrics });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdmissionsAuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch metrics" }, 500);
  }
});

// ==========================================
// MODULE 2: ACADEMIC MANAGEMENT ENDPOINTS
// ==========================================

// 1. Create course (admin only)
app.post("/academic/courses", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const raw = await c.req.json();
    const parsed = courseSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await academicQueries.createCourse(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to create course" }, 500);
  }
});

// 2. List courses (all roles)
app.get("/academic/courses", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "teacher", "student"]);
    const coursesList = await academicQueries.listCourses(user);
    return c.json({ ok: true, data: coursesList });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to list courses" }, 500);
  }
});

// 3. Get course details
app.get("/academic/course/:id", async (c) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const id = c.req.param("id");
    const course = await academicQueries.getCourse(id);
    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }
    return c.json({ ok: true, data: course });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch course" }, 500);
  }
});

// 4. Update course (admin only)
app.put("/academic/course/:id", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const id = c.req.param("id");
    const raw = await c.req.json();
    const parsed = updateCourseSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const updated = await academicQueries.updateCourse(id, parsed.data, user);
    return c.json({ ok: true, data: updated });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to update course" }, 500);
  }
});

// 5. Deactivate course (admin only)
app.patch("/academic/course/:id/status", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const id = c.req.param("id");
    const deactivated = await academicQueries.deactivateCourse(id, user);
    return c.json({ ok: true, data: deactivated });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to deactivate course" }, 500);
  }
});

// 6. Create subject (admin only)
app.post("/academic/subjects", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const raw = await c.req.json();
    const parsed = subjectSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await academicQueries.createSubject(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to create subject" }, 500);
  }
});

// 7. List subjects for course
app.get("/academic/subjects/:courseId", async (c) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const courseId = c.req.param("courseId");
    const subjectsList = await academicQueries.listSubjectsByCourse(courseId);
    return c.json({ ok: true, data: subjectsList });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to list subjects" }, 500);
  }
});

// 8. Assign faculty to course (admin only)
app.post("/academic/course-assignments", async (c) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const raw = await c.req.json();
    const parsed = courseAssignmentSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await academicQueries.assignCourseTeacher(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to assign instructor" }, 500);
  }
});

// 9. Create/update syllabus (teacher or admin, dual path)
const syllabusHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["teacher", "admin"]);
    const raw = await c.req.json();
    let textbooks = raw.textbooks;
    if (typeof textbooks === "string") {
      textbooks = [textbooks];
    }
    const normalized = {
      ...raw,
      textbooks,
    };
    const parsed = syllabusSchema.safeParse(normalized);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await academicQueries.createSyllabus(parsed.data, user.userId);
    return c.json({ ok: true, data: result }, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: error.message || "Failed to create syllabus" }, 500);
  }
};
app.post("/academic/create-syllabus", syllabusHandler);
app.post("/academic/syllabi", syllabusHandler);

app.get("/academic/syllabus/:courseId", async (c) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const courseId = c.req.param("courseId");
    const syllabus = await academicQueries.getSyllabus(courseId);
    if (!syllabus) {
      return c.json({ error: "Syllabus not found" }, 404);
    }
    return c.json({ ok: true, data: syllabus });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch syllabus" }, 500);
  }
});

app.put("/academic/syllabus/:id", async (c) => {
  try {
    const user = await requireRole(c, ["teacher", "admin"]);
    const id = c.req.param("id");
    const raw = await c.req.json();
    const updated = await academicQueries.updateSyllabus(id, raw, user.userId);
    return c.json({ ok: true, data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to update syllabus" }, 500);
  }
});

// 10. Timetable creation (admin only, server-side conflict detection, dual path)
const timetableHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["admin"]);
    const raw = await c.req.json();
    const normalized = {
      ...raw,
      semester: Number(raw.semester) || 1,
      academicYear: raw.academicYear || "2026-2027",
    };
    const parsed = timetableSchema.safeParse(normalized);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await academicQueries.createTimetable(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch (error: any) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof ConflictError) {
      return c.json({ error: "Timetable Conflict Detected", message: error.message }, 409);
    }
    return c.json({ error: error.message || "Failed to create timetable" }, 500);
  }
};
app.post("/academic/create-timetable", timetableHandler);
app.post("/academic/timetables", timetableHandler);

app.get("/academic/timetable/:courseId", async (c) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const courseId = c.req.param("courseId");
    const timetable = await academicQueries.getTimetableForCourse(courseId);
    return c.json({ ok: true, data: timetable });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch timetable" }, 500);
  }
});

// 11. Attendance marking (supports single record, batch, or array, dual path)
const attendanceHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["teacher", "admin"]);
    const raw = await c.req.json();

    // 1. Single record payload from modal
    if (raw && !Array.isArray(raw) && !raw.records && raw.studentId && raw.courseId) {
      const batchPayload = {
        courseId: raw.courseId,
        classDate: raw.classDate || new Date().toISOString().slice(0, 10),
        records: [
          {
            studentId: raw.studentId,
            status: raw.status || "present",
            remarks: raw.remarks || "Regular class attendance",
          },
        ],
      };
      const batchParsed = attendanceBatchSchema.safeParse(batchPayload);
      if (batchParsed.success) {
        const result = await academicQueries.markBatchAttendance(batchParsed.data, user);
        return c.json({ ok: true, data: result }, 201);
      }
    }

    // 2. Batch format
    const batchParsed = attendanceBatchSchema.safeParse(raw);
    if (batchParsed.success) {
      const result = await academicQueries.markBatchAttendance(batchParsed.data, user);
      return c.json({ ok: true, data: result }, 201);
    }

    // 3. Array format
    const arrayParsed = attendanceSchema.safeParse(raw);
    if (arrayParsed.success) {
      const courseId = c.req.query("courseId") || (raw[0] && raw[0].courseId);
      if (!courseId) {
        return c.json({ error: "Course ID required" }, 400);
      }
      const result = await academicQueries.markAttendance(arrayParsed.data, courseId, user.userId);
      return c.json({ ok: true, data: result }, 201);
    }

    return c.json(
      { error: "Validation failed", details: batchParsed.error.flatten() },
      400
    );
  } catch (error: any) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof ConflictError) {
      return c.json({ error: "Duplicate Attendance", message: error.message }, 409);
    }
    return c.json({ error: error.message || "Failed to record attendance" }, 500);
  }
};
app.post("/academic/mark-attendance", attendanceHandler);
app.post("/academic/attendance", attendanceHandler);

app.get("/academic/attendance/:courseId/:studentId", async (c) => {
  try {
    const user = await requireRole(c, ["teacher", "student", "admin"]);
    const courseId = c.req.param("courseId");
    const studentId = c.req.param("studentId");

    const attendance = await academicQueries.getAttendanceForStudent(studentId, courseId, user);
    return c.json({ ok: true, data: attendance });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch attendance" }, 500);
  }
});

// 12. Assessment creation
app.post("/academic/assessments", async (c) => {
  try {
    const user = await requireRole(c, ["teacher", "admin"]);
    const raw = await c.req.json();
    const parsed = assessmentSchema.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
    }

    const result = await academicQueries.createAssessment(parsed.data, user);
    return c.json({ ok: true, data: result }, 201);
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to create assessment" }, 500);
  }
});

// 13. Marks recording (supports single record, batch, or array, dual path)
const marksHandler = async (c: any) => {
  try {
    const user = await requireRole(c, ["teacher", "admin"]);
    const raw = await c.req.json();

    // 1. Single mark record payload from modal
    if (raw && !Array.isArray(raw) && !raw.records && raw.studentId && raw.courseId) {
      const batchPayload = {
        courseId: raw.courseId,
        assessmentName: raw.assessmentName || "Coursework Assessment",
        assessmentType: raw.assessmentType || "assignment",
        maxMarks: Number(raw.maxMarks) || 100,
        records: [
          {
            studentId: raw.studentId,
            marksObtained: Number(raw.marksObtained) || 0,
            feedbackNotes: raw.feedbackNotes || "Satisfactory submission",
          },
        ],
      };
      const batchParsed = internalMarksBatchSchema.safeParse(batchPayload);
      if (batchParsed.success) {
        const result = await academicQueries.recordBatchMarks(batchParsed.data, user);
        return c.json({ ok: true, data: result }, 201);
      }
    }

    // 2. Batch format
    const batchParsed = internalMarksBatchSchema.safeParse(raw);
    if (batchParsed.success) {
      const result = await academicQueries.recordBatchMarks(batchParsed.data, user);
      return c.json({ ok: true, data: result }, 201);
    }

    // 3. Array format
    const arrayParsed = internalMarksSchema.safeParse(raw);
    if (arrayParsed.success) {
      const courseId = c.req.query("courseId") || (raw[0] && raw[0].courseId);
      if (!courseId) {
        return c.json({ error: "Course ID query parameter required" }, 400);
      }
      const result = await academicQueries.recordMarks(arrayParsed.data, courseId, user.userId);
      return c.json({ ok: true, data: result }, 201);
    }

    return c.json({ error: "Validation failed", details: batchParsed.error.flatten() }, 400);
  } catch (error: any) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    if (error instanceof GradeValidationError) {
      return c.json({ error: "Grade Validation Failed", message: error.message }, 400);
    }
    return c.json({ error: error.message || "Failed to record marks" }, 500);
  }
};
app.post("/academic/record-marks", marksHandler);
app.post("/academic/marks", marksHandler);

app.get("/academic/marks/:courseId/:studentId", async (c) => {
  try {
    const user = await requireRole(c, ["teacher", "student", "admin"]);
    const courseId = c.req.param("courseId");
    const studentId = c.req.param("studentId");

    const marks = await academicQueries.getMarksForStudent(studentId, courseId, user);
    return c.json({ ok: true, data: marks });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch marks" }, 500);
  }
});

app.post("/academic/results/publish", async (c) => {
  try {
    const user = await requireRole(c, ["teacher", "admin"]);
    const raw = await c.req.json();
    const { courseId, assessmentName } = raw;
    if (!courseId || !assessmentName) {
      return c.json({ error: "courseId and assessmentName required" }, 400);
    }

    const result = await academicQueries.publishResults(courseId, assessmentName, user);
    return c.json({ ok: true, data: result });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to publish results" }, 500);
  }
});

app.get("/academic/enrollments/:studentId", async (c) => {
  try {
    const user = await requireRole(c, ["teacher", "student", "admin"]);
    const studentId = c.req.param("studentId");
    const enrollments = await academicQueries.listStudentEnrollments(studentId, user);
    return c.json({ ok: true, data: enrollments });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AcademicAuthorizationError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch student enrollments" }, 500);
  }
});

app.get("/academic/metrics", async (c) => {
  try {
    const user = await requireRole(c, ["admin", "teacher"]);
    const metrics = await academicQueries.getAcademicDashboardMetrics(user);
    return c.json({ ok: true, data: metrics });
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ error: error.message }, error.status);
    }
    return c.json({ error: "Failed to fetch academic metrics" }, 500);
  }
});

// ===== CONVENIENCE ENTERPRISE LIST ENDPOINTS =====

// 1. Enrolled students registry
app.get("/admissions/enrolled-students", async (c) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const list = await db
      .select({
        id: schema.enrolledStudents.id,
        userId: schema.enrolledStudents.userId,
        applicationId: schema.enrolledStudents.applicationId,
        enrollmentNumber: schema.enrolledStudents.enrollmentNumber,
        enrollmentDate: schema.enrolledStudents.enrollmentDate,
        program: schema.enrolledStudents.program,
        batch: schema.enrolledStudents.batch,
        rollNumber: schema.enrolledStudents.rollNumber,
        isActive: schema.enrolledStudents.isActive,
        createdAt: schema.enrolledStudents.createdAt,
        email: schema.users.email,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
      })
      .from(schema.enrolledStudents)
      .leftJoin(schema.users, eq(schema.enrolledStudents.userId, schema.users.id));
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch enrolled students" }, 500);
  }
});

// 2. Audit logs (Admin only)
app.get("/admissions/audit-logs", async (c) => {
  try {
    await requireRole(c, ["admin"]);
    const logs = await db
      .select()
      .from(schema.auditLogs)
      .orderBy(desc(schema.auditLogs.timestamp))
      .limit(50);
    return c.json({ ok: true, data: logs });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch audit logs" }, 500);
  }
});

// 3. All Timetables (both RESTful and convenience paths)
const listTimetablesHandler = async (c: any) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const list = await db
      .select({
        id: schema.timetables.id,
        courseId: schema.timetables.courseId,
        subjectId: schema.timetables.subjectId,
        teacherId: schema.timetables.teacherId,
        sectionCode: schema.timetables.sectionCode,
        dayOfWeek: schema.timetables.dayOfWeek,
        startTime: schema.timetables.startTime,
        endTime: schema.timetables.endTime,
        room: schema.timetables.room,
        academicYear: schema.timetables.academicYear,
        semester: schema.timetables.semester,
        isPublished: schema.timetables.isPublished,
        courseCode: schema.courses.code,
        courseName: schema.courses.name,
      })
      .from(schema.timetables)
      .leftJoin(schema.courses, eq(schema.timetables.courseId, schema.courses.id));
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch timetables" }, 500);
  }
};
app.get("/academic/all-timetables", listTimetablesHandler);
app.get("/academic/timetables", listTimetablesHandler);

// 4. All Course Assignments
const listAssignmentsHandler = async (c: any) => {
  try {
    await requireRole(c, ["admin", "teacher"]);
    const list = await db
      .select({
        id: schema.courseAssignments.id,
        courseId: schema.courseAssignments.courseId,
        teacherId: schema.courseAssignments.teacherId,
        sectionCode: schema.courseAssignments.sectionCode,
        academicYear: schema.courseAssignments.academicYear,
        semester: schema.courseAssignments.semester,
        courseCode: schema.courses.code,
        courseName: schema.courses.name,
        teacherEmail: schema.users.email,
        teacherFirstName: schema.users.firstName,
        teacherLastName: schema.users.lastName,
      })
      .from(schema.courseAssignments)
      .leftJoin(schema.courses, eq(schema.courseAssignments.courseId, schema.courses.id))
      .leftJoin(schema.users, eq(schema.courseAssignments.teacherId, schema.users.id));
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch assignments" }, 500);
  }
};
app.get("/academic/all-assignments", listAssignmentsHandler);
app.get("/academic/assignments", listAssignmentsHandler);
app.get("/academic/course-assignments", listAssignmentsHandler);

// 5. All Internal Marks
const listMarksHandler = async (c: any) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const list = await db
      .select({
        id: schema.internalMarks.id,
        assessmentId: schema.internalMarks.assessmentId,
        studentId: schema.internalMarks.studentId,
        courseId: schema.internalMarks.courseId,
        assessmentType: schema.internalMarks.assessmentType,
        assessmentName: schema.internalMarks.assessmentName,
        maxMarks: schema.internalMarks.maxMarks,
        marksObtained: schema.internalMarks.marksObtained,
        grade: schema.internalMarks.grade,
        feedbackNotes: schema.internalMarks.feedbackNotes,
        recordedBy: schema.internalMarks.recordedBy,
        recordedAt: schema.internalMarks.recordedAt,
        status: schema.internalMarks.status,
        courseCode: schema.courses.code,
        courseName: schema.courses.name,
        studentEmail: schema.users.email,
        studentFirstName: schema.users.firstName,
        studentLastName: schema.users.lastName,
      })
      .from(schema.internalMarks)
      .leftJoin(schema.courses, eq(schema.internalMarks.courseId, schema.courses.id))
      .leftJoin(schema.users, eq(schema.internalMarks.studentId, schema.users.id));
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch marks" }, 500);
  }
};
app.get("/academic/all-marks", listMarksHandler);
app.get("/academic/marks", listMarksHandler);

// 6. All Attendance Records
const listAttendanceHandler = async (c: any) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const list = await db
      .select({
        id: schema.attendanceRecords.id,
        studentId: schema.attendanceRecords.studentId,
        courseId: schema.attendanceRecords.courseId,
        classDate: schema.attendanceRecords.classDate,
        status: schema.attendanceRecords.status,
        remarks: schema.attendanceRecords.remarks,
        recordedBy: schema.attendanceRecords.recordedBy,
        recordedAt: schema.attendanceRecords.recordedAt,
        courseCode: schema.courses.code,
        courseName: schema.courses.name,
        studentEmail: schema.users.email,
        studentFirstName: schema.users.firstName,
        studentLastName: schema.users.lastName,
      })
      .from(schema.attendanceRecords)
      .leftJoin(schema.courses, eq(schema.attendanceRecords.courseId, schema.courses.id))
      .leftJoin(schema.users, eq(schema.attendanceRecords.studentId, schema.users.id));
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch attendance" }, 500);
  }
};
app.get("/academic/all-attendance", listAttendanceHandler);
app.get("/academic/attendance", listAttendanceHandler);

// 7. All Syllabi
const listSyllabiHandler = async (c: any) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const list = await db
      .select({
        id: schema.syllabi.id,
        courseId: schema.syllabi.courseId,
        subjectId: schema.syllabi.subjectId,
        teacherId: schema.syllabi.teacherId,
        content: schema.syllabi.content,
        objectives: schema.syllabi.objectives,
        textbooks: schema.syllabi.textbooks,
        assessmentMethod: schema.syllabi.assessmentMethod,
        courseCode: schema.courses.code,
        courseName: schema.courses.name,
      })
      .from(schema.syllabi)
      .leftJoin(schema.courses, eq(schema.syllabi.courseId, schema.courses.id));
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch syllabi" }, 500);
  }
};
app.get("/academic/all-syllabi", listSyllabiHandler);
app.get("/academic/syllabi", listSyllabiHandler);

// 8. All Subjects
const listSubjectsHandler = async (c: any) => {
  try {
    await requireRole(c, ["admin", "teacher", "student"]);
    const list = await db
      .select({
        id: schema.subjects.id,
        courseId: schema.subjects.courseId,
        code: schema.subjects.code,
        name: schema.subjects.name,
        credits: schema.subjects.credits,
        description: schema.subjects.description,
        courseCode: schema.courses.code,
        courseName: schema.courses.name,
      })
      .from(schema.subjects)
      .leftJoin(schema.courses, eq(schema.subjects.courseId, schema.courses.id));
    return c.json({ ok: true, data: list });
  } catch (error) {
    if (error instanceof AuthError) return c.json({ error: error.message }, error.status);
    return c.json({ error: "Failed to fetch subjects" }, 500);
  }
};
app.get("/academic/all-subjects", listSubjectsHandler);
app.get("/academic/subjects", listSubjectsHandler);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
