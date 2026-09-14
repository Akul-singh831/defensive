import { db } from "@/lib/turso";
import {
  courses,
  subjects,
  courseAssignments,
  studentEnrollments,
  syllabi,
  timetables,
  attendanceRecords,
  assessments,
  internalMarks,
  users,
} from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/lib/id";
import type { JwtPayload } from "@/lib/auth/jwt";
import type {
  CourseInput,
  UpdateCourseInput,
  SubjectInput,
  CourseAssignmentInput,
  SyllabusInput,
  TimetableInput,
  AttendanceBatchInput,
  AttendanceInput,
  AssessmentInput,
  InternalMarksBatchInput,
  InternalMarksInput,
} from "../validation";
import {
  assertAcademicRole,
  assertFacultyCourseOwnership,
  assertStudentSelfAccess,
  AcademicAuthorizationError,
} from "../authorization";
import {
  assertNoTimetableConflicts,
  validateGradeBoundaries,
  calculateLetterGrade,
  assertNoDuplicateAttendance,
  analyzeAcademicRisk,
} from "../security";
import { logAcademicAudit } from "../audit";
import { calculateGradeStatistics, calculateAttendancePercentage } from "../services";

// ==========================================
// COURSES & SUBJECTS
// ==========================================

export async function createCourse(data: CourseInput, user: JwtPayload, ip?: string) {
  assertAcademicRole(user, ["admin"]);

  const id = generateId();
  const now = new Date().toISOString();

  const newCourse = {
    id,
    code: data.code.toUpperCase().trim(),
    name: data.name.trim(),
    credits: data.credits,
    program: data.program.trim(),
    semester: data.semester,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const [inserted] = await db.insert(courses).values(newCourse).returning();

  await logAcademicAudit({
    actor: user,
    action: "COURSE_CREATED",
    resourceType: "course",
    resourceId: id,
    newState: "active",
    details: `Course ${data.code} (${data.name}) created`,
    ipAddress: ip,
  });

  return inserted;
}

export async function listCourses(user: JwtPayload) {
  if (user.role === "student") {
    // Active courses only for students
    return db.query.courses.findMany({
      where: eq(courses.isActive, true),
      orderBy: [desc(courses.createdAt)],
    });
  }

  // Admin & Teacher see all
  return db.query.courses.findMany({
    orderBy: [desc(courses.createdAt)],
  });
}

export async function getCourse(id: string) {
  return db.query.courses.findFirst({
    where: eq(courses.id, id),
  });
}

export async function updateCourse(
  id: string,
  data: UpdateCourseInput,
  user: JwtPayload,
  ip?: string
) {
  assertAcademicRole(user, ["admin"]);

  const existing = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });

  if (!existing) throw new Error("Course not found");

  const now = new Date().toISOString();
  const [updated] = await db
    .update(courses)
    .set({
      name: data.name?.trim() || existing.name,
      credits: data.credits ?? existing.credits,
      program: data.program?.trim() || existing.program,
      semester: data.semester ?? existing.semester,
      isActive: data.isActive ?? existing.isActive,
      updatedAt: now,
    })
    .where(eq(courses.id, id))
    .returning();

  await logAcademicAudit({
    actor: user,
    action: "COURSE_UPDATED",
    resourceType: "course",
    resourceId: id,
    ipAddress: ip,
  });

  return updated;
}

export async function deactivateCourse(id: string, user: JwtPayload, ip?: string) {
  assertAcademicRole(user, ["admin"]);

  const now = new Date().toISOString();
  const [updated] = await db
    .update(courses)
    .set({
      isActive: false,
      updatedAt: now,
    })
    .where(eq(courses.id, id))
    .returning();

  await logAcademicAudit({
    actor: user,
    action: "COURSE_DEACTIVATED",
    resourceType: "course",
    resourceId: id,
    previousState: "active",
    newState: "inactive",
    ipAddress: ip,
  });

  return updated;
}

