# Module 2: Academic

**Status:** ✅ Complete  
**Team:** Team 1  
**Created:** 2026-08-25  
**Last Updated:** 2026-08-25

## Overview

The Academic module manages courses, syllabi, timetables, student attendance, and internal marks. It implements role-based access control (RBAC) with three roles:

- **Student**: Can view their enrolled courses, syllabus, timetable, attendance, and marks
- **Teacher**: Can create/update syllabus, mark attendance, record marks, and view student data for their courses
- **Admin**: Full management of courses, timetables, course assignments, and view all academic records

---

## Database Schema

### Tables

#### `courses`
Master course catalog.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `code` | TEXT | UNIQUE | Course code (e.g., CS101) |
| `name` | TEXT | NOT NULL | Course name |
| `credits` | INTEGER | NOT NULL | Credit points |
| `program` | TEXT | NOT NULL | Program name |
| `semester` | INTEGER | NOT NULL | Semester number (1-8) |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `courseAssignments`
Links teachers to courses for a specific academic period.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `courseId` | TEXT | FOREIGN KEY → `courses.id` | Assigned course |
| `teacherId` | TEXT | FOREIGN KEY → `users.id` | Teacher assigned |
| `sectionCode` | TEXT | NOT NULL | Section identifier (A, B, C) |
| `academicYear` | TEXT | NOT NULL | Year (e.g., 2026-2027) |
| `semester` | INTEGER | NOT NULL | Semester number |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `studentEnrollments`
Records students enrolled in specific course sections.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `studentId` | TEXT | FOREIGN KEY → `enrolledStudents.id` | Enrolled student |
| `courseId` | TEXT | FOREIGN KEY → `courses.id` | Enrolled course |
| `sectionCode` | TEXT | NOT NULL | Section code |
| `academicYear` | TEXT | NOT NULL | Academic year |
| `semester` | INTEGER | NOT NULL | Semester number |
| `enrollmentDate` | TIMESTAMP | NOT NULL | Enrollment date |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `syllabi`
Course syllabus and content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `courseId` | TEXT | FOREIGN KEY → `courses.id` | Related course |
| `teacherId` | TEXT | FOREIGN KEY → `users.id` | Teacher who created |
| `content` | TEXT | NOT NULL | Syllabus content |
| `objectives` | TEXT | nullable | Learning objectives |
| `textbooks` | JSON | nullable | Array of textbook titles |
| `assessmentMethod` | TEXT | nullable | Assessment strategy |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `timetables`
Class schedule information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `courseId` | TEXT | FOREIGN KEY → `courses.id` | Course for this slot |
| `sectionCode` | TEXT | NOT NULL | Section code |
| `dayOfWeek` | TEXT | NOT NULL | Day name (Monday-Sunday) |
| `startTime` | TEXT | NOT NULL | Time (HH:MM format) |
| `endTime` | TEXT | NOT NULL | Time (HH:MM format) |
| `room` | TEXT | NOT NULL | Classroom number/location |
| `academicYear` | TEXT | NOT NULL | Academic year |
| `semester` | INTEGER | NOT NULL | Semester number |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `attendanceRecords`
Student attendance tracking per class.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `studentId` | TEXT | FOREIGN KEY → `enrolledStudents.id` | Student |
| `courseId` | TEXT | FOREIGN KEY → `courses.id` | Course |
| `classDate` | TEXT | NOT NULL | Class date (ISO format) |
| `status` | TEXT | "present" \| "absent" \| "leave" | Attendance status |
| `remarks` | TEXT | nullable | Additional notes |
| `recordedBy` | TEXT | FOREIGN KEY → `users.id` | Teacher who recorded |
| `recordedAt` | TIMESTAMP | NOT NULL | When recorded |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `internalMarks`
Assessment scores for students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `studentId` | TEXT | FOREIGN KEY → `enrolledStudents.id` | Student |
| `courseId` | TEXT | FOREIGN KEY → `courses.id` | Course |
| `assessmentType` | TEXT | "assignment" \| "quiz" \| "midterm" | Assessment type |
| `assessmentName` | TEXT | NOT NULL | Assessment title |
| `maxMarks` | INTEGER | NOT NULL | Total possible marks |
| `marksObtained` | INTEGER | NOT NULL | Actual marks obtained |
| `feedbackNotes` | TEXT | nullable | Teacher feedback |
| `recordedBy` | TEXT | FOREIGN KEY → `users.id` | Teacher who recorded |
| `recordedAt` | TIMESTAMP | NOT NULL | When recorded |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

---

## API Endpoints

### Syllabus Endpoints

#### POST `/api/academic/create-syllabus`
Create course syllabus (teacher/admin only).

**Auth:** `requireRole(["teacher", "admin"])`

