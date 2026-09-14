import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ===== CORE AUTH & AUDIT (team/auth) =====
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // "admin" | "teacher" | "student"
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  actorId: text("actor_id"),
  actorRole: text("actor_role"),
  action: text("action").notNull(), // e.g. APPLICATION_SUBMITTED, MARKS_RECORDED, etc.
  resourceType: text("resource_type"), // e.g. "application", "attendance", "grade"
  resourceId: text("resource_id"),
  previousState: text("previous_state"),
  newState: text("new_state"),
  details: text("details"),
  ipAddress: text("ip_address"),
  result: text("result").notNull().default("SUCCESS"), // "SUCCESS" | "DENIED" | "ERROR"
  timestamp: text("timestamp").notNull(),
});

// ===== MODULE 1: ADMISSIONS (Team 1) =====
export const admissionEnquiries = sqliteTable("admission_enquiries", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  interestedProgram: text("interested_program").notNull(),
  enquiryDate: text("enquiry_date").notNull(),
  status: text("status").notNull().default("new"), // "new" | "contacted" | "converted" | "closed"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const admissionApplications = sqliteTable("admission_applications", {
  id: text("id").primaryKey(),
  enquiryId: text("enquiry_id"),
  studentId: text("student_id"), // linked user ID once enrolled or applicant user ID
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  programAppliedFor: text("program_applied_for").notNull(),
  qualifications: text("qualifications").notNull(), // JSON serialized
  applicationDate: text("application_date").notNull(),
  status: text("status").notNull().default("draft"), // "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled"
  meritScore: real("merit_score"),
  meritRank: integer("merit_rank"),
  isMeritPublished: integer("is_merit_published", { mode: "boolean" }).notNull().default(false),
  approvedBy: text("approved_by"), // FK to users.id
  approvalDate: text("approval_date"),
  rejectionReason: text("rejection_reason"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const meritLists = sqliteTable("merit_lists", {
  id: text("id").primaryKey(),
  program: text("program").notNull(),
  academicYear: text("academic_year").notNull(),
  generatedBy: text("generated_by").notNull(),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const enrolledStudents = sqliteTable("enrolled_students", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  applicationId: text("application_id"),
  enrollmentNumber: text("enrollment_number").notNull().unique(),
  enrollmentDate: text("enrollment_date").notNull(),
  program: text("program").notNull(),
  batch: text("batch").notNull(),
  rollNumber: text("roll_number").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ===== MODULE 2: ACADEMIC (Team 1) =====
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  program: text("program").notNull(),
  semester: integer("semester").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const courseAssignments = sqliteTable("course_assignments", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  teacherId: text("teacher_id").notNull(),
  sectionCode: text("section_code").notNull(),
  academicYear: text("academic_year").notNull(),
  semester: integer("semester").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const studentEnrollments = sqliteTable("student_enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  sectionCode: text("section_code").notNull(),
  academicYear: text("academic_year").notNull(),
  semester: integer("semester").notNull(),
  enrollmentDate: text("enrollment_date").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const syllabi = sqliteTable("syllabi", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  subjectId: text("subject_id"),
  teacherId: text("teacher_id").notNull(),
  content: text("content").notNull(),
  objectives: text("objectives"),
  textbooks: text("textbooks"),
  assessmentMethod: text("assessment_method"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const timetables = sqliteTable("timetables", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  subjectId: text("subject_id"),
  teacherId: text("teacher_id").notNull(),
  sectionCode: text("section_code").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room").notNull(),
  academicYear: text("academic_year").notNull(),
  semester: integer("semester").notNull(),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const attendanceRecords = sqliteTable("attendance_records", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  classDate: text("class_date").notNull(),
  status: text("status").notNull().default("absent"), // "present" | "absent" | "leave"
  remarks: text("remarks"),
  recordedBy: text("recorded_by").notNull(),
  recordedAt: text("recorded_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const assessments = sqliteTable("assessments", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  teacherId: text("teacher_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull().default("assignment"), // "assignment" | "quiz" | "midterm" | "final"
  maxMarks: integer("max_marks").notNull(),
  weightage: integer("weightage").notNull().default(10),
  dueDate: text("due_date"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const internalMarks = sqliteTable("internal_marks", {
  id: text("id").primaryKey(),
  assessmentId: text("assessment_id"),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  assessmentType: text("assessment_type").notNull().default("assignment"), // "assignment" | "quiz" | "midterm" | "final"
  assessmentName: text("assessment_name").notNull(),
  maxMarks: integer("max_marks").notNull(),
  marksObtained: integer("marks_obtained").notNull(),
  grade: text("grade"), // "A+" | "A" | "B" | "C" | "F"
  feedbackNotes: text("feedback_notes"),
  recordedBy: text("recorded_by").notNull(),
  recordedAt: text("recorded_at").notNull(),
  status: text("status").notNull().default("draft"), // "draft" | "published"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
