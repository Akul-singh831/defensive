import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().min(2, "Course code required (e.g. CS101)"),
  name: z.string().min(3, "Course name required"),
  credits: z.number().int().min(1).max(10, "Credits must be between 1 and 10"),
  program: z.string().min(2, "Program required (e.g. B.Tech CSE)"),
  semester: z.number().int().min(1).max(8, "Semester must be between 1 and 8"),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const updateCourseSchema = courseSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const subjectSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  code: z.string().min(2, "Subject code required"),
  name: z.string().min(3, "Subject name required"),
  credits: z.number().int().min(1).max(10),
  description: z.string().optional(),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

export const courseAssignmentSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  teacherId: z.string().min(1, "Teacher user ID required"),
  sectionCode: z.string().min(1, "Section code required"),
  academicYear: z.string().min(4, "Academic year required"),
  semester: z.number().int().min(1).max(8),
});

export type CourseAssignmentInput = z.infer<typeof courseAssignmentSchema>;

export const syllabusSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  subjectId: z.string().optional(),
  content: z.string().min(10, "Syllabus content required (at least 10 chars)"),
  objectives: z.string().optional(),
  textbooks: z.array(z.string()).optional(),
  assessmentMethod: z.string().optional(),
});

export type SyllabusInput = z.infer<typeof syllabusSchema>;

export const timetableSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  subjectId: z.string().optional(),
  teacherId: z.string().min(1, "Teacher ID required"),
  sectionCode: z.string().min(1, "Section code required"),
  dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM format (24h)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM format (24h)"),
  room: z.string().min(1, "Room or classroom required"),
  academicYear: z.string().min(4, "Academic year required"),
  semester: z.number().int().min(1).max(8),
});

export type TimetableInput = z.infer<typeof timetableSchema>;

export const attendanceItemSchema = z.object({
  studentId: z.string().min(1, "Student ID required"),
  status: z.enum(["present", "absent", "leave"]),
  remarks: z.string().optional(),
});

export const attendanceBatchSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  classDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Valid class date required (YYYY-MM-DD)",
  }),
  records: z.array(attendanceItemSchema).min(1, "At least one attendance record required"),
});

export type AttendanceBatchInput = z.infer<typeof attendanceBatchSchema>;

// Backwards compatibility for single record schema
export const attendanceRecordSchema = z.object({
  studentId: z.string().min(1, "Student ID required"),
  courseId: z.string().min(1, "Course ID required"),
  classDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Valid class date required",
  }),
  status: z.enum(["present", "absent", "leave"]),
  remarks: z.string().optional(),
});

export const attendanceSchema = z.array(attendanceRecordSchema);
export type AttendanceInput = z.infer<typeof attendanceSchema>;

export const assessmentSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  title: z.string().min(3, "Assessment title required"),
  type: z.enum(["assignment", "quiz", "midterm", "final"]),
  maxMarks: z.number().int().min(1, "Max marks must be greater than 0"),
  weightage: z.number().int().min(1).max(100).default(10),
  dueDate: z.string().optional(),
});

export type AssessmentInput = z.infer<typeof assessmentSchema>;

export const internalMarksItemSchema = z.object({
  studentId: z.string().min(1, "Student ID required"),
  marksObtained: z.number().min(0, "Marks obtained cannot be negative"),
  feedbackNotes: z.string().optional(),
});

export const internalMarksBatchSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  assessmentId: z.string().optional(),
  assessmentName: z.string().min(1, "Assessment name required"),
  assessmentType: z.enum(["assignment", "quiz", "midterm", "final"]).default("assignment"),
  maxMarks: z.number().int().min(1, "Max marks must be greater than 0"),
  records: z.array(internalMarksItemSchema).min(1, "At least one mark record required"),
});

export type InternalMarksBatchInput = z.infer<typeof internalMarksBatchSchema>;

// Single mark record schema
export const internalMarksRecordSchema = z.object({
  studentId: z.string().min(1, "Student ID required"),
  courseId: z.string().min(1, "Course ID required"),
  assessmentType: z.enum(["assignment", "quiz", "midterm", "final"]),
  assessmentName: z.string().min(1, "Assessment name required"),
  maxMarks: z.number().int().min(1, "Max marks must be at least 1"),
  marksObtained: z.number().min(0, "Marks obtained cannot be negative"),
  feedbackNotes: z.string().optional(),
});

export const internalMarksSchema = z.array(internalMarksRecordSchema);
export type InternalMarksInput = z.infer<typeof internalMarksSchema>;