**Request Body:**
```json
{
  "courseId": "uuid-course",
  "content": "Comprehensive course content...",
  "objectives": "By end of course, students will...",
  "textbooks": ["Book 1", "Book 2"],
  "assessmentMethod": "Continuous assessment: 30% assignments, 70% final exam"
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-here",
    "courseId": "uuid-course",
    "teacherId": "user-uuid",
    "content": "...",
    "objectives": "...",
    "textbooks": ["Book 1", "Book 2"],
    "assessmentMethod": "...",
    "createdAt": "2026-08-25T10:30:00Z",
    "updatedAt": "2026-08-25T10:30:00Z"
  }
}
```

---

#### GET `/api/academic/syllabus/:courseId`
Retrieve course syllabus (public - no auth).

**Response (200):**
```json
{
  "ok": true,
  "data": { /* syllabus object */ }
}
```

---

### Timetable Endpoints

#### POST `/api/academic/create-timetable`
Create class schedule (admin only).

**Auth:** `requireRole(["admin"])`

**Request Body:**
```json
{
  "courseId": "uuid-course",
  "sectionCode": "A",
  "dayOfWeek": "Monday",
  "startTime": "09:00",
  "endTime": "10:30",
  "room": "A-301",
  "academicYear": "2026-2027",
  "semester": 1
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-here",
    "courseId": "uuid-course",
    "sectionCode": "A",
    "dayOfWeek": "Monday",
    "startTime": "09:00",
    "endTime": "10:30",
    "room": "A-301",
    "academicYear": "2026-2027",
    "semester": 1,
    "createdAt": "2026-08-25T10:30:00Z",
    "updatedAt": "2026-08-25T10:30:00Z"
  }
}
```

---

#### GET `/api/academic/timetable/:courseId`
Retrieve course timetable (public - no auth).

**Response (200):**
```json
{
  "ok": true,
  "data": [ /* array of timetable entries */ ]
}
```

---

### Attendance Endpoints

#### POST `/api/academic/mark-attendance`
Mark attendance for multiple students (teacher only).

**Auth:** `requireRole(["teacher"])`  
**Query Params:** `courseId` (required)

**Request Body:**
```json
{
  "records": [
    {
      "studentId": "student-uuid-1",
      "courseId": "course-uuid",
      "classDate": "2026-08-25",
      "status": "present",
      "remarks": ""
    },
    {
      "studentId": "student-uuid-2",
      "courseId": "course-uuid",
      "classDate": "2026-08-25",
      "status": "absent",
      "remarks": "Medical leave"
    }
  ]
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": [ /* array of inserted attendance records */ ]
}
```

---

#### GET `/api/academic/attendance/:courseId/:studentId`
Retrieve student attendance for a course.

**Auth:** `requireRole(["teacher", "student", "admin"])`

**Response (200):**
```json
{
  "ok": true,
  "data": [ /* array of attendance records */ ]
}
```

**Response (403):**
```json
{
  "error": "Unauthorized: Students can only view their own attendance"
}
```

---

### Marks Endpoints

#### POST `/api/academic/record-marks`
Record student marks (teacher only).

**Auth:** `requireRole(["teacher"])`  
**Query Params:** `courseId` (required)

**Request Body:**
```json
{
  "records": [
    {
      "studentId": "student-uuid",
      "courseId": "course-uuid",
      "assessmentType": "assignment",
      "assessmentName": "Assignment 1",
      "maxMarks": 100,
      "marksObtained": 85,
      "feedbackNotes": "Excellent work!"
    }
  ]
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": [ /* array of inserted marks records */ ]
}
```

---

#### GET `/api/academic/marks/:courseId/:studentId`
Retrieve student marks for a course.

**Auth:** `requireRole(["teacher", "student", "admin"])`

**Response (200):**
```json
{
  "ok": true,
  "data": [ /* array of marks records */ ]
}
```

**Response (403):**
```json
{
  "error": "Unauthorized: Students can only view their own marks"
}
```

---

#### GET `/api/academic/enrollments/:studentId`
Retrieve student's course enrollments.

**Auth:** `requireRole(["teacher", "student", "admin"])`

**Response (200):**
```json
{
  "ok": true,
  "data": [ /* array of enrollment records */ ]
}
```

**Response (403):**
```json
{
  "error": "Unauthorized: Students can only view their own enrollments"
}
```

---

## RBAC Matrix

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| View course syllabus | ✅ | ✅ | ✅ |
| Create/update syllabus | ❌ | ✅ (own courses) | ✅ |
| View timetable | ✅ | ✅ | ✅ |
| Create timetable | ❌ | ❌ | ✅ |
| View own attendance | ✅ | ❌ | ✅ |
| Mark attendance | ❌ | ✅ (own courses) | ❌ |
| View student attendance | ✅ (own) | ✅ (own courses) | ✅ |
| View own marks | ✅ | ❌ | ✅ |
| Record marks | ❌ | ✅ (own courses) | ❌ |
| View student marks | ✅ (own) | ✅ (own courses) | ✅ |
| View enrollments | ✅ (own) | ✅ (own courses) | ✅ |