export async function createSubject(data: SubjectInput, user: JwtPayload, ip?: string) {
  assertAcademicRole(user, ["admin"]);

  const id = generateId();
  const now = new Date().toISOString();

  const [inserted] = await db
    .insert(subjects)
    .values({
      id,
      courseId: data.courseId,
      code: data.code.toUpperCase().trim(),
      name: data.name.trim(),
      credits: data.credits,
      description: data.description?.trim() || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await logAcademicAudit({
    actor: user,
    action: "SUBJECT_CREATED",
    resourceType: "subject",
    resourceId: id,
    ipAddress: ip,
  });

  return inserted;
}

export async function listSubjectsByCourse(courseId: string) {
  return db.query.subjects.findMany({
    where: eq(subjects.courseId, courseId),
  });
}

// ==========================================
// COURSE ASSIGNMENTS
// ==========================================

export async function assignCourseTeacher(
  data: CourseAssignmentInput,
  user: JwtPayload,
  ip?: string
) {
  assertAcademicRole(user, ["admin"]);

  const id = generateId();
  const now = new Date().toISOString();

  const [inserted] = await db
    .insert(courseAssignments)
    .values({
      id,
      courseId: data.courseId,
      teacherId: data.teacherId,
      sectionCode: data.sectionCode.toUpperCase().trim(),
      academicYear: data.academicYear.trim(),
      semester: data.semester,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await logAcademicAudit({
    actor: user,
    action: "FACULTY_ASSIGNED",
    resourceType: "course_assignment",
    resourceId: id,
    details: `Teacher ${data.teacherId} assigned to course ${data.courseId} section ${data.sectionCode}`,
    ipAddress: ip,
  });

  return inserted;
}

// ==========================================
// SYLLABUS
// ==========================================

export async function createSyllabus(data: SyllabusInput, teacherId: string, ip?: string) {
  const id = generateId();
  const now = new Date().toISOString();

  const [inserted] = await db
    .insert(syllabi)
    .values({
      id,
      courseId: data.courseId,
      subjectId: data.subjectId || null,
      teacherId,
      content: data.content,
      objectives: data.objectives || null,
      textbooks: data.textbooks ? JSON.stringify(data.textbooks) : null,
      assessmentMethod: data.assessmentMethod || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await logAcademicAudit({
    actor: { userId: teacherId, role: "teacher" },
    action: "SYLLABUS_CREATED",
    resourceType: "syllabus",
    resourceId: id,
    details: `Syllabus created for course ${data.courseId}`,
    ipAddress: ip,
  });

  return inserted;
}

export async function getSyllabus(courseId: string) {
  return db.query.syllabi.findFirst({
    where: eq(syllabi.courseId, courseId),
  });
}

export async function updateSyllabus(
  id: string,
  data: Partial<SyllabusInput>,
  teacherId: string,
  ip?: string
) {
  const existing = await db.query.syllabi.findFirst({
    where: eq(syllabi.id, id),
  });

  if (!existing) throw new Error("Syllabus not found");

  const now = new Date().toISOString();
  const [updated] = await db
    .update(syllabi)
    .set({
      content: data.content || existing.content,
      objectives: data.objectives !== undefined ? data.objectives : existing.objectives,
      textbooks: data.textbooks ? JSON.stringify(data.textbooks) : existing.textbooks,
      assessmentMethod: data.assessmentMethod || existing.assessmentMethod,
      updatedAt: now,
    })
    .where(eq(syllabi.id, id))
    .returning();

  await logAcademicAudit({
    actor: { userId: teacherId, role: "teacher" },
    action: "SYLLABUS_UPDATED",
    resourceType: "syllabus",
    resourceId: id,
    ipAddress: ip,
  });

  return updated;
}

// ==========================================
// TIMETABLE & CONFLICT DETECTION
// ==========================================

export async function createTimetable(data: TimetableInput, user: JwtPayload, ip?: string) {
  assertAcademicRole(user, ["admin"]);

  // Server-side conflict detection engine (Section 17)
  await assertNoTimetableConflicts({
    courseId: data.courseId,
    teacherId: data.teacherId,
    room: data.room,
    sectionCode: data.sectionCode,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    academicYear: data.academicYear,
  });

  const id = generateId();
  const now = new Date().toISOString();

  const [inserted] = await db
    .insert(timetables)
    .values({
      id,
      courseId: data.courseId,
      subjectId: data.subjectId || null,
      teacherId: data.teacherId,
      sectionCode: data.sectionCode.toUpperCase().trim(),
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room.trim(),
      academicYear: data.academicYear.trim(),
      semester: data.semester,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await logAcademicAudit({
    actor: user,
    action: "TIMETABLE_CREATED",
    resourceType: "timetable",
    resourceId: id,
    details: `Slot created: ${data.dayOfWeek} ${data.startTime}-${data.endTime} Room ${data.room}`,
    ipAddress: ip,
  });

  return inserted;
}

export async function getTimetableForCourse(courseId: string) {
  return db.query.timetables.findMany({
    where: eq(timetables.courseId, courseId),
  });
}

// ==========================================
// ATTENDANCE MANAGEMENT
// ==========================================

export async function markBatchAttendance(
  batch: AttendanceBatchInput,
  user: JwtPayload,
  ip?: string
) {
  // Faculty ownership isolation check (Section 13)
  await assertFacultyCourseOwnership(user, batch.courseId);

  const now = new Date().toISOString();
  const insertedRecords = [];

  for (const item of batch.records) {
    // Assert no duplicate attendance on same date (Section 16)
    await assertNoDuplicateAttendance(item.studentId, batch.courseId, batch.classDate);

    const id = generateId();
    const [record] = await db
      .insert(attendanceRecords)
      .values({
        id,
        studentId: item.studentId,
        courseId: batch.courseId,
        classDate: batch.classDate,
        status: item.status,
        remarks: item.remarks || null,
        recordedBy: user.userId,
        recordedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    insertedRecords.push(record);
  }

  await logAcademicAudit({
    actor: user,
    action: "ATTENDANCE_RECORDED",
    resourceType: "attendance",
    details: `Recorded attendance for ${batch.records.length} students in course ${batch.courseId} on ${batch.classDate}`,
    ipAddress: ip,
  });

  return insertedRecords;
}

// Backwards-compatible signature for single array of records
export async function markAttendance(
  records: AttendanceInput,
  courseId: string,
  teacherId: string,
  ip?: string
) {
  const user = { userId: teacherId, role: "teacher", email: "" } as JwtPayload;
  await assertFacultyCourseOwnership(user, courseId);

  const now = new Date().toISOString();
  const inserted = [];

  for (const item of records) {
    await assertNoDuplicateAttendance(item.studentId, courseId, item.classDate);
    const id = generateId();
    const [rec] = await db
      .insert(attendanceRecords)
      .values({
        id,
        studentId: item.studentId,
        courseId,
        classDate: item.classDate,
        status: item.status,
        remarks: item.remarks || null,
        recordedBy: teacherId,
        recordedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    inserted.push(rec);
  }

  await logAcademicAudit({
    actor: user,
    action: "ATTENDANCE_RECORDED",
    resourceType: "attendance",
    details: `Marked attendance for ${records.length} students in ${courseId}`,
    ipAddress: ip,
  });

  return inserted;
}

export async function getAttendanceForStudent(
  studentId: string,
  courseId: string,
  user: JwtPayload
) {
  // Student IDOR Protection (Section 14)
  assertStudentSelfAccess(user, studentId);

  return db.query.attendanceRecords.findMany({
    where: and(
      eq(attendanceRecords.studentId, studentId),
      eq(attendanceRecords.courseId, courseId)
    ),
    orderBy: [desc(attendanceRecords.classDate)],
  });
}

// ==========================================
// ASSESSMENTS & GRADES
// ==========================================

export async function createAssessment(data: AssessmentInput, user: JwtPayload, ip?: string) {
  await assertFacultyCourseOwnership(user, data.courseId);

  const id = generateId();
  const now = new Date().toISOString();

  const [inserted] = await db
    .insert(assessments)
    .values({
      id,
      courseId: data.courseId,
      teacherId: user.userId,
      title: data.title.trim(),
      type: data.type,
      maxMarks: data.maxMarks,
      weightage: data.weightage,
      dueDate: data.dueDate || null,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await logAcademicAudit({
    actor: user,
    action: "ASSESSMENT_CREATED",
    resourceType: "assessment",
    resourceId: id,
    details: `Assessment '${data.title}' created with max marks ${data.maxMarks}`,
    ipAddress: ip,
  });

  return inserted;
}

export async function recordBatchMarks(
  batch: InternalMarksBatchInput,
  user: JwtPayload,
  ip?: string
) {
  // Faculty ownership isolation check (Section 13)
  await assertFacultyCourseOwnership(user, batch.courseId);

  const now = new Date().toISOString();
  const recordedList = [];

  for (const item of batch.records) {
    // Grade integrity & tampering check (Section 15)
    validateGradeBoundaries(item.marksObtained, batch.maxMarks);

    const letterGrade = calculateLetterGrade(item.marksObtained, batch.maxMarks);
    const id = generateId();

    const [rec] = await db
      .insert(internalMarks)
      .values({
        id,
        assessmentId: batch.assessmentId || null,
        studentId: item.studentId,
        courseId: batch.courseId,
        assessmentType: batch.assessmentType,
        assessmentName: batch.assessmentName.trim(),
        maxMarks: batch.maxMarks,
        marksObtained: item.marksObtained,
        grade: letterGrade,
        feedbackNotes: item.feedbackNotes || null,
        recordedBy: user.userId,
        recordedAt: now,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    recordedList.push(rec);
  }

  await logAcademicAudit({
    actor: user,
    action: "MARKS_RECORDED",
    resourceType: "grade",
    details: `Recorded marks for ${batch.records.length} students in assessment '${batch.assessmentName}'`,
    ipAddress: ip,
  });

  return recordedList;
}

// Backwards-compatible signature for recordMarks
export async function recordMarks(
  records: InternalMarksInput,
  courseId: string,
  teacherId: string,
  ip?: string
) {
  const user = { userId: teacherId, role: "teacher", email: "" } as JwtPayload;
  await assertFacultyCourseOwnership(user, courseId);

  const now = new Date().toISOString();
  const inserted = [];

  for (const item of records) {
    validateGradeBoundaries(item.marksObtained, item.maxMarks);
    const letterGrade = calculateLetterGrade(item.marksObtained, item.maxMarks);
    const id = generateId();

    const [rec] = await db
      .insert(internalMarks)
      .values({
        id,
        studentId: item.studentId,
        courseId,
        assessmentType: item.assessmentType,
        assessmentName: item.assessmentName,
        maxMarks: item.maxMarks,
        marksObtained: item.marksObtained,
        grade: letterGrade,
        feedbackNotes: item.feedbackNotes || null,
        recordedBy: teacherId,
        recordedAt: now,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    inserted.push(rec);
  }

  await logAcademicAudit({
    actor: user,
    action: "MARKS_RECORDED",
    resourceType: "grade",
    details: `Recorded marks for ${records.length} students in ${courseId}`,
    ipAddress: ip,
  });

  return inserted;
}

export async function getMarksForStudent(
  studentId: string,
  courseId: string,
  user: JwtPayload
) {
  // Student IDOR Protection (Section 14)
  assertStudentSelfAccess(user, studentId);

  return db.query.internalMarks.findMany({
    where: and(
      eq(internalMarks.studentId, studentId),
      eq(internalMarks.courseId, courseId)
    ),
    orderBy: [desc(internalMarks.recordedAt)],
  });
}

export async function publishResults(
  courseId: string,
  assessmentName: string,
  user: JwtPayload,
  ip?: string
) {
  await assertFacultyCourseOwnership(user, courseId);

  const now = new Date().toISOString();
  await db
    .update(internalMarks)
    .set({
      status: "published",
      updatedAt: now,
    })
    .where(
      and(
        eq(internalMarks.courseId, courseId),
        eq(internalMarks.assessmentName, assessmentName)
      )
    );

  await logAcademicAudit({
    actor: user,
    action: "RESULT_PUBLISHED",
    resourceType: "grade",
    details: `Published results for '${assessmentName}' in course ${courseId}`,
    ipAddress: ip,
  });

  return { ok: true, message: `Results for ${assessmentName} published successfully` };
}

export async function listStudentEnrollments(studentId: string, user: JwtPayload) {
  assertStudentSelfAccess(user, studentId);

  return db.query.studentEnrollments.findMany({
    where: eq(studentEnrollments.studentId, studentId),
  });
}

export async function getAcademicDashboardMetrics(user: JwtPayload) {
  const allCourses = await db.query.courses.findMany();
  const allMarks = await db.query.internalMarks.findMany();
  const allAttendance = await db.query.attendanceRecords.findMany();

  const totalClasses = allAttendance.length;
  const attendedClasses = allAttendance.filter((a) => a.status === "present").length;
  const avgAttendance = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  const gradeStats = calculateGradeStatistics(allMarks);

  return {
    activeCoursesCount: allCourses.filter((c) => c.isActive).length,
    totalCoursesCount: allCourses.length,
    overallAttendanceRate: avgAttendance,
    gradeStats,
  };
}