---

## UI Pages

### `/app/academic/page.tsx` (Main Dashboard)
- **Student View**: Show enrolled courses, GPA, attendance summary
- **Teacher View**: Show assigned courses, total students, pending tasks
- **Admin View**: Course management dashboard

### `/app/academic/course/[id]/page.tsx` (Course Detail)
- Show course information, syllabus, timetable
- If student: Show personal marks and attendance
- If teacher: Show enrolled students list (linked to their marks/attendance)

### `/app/academic/attendance/page.tsx` (Attendance Marking)
- Teacher-only interface to bulk mark attendance
- Form with course selector, date picker, student list with radio buttons
- Submit and refresh

### `/app/academic/marks/page.tsx` (Marks Recording)
- Teacher-only interface to record student marks
- Form with course selector, student ID, assessment type, marks
- Bulk entry option

---

## Implementation Details

### Validation
All endpoints use Zod schemas for client and server-side validation:
- **Syllabus Schema**: courseId, content (min 10), objectives (optional), textbooks (array, optional), assessmentMethod (optional)
- **Timetable Schema**: courseId, sectionCode, dayOfWeek (enum), startTime (HH:MM regex), endTime, room, academicYear, semester (1-8)
- **Attendance Schema**: Array of {studentId, courseId, classDate (ISO), status (enum), remarks (optional)}
- **Marks Schema**: Array of {studentId, courseId, assessmentType (enum), assessmentName, maxMarks (int), marksObtained (int), feedbackNotes (optional)}

### Security Patterns
1. **Course Ownership**: Teachers can only update syllabus for their courses
2. **Student Privacy**: Students can only view their own attendance/marks
3. **Batch Operations**: Attendance and marks use array schemas for efficient bulk operations
4. **Recorded By**: All attendance/marks include `recordedBy` teacher ID for audit trail
5. **Timestamp Tracking**: `recordedAt` field tracks when data was actually recorded

### Database Queries
All data access goes through `lib/academic/queries.ts`:
- `createSyllabus(data, teacherId)` - Insert with teacher validation
- `getSyllabus(courseId)` - Get first syllabus for course (public)
- `updateSyllabus(id, data, teacherId)` - Update with ownership check
- `createTimetable(data)` - Admin-only insert
- `getTimetableForCourse(courseId)` - Get all slots for course
- `markAttendance(records, courseId, teacherId)` - Batch insert with teacher validation
- `getAttendanceForStudent(studentId, courseId, user)` - Get with ownership check
- `recordMarks(records, courseId, teacherId)` - Batch insert with teacher validation
- `getMarksForStudent(studentId, courseId, user)` - Get with ownership check
- `listStudentEnrollments(studentId, user)` - List with ownership check

---

## Testing Checklist

- [ ] Create syllabus as teacher for own course
- [ ] Attempt to update another teacher's syllabus (should fail)
- [ ] Create timetable as admin
- [ ] Attempt to create timetable as teacher (should fail)
- [ ] Mark attendance as teacher (batch operation)
- [ ] Student views their own attendance
- [ ] Student attempts to view classmate's attendance (should fail)
- [ ] Teacher records marks for multiple students (batch)
- [ ] Student views their marks
- [ ] Verify attendance/marks include teacher ID and timestamp
- [ ] List student enrollments with access control
- [ ] Test form validation (client + server)

---

## Future Enhancements

1. **Grade Distribution**: Automatic GPA calculation and transcript generation
2. **Attendance Reports**: Statistical analysis and warnings for low attendance
3. **Makeup Classes**: Tracking rescheduled sessions
4. **Exam Scheduling**: Automated exam timetable generation
5. **Study Materials**: Upload and share course resources
6. **Student Progress Analytics**: Identify at-risk students based on marks trends
7. **Feedback System**: Anonymous student feedback on courses
8. **Lab Sessions**: Separate tracking for practical/lab components

---

## Dependencies

- Next.js 16 (App Router)
- Hono 4.13.3 (API framework)
- Turso SQLite (Database)
- Drizzle ORM 0.45.2 (Query builder)
- Zod (Validation)
- react-hook-form (Form state management)
- shadcn/ui (UI components)
- jose (JWT signing)
- bcryptjs (Password hashing)

---

## Ownership

- **Schema & Database**: `lib/schema.ts` (shared across all modules)
- **Queries & Validation**: `lib/academic/schemas.ts`, `lib/academic/queries.ts`
- **API Routes**: `app/api/[[...route]]/route.ts` (Academic section)
- **UI Pages**: `app/academic/**`

---

## Related Documentation

- [Blue Team RBAC Contract](../docs/RBAC.md)
- [Auth System Documentation](../docs/AUTH.md)
- [API Patterns](../docs/API-PATTERNS.md)
- [Module 1: Admissions](./module-01-admissions.md)
