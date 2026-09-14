# Plan: Team 1 — Admissions & Academic Modules (Modules 1 & 2)

## TL;DR
Team 1 will implement the **Admissions** and **Academic** modules for the ethical-hacking-project. This is a brand-new project, so the plan includes:
1. **Project initialization** — Next.js 16 (App Router), Hono, Turso, Drizzle, shadcn/ui
2. **Database schema** — Admissions & Academic tables (Section 6.2)
3. **API routes** — RESTful endpoints for both modules via single Hono app
4. **UI pages** — Role-gated pages (admin/teacher/student views)
5. **Authentication integration** — Import `requireRole()` from `lib/auth/guard` (provided by team/auth)

The project follows the Blue Team RBAC contract: 3 roles (admin, teacher, student), module ownership per team, and strict auth patterns.

---

## Phase 1: Project Initialization

**Goal:** Set up the complete Next.js + Hono + Turso + Drizzle stack.

### Step 1.1 — Clone & Install (Dependency: None, can start immediately)
- Clone the ethical-hacking-project repository from GitHub
- Run `bun install` to install dependencies
- Verify versions: Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui

**Deliverable:** `bun dev` runs successfully on http://localhost:3000

### Step 1.2 — Configure Environment & Database (Depends on 1.1)
- Copy `.env.example` to `.env.local`
- Populate `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (request from lead if not using personal Turso)
- Populate `JWT_SECRET` (32+ chars, provided by team/auth or generate locally)
- Run `bun run db:sync` to initialize database schema from `lib/schema.ts`

**Deliverable:** `.env.local` configured, `bun run db:sync` succeeds, Turso DB is active

### Step 1.3 — Verify Root Project Structure (Depends on 1.2)
- Confirm root pages exist: `app/page.tsx` (landing), `app/layout.tsx` (root layout), `app/globals.css` (Tailwind)
- Confirm auth routes are wired: `app/api/[[...route]]/route.ts` with Hono + CORS + logger
- Confirm Fonts are set: Space Grotesk (headings), IBM Plex Sans (body) in root layout
- Confirm auth guard is importable: `lib/auth/guard.ts` with `requireRole()` and `requireAuth()`

**Deliverable:** App runs without errors, fonts render correctly, auth structure is in place

---

## Phase 2: Database Schema Design & Migration

**Goal:** Design and implement all tables for Admissions and Academic modules.

### Step 2.1 — Define Admissions Tables (Depends on 1.3)

Add the following to `lib/schema.ts` under a clearly labeled section:

**Tables:**
1. **`admissionEnquiries`** — preliminary interest from prospective students
   - `id` (text, PK)
   - `email` (text, unique)
   - `fullName` (text)
   - `phone` (text)
   - `interestedProgram` (text) — e.g., "B.Tech", "M.Tech"
   - `enquiryDate` (text, ISO 8601)
   - `status` (text, enum: "new" | "contacted" | "closed") — default "new"
   - `createdAt`, `updatedAt` (text)

2. **`admissionApplications`** — formal applications after enquiry
   - `id` (text, PK)
   - `enquiryId` (text, FK to admissionEnquiries)
   - `studentId` (text) — initially NULL; populated after enrollment
   - `email` (text)
   - `fullName` (text)
   - `dateOfBirth` (text, ISO 8601)
   - `address` (text)
   - `phone` (text)
   - `programAppliedFor` (text) — e.g., "B.Tech CSE"
   - `qualifications` (text, JSON serialized) — e.g., `{"10th": "90%", "12th": "85%"}`
   - `applicationDate` (text, ISO 8601)
   - `status` (text, enum: "pending" | "approved" | "rejected" | "enrolled") — default "pending"
   - `approvedBy` (text, FK to users) — admin who approved
   - `approvalDate` (text, optional)
   - `rejectionReason` (text, optional)
   - `createdAt`, `updatedAt` (text)

3. **`enrolledStudents`** — students currently enrolled
   - `id` (text, PK)
   - `userId` (text, FK to users)
   - `enrollmentDate` (text, ISO 8601)
   - `program` (text) — e.g., "B.Tech CSE"
   - `batch` (text) — e.g., "2024-2028"
   - `rollNumber` (text, unique)
   - `isActive` (integer, boolean, default 1)
   - `createdAt`, `updatedAt` (text)

**Verification:** `bun run db:sync` completes, tables appear in Turso

### Step 2.2 — Define Academic Tables (Depends on 2.1, parallel with future steps)

Add to `lib/schema.ts` under a labeled section:

**Tables:**
1. **`courses`** — university courses/subjects
   - `id` (text, PK)
   - `code` (text, unique) — e.g., "CS201"
   - `name` (text) — e.g., "Data Structures"
   - `credits` (integer)
   - `program` (text) — e.g., "B.Tech CSE"
   - `semester` (integer) — e.g., 3
   - `createdAt`, `updatedAt` (text)

2. **`courseAssignments`** — which teacher teaches which course in which section
   - `id` (text, PK)
   - `courseId` (text, FK to courses)
   - `teacherId` (text, FK to users)
   - `sectionCode` (text) — e.g., "A", "B"
   - `academicYear` (text) — e.g., "2024-2025"
   - `semester` (integer)
   - `createdAt`, `updatedAt` (text)

3. **`studentEnrollments`** — which student is in which course/section
   - `id` (text, PK)
   - `studentId` (text, FK to users)
   - `courseId` (text, FK to courses)
   - `sectionCode` (text) — e.g., "A", "B"
   - `academicYear` (text)
   - `semester` (integer)
   - `enrollmentDate` (text)
   - `createdAt`, `updatedAt` (text)

4. **`syllabi`** — course syllabus/outline per teacher per course
   - `id` (text, PK)
   - `courseId` (text, FK to courses)
   - `teacherId` (text, FK to users)
   - `content` (text) — syllabus text/markdown
   - `objectives` (text, JSON or plain text)
   - `textbooks` (text, JSON array)
   - `assessmentMethod` (text) — e.g., "30% assignments, 40% mid-term, 30% finals"
   - `createdAt`, `updatedAt` (text)

5. **`timetables`** — class schedule
   - `id` (text, PK)
   - `courseId` (text, FK to courses)
   - `sectionCode` (text)
   - `dayOfWeek` (text) — enum: "Monday" | "Tuesday" | … | "Friday"
   - `startTime` (text) — HH:MM format
   - `endTime` (text)
   - `room` (text) — e.g., "102-A"
   - `academicYear` (text)
   - `semester` (integer)
   - `createdAt`, `updatedAt` (text)

6. **`attendanceRecords`** — per-student per-class attendance
   - `id` (text, PK)
   - `studentId` (text, FK to users)
   - `courseId` (text, FK to courses)
   - `classDate` (text, ISO 8601)
   - `status` (text, enum: "present" | "absent" | "leave") — default "absent"
   - `remarks` (text, optional)
   - `recordedBy` (text, FK to users) — teacher who recorded
   - `recordedAt` (text)
   - `createdAt`, `updatedAt` (text)

7. **`internalMarks`** — assignment, quiz, and internal exam scores
   - `id` (text, PK)
   - `studentId` (text, FK to users)
   - `courseId` (text, FK to courses)
   - `assessmentType` (text, enum: "assignment" | "quiz" | "midterm") — default "assignment"
   - `assessmentName` (text) — e.g., "Assignment 1"
   - `maxMarks` (integer)
   - `marksObtained` (integer)
   - `feedbackNotes` (text, optional)
   - `recordedBy` (text, FK to users) — teacher who recorded
   - `recordedAt` (text)
   - `createdAt`, `updatedAt` (text)

**Verification:** `bun run db:sync` completes, all 7 tables present in Turso

---

## Phase 3: Zod Schemas & API Helpers

**Goal:** Define validation schemas and database query helpers for both modules.

### Step 3.1 — Admissions Schemas & Queries (Depends on 2.1)

Create `lib/admissions/schemas.ts`:
- `enquirySchema` — POST /admissions/create-enquiry
- `applicationSchema` — POST /admissions/create-application (with student contact info)
- `approveApplicationSchema` — POST /admissions/approve (admin only, includes approval date + notes)
- `rejectApplicationSchema` — POST /admissions/reject (admin only, includes rejection reason)
- `enrollStudentSchema` — POST /admissions/enroll (admin only, creates user + enrolledStudent record)

Create `lib/admissions/queries.ts`:
- `createEnquiry(data)` — wrapped in `requireAuth()`
- `getEnquiry(id, user)` — wrapped in `requireAuth()` + ownership check
- `listEnquiries(user)` — admin gets all, student gets own
- `createApplication(data)` — wrapped in `requireAuth()`
- `getApplication(id, user)` — wrapped in `requireAuth()` + ownership check
- `listApplications(user)` — admin gets all, student gets own
- `approveApplication(id, approverId)` — wrapped in `requireRole(["admin"])`
- `rejectApplication(id, reason, approverId)` — wrapped in `requireRole(["admin"])`
- `enrollStudent(applicationId, email, password, firstName, lastName)` — wrapped in `requireRole(["admin"])` — creates both `users` and `enrolledStudents` records

**Verification:** All functions compile, TypeScript strict mode, schemas validate on sample data

### Step 3.2 — Academic Schemas & Queries (Depends on 2.2, parallel with 3.1)

Create `lib/academic/schemas.ts`:
- `syllabusSchema` — POST /academic/create-syllabus (teacher only)
- `timetableSchema` — POST /academic/create-timetable (admin or teacher)
- `attendanceSchema` — POST /academic/mark-attendance (teacher only, array of records)
- `internalMarksSchema` — POST /academic/record-marks (teacher only, array of records)

Create `lib/academic/queries.ts`:
- `createSyllabus(data, teacherId)` — wrapped in `requireRole(["teacher", "admin"])`
- `getSyllabus(courseId, user)` — all roles can read
- `updateSyllabus(id, data, teacherId)` — wrapped in `requireRole(["teacher", "admin"])` + ownership check
- `createTimetable(data, createdBy)` — wrapped in `requireRole(["admin"])`
- `getTimetableForCourse(courseId)` — all roles can read
- `markAttendance(records[], courseId, teacherId)` — wrapped in `requireRole(["teacher"])` + ownership check
- `getAttendanceForStudent(studentId, courseId, user)` — student sees own, teacher sees their courses, admin sees all
- `recordMarks(records[], courseId, teacherId)` — wrapped in `requireRole(["teacher"])` + ownership check
- `getMarksForStudent(studentId, courseId, user)` — student sees own, teacher sees their courses, admin sees all
- `listStudentEnrollments(studentId, user)` — student sees own, admin/teacher see their classes

**Verification:** All functions compile, TypeScript strict mode, schemas validate on sample data

---

## Phase 4: API Routes (Hono Handlers)

**Goal:** Mount all API endpoints in `app/api/[[...route]]/route.ts`.

### Step 4.1 — Admissions API Routes (Depends on 3.1)

Add to the central Hono app in `app/api/[[...route]]/route.ts`:

**Endpoints:**
```
POST   /admissions/create-enquiry    → student/anyone creates enquiry
GET    /admissions/enquiry/:id       → retrieve enquiry (owner or admin)
GET    /admissions/enquiries         → list (admin sees all, student sees own)

POST   /admissions/create-application → student creates application
GET    /admissions/application/:id   → retrieve application (owner or admin)
GET    /admissions/applications      → list (admin sees all, student sees own)

POST   /admissions/approve           → admin approves an application
POST   /admissions/reject            → admin rejects an application
POST   /admissions/enroll            → admin enrolls approved applicant (creates user + record)
```

Each route:
- Calls `requireRole()` with appropriate roles
- Validates input with Zod schema
- Calls corresponding query helper
- Returns JSON response + audit log entry (for sensitive actions)

**Verification:** All routes compile, Hono routing works, auth guards are in place

### Step 4.2 — Academic API Routes (Depends on 3.2, parallel with 4.1)

Add to the central Hono app:

**Endpoints:**
```
POST   /academic/create-syllabus     → teacher creates syllabus for a course
GET    /academic/syllabus/:courseId  → retrieve syllabus (all roles)
PUT    /academic/syllabus/:id        → teacher updates own syllabus

POST   /academic/create-timetable    → admin creates timetable
GET    /academic/timetable/:courseId → retrieve timetable (all roles)

POST   /academic/mark-attendance     → teacher marks attendance (batch)
GET    /academic/attendance/:courseId → get attendance records (teacher/admin, or student for self)

POST   /academic/record-marks        → teacher records internal marks (batch)
GET    /academic/marks/:courseId     → get marks (teacher/admin for course, student for self)

GET    /academic/enrollments/:studentId → get student's course enrollments (student/admin)
```

Each route follows the pattern: `requireRole()` → `safeParse()` → `query()` → response + audit log

**Verification:** All routes compile, Hono routing works, auth guards are in place

---

## Phase 5: Frontend Pages & Components

**Goal:** Build role-gated UI pages for Admissions and Academic modules.

### Step 5.1 — Admissions Pages (Depends on 4.1)

Create `app/admissions/` folder:

**Pages:**
1. **`app/admissions/page.tsx`** (student/admin view)
   - Student: Form to create enquiry + list own applications + status updates
   - Admin: Dashboard showing all enquiries + applications + bulk actions (approve/reject/enroll)
   - Use `useAuth(["admin", "student"])`

2. **`app/admissions/enquiry/[id]/page.tsx`** (detail view)
   - Display enquiry details (read-only for student, edit for admin)
   - Show related applications
   - Use `useAuth(["admin", "student"])`

3. **`app/admissions/application/[id]/page.tsx`** (detail view)
   - Display application form (student can edit if pending, admin can approve/reject)
   - Show approval/rejection history
   - Use `useAuth(["admin", "student"])`

Each page:
- Starts with `const { user, loading } = useAuth([...])` guard
- Uses `shadcn/ui` components (Button, Input, Form, Dialog, etc.)
- Fetches data from `/api/admissions/*` endpoints
- Uses `react-hook-form` + `zodResolver` for forms (following AuraEdge pattern)
- Displays toast notifications on success/error
- Styled with Tailwind, fonts per Section 9 (Space Grotesk headings, IBM Plex Sans body)

**Verification:** Pages render without auth errors, forms submit successfully, data displays correctly

### Step 5.2 — Academic Pages (Depends on 4.2, parallel with 5.1)

Create `app/academic/` folder:

**Pages:**
1. **`app/academic/page.tsx`** (teacher/student view)
   - Teacher: Dashboard showing assigned courses, quick links to syllabus/timetable/attendance/marks
   - Student: Dashboard showing enrolled courses + attendance summary + marks summary
   - Use `useAuth(["teacher", "student"])`

2. **`app/academic/course/[id]/page.tsx`** (course detail)
   - Display course info, syllabus, timetable, attendance (if teacher/student is enrolled)
   - Teacher can edit syllabus
   - Use `useAuth(["teacher", "student"])`

3. **`app/academic/attendance/page.tsx`** (teacher attendance marking)
   - Select course/date → mark attendance for all students in that class
   - Batch form using `react-hook-form`
   - Use `useAuth(["teacher"])`

4. **`app/academic/marks/page.tsx`** (marks entry & view)
   - Teacher: Form to record internal marks (assignments, quizzes, midterm)
   - Student: View own marks per course
   - Use `useAuth(["teacher", "student"])`

5. **`app/academic/attendance/[courseId]/page.tsx`** (view attendance)
   - Student: View own attendance per course
   - Teacher: View attendance for their courses
   - Use `useAuth(["teacher", "student"])`

6. **`app/academic/marks/[courseId]/page.tsx`** (view marks)
   - Student: View own marks for this course
   - Teacher: View all student marks for this course
   - Use `useAuth(["teacher", "student"])`

Each page follows the same pattern as Admissions: auth guard → `shadcn/ui` + Tailwind + fonts → forms with `react-hook-form`

**Verification:** Pages render, auth guards work, forms submit, data fetches

---

## Phase 6: Documentation

**Goal:** Document the modules for reference.

### Step 6.1 — Admissions Module Docs (Depends on 5.1)

Create `docs/module-01-admissions.md`:
- Overview: What is the admissions workflow?
- RBAC matrix (admin/teacher/student actions)
- Database tables (list + relationships)
- API endpoints (list + curl examples)
- UI pages (screenshots or descriptions)

### Step 6.2 — Academic Module Docs (Depends on 5.2)

Create `docs/module-02-academic.md`:
- Overview: What is the academic module?
- RBAC matrix
- Database tables + relationships
- API endpoints + curl examples
- UI pages + screenshots

---

## Verification & Testing

### Phase 7.1 — End-to-End Testing (Depends on 6.2)

1. **Auth flow:**
   - Login as admin → should see all modules in dashboard ✓
   - Login as student → should see Admissions tile in dashboard ✓
   - Login as teacher → should NOT see Admissions, should see Academic ✓

2. **Admissions flow:**
   - Student creates enquiry → record appears in DB ✓
   - Admin approves → application status changes to "approved" ✓
   - Admin enrolls → user created in `users` table + `enrolledStudents` record ✓
   - New user can log in ✓

3. **Academic flow:**
   - Teacher creates syllabus → appears for all students in course ✓
   - Teacher marks attendance → recorded in DB ✓
   - Student views own attendance → sees only their records ✓
   - Teacher records marks → appears for students ✓
   - Student views own marks → sees only their scores ✓
   - Unauthenticated request → 401 response ✓
   - Wrong role request → 403 response ✓

4. **Data validation:**
   - Invalid email → rejected by Zod ✓
   - Missing required field → 400 response ✓
   - SQL injection attempt → safely escaped ✓

5. **UI validation:**
   - Forms render without errors ✓
   - Buttons submit correctly ✓
   - Tables display data correctly ✓
   - Role-based UI elements show/hide correctly ✓

### Phase 7.2 — Security Checklist (Depends on 7.1)

Before final PR:
- [ ] No function in `lib/` reads/writes DB without `requireAuth()`/`requireRole()`
- [ ] No global `db.*` exports — only through guarded query functions
- [ ] All inputs validated with Zod before Drizzle
- [ ] Ownership checks in place (e.g., student can only view own applications)
- [ ] JWT verification + role check on every protected route
- [ ] No plaintext passwords (auth handles hashing)
- [ ] No `package.json` changes
- [ ] No edits to `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `lib/turso.ts`, `lib/utils.ts`, `components/ui/*`
- [ ] Tables added to `lib/schema.ts` with module-specific prefixes (e.g., `admissionEnquiries`)
- [ ] Documentation complete and accurate

---

## Relevant Files

- [lib/schema.ts](lib/schema.ts) — Add Admissions & Academic table definitions (Sections 2.1–2.2)
- [app/api/[[...route]]/route.ts](app/api/[[...route]]/route.ts) — Mount Admissions & Academic API routes (Sections 4.1–4.2)
- [lib/admissions/schemas.ts](lib/admissions/schemas.ts) — Create validation schemas
- [lib/admissions/queries.ts](lib/admissions/queries.ts) — Create DB query helpers with auth guards
- [lib/academic/schemas.ts](lib/academic/schemas.ts) — Create validation schemas
- [lib/academic/queries.ts](lib/academic/queries.ts) — Create DB query helpers with auth guards
- [app/admissions/page.tsx](app/admissions/page.tsx) — Main admissions page (student/admin)
- [app/academic/page.tsx](app/academic/page.tsx) — Main academic page (teacher/student)
- [docs/module-01-admissions.md](docs/module-01-admissions.md) — Admissions documentation
- [docs/module-02-academic.md](docs/module-02-academic.md) — Academic documentation

---

## Decisions & Assumptions

1. **Project initialization:** A brand-new Next.js 16 project will be created with all required dependencies (Next.js, Hono, Turso, Drizzle, shadcn/ui, react-hook-form, zod, bcryptjs, jose).

2. **Auth layer:** Assumes `lib/auth/guard.ts` (with `requireRole()`, `requireAuth()`) is provided by `team/auth` and ready to import. All routes will use this centralized guard.

3. **Database:** Single Turso SQLite database shared across all teams. Table names prefixed by module (e.g., `admissionEnquiries`, `courses`) to avoid collisions.

4. **RBAC enforcement:** All module routes respect the 3-role system (admin, teacher, student). Role-based access is enforced server-side in every handler via `requireRole()`.

5. **UI framework:** All pages use `shadcn/ui` components, `react-hook-form` for forms, Tailwind for styling, and the designated fonts (Space Grotesk headings, IBM Plex Sans body).

6. **API pattern:** All endpoints follow `requireRole()` → `schema.safeParse()` → `query()` → response pattern. No Next.js Route Handlers; all routes live in the single Hono app.

7. **Audit logging:** Sensitive actions (approve, reject, enroll, mark attendance, record marks) are logged to `auditLogs` table (owned by team/auth).

8. **Ownership checks:** Student views only own enquiries, applications, enrollment, attendance, and marks. Teachers view only their assigned courses and classes. Admins see all.

---

## Further Considerations

1. **Admissions to Academic handoff:** When a student is enrolled (via Admissions), they should be added to appropriate courses in Academic. Should Admissions automatically enroll students in courses, or should Academic registration be manual?
   - Recommendation: Admissions creates the `enrolledStudents` record only. Academic course registration (which course/section the student attends) is a separate manual step by admin or auto-enrollment based on program/batch.

2. **Timetable publication:** When are timetables visible to students? Immediately after teacher/admin creates them, or only after admin publishes?
   - Recommendation: Visible immediately to all roles. No separate "publish" state; timetables are live once created.

3. **Attendance & marks deadlines:** Should teachers be able to edit attendance/marks after recording? Should there be a deadline to prevent backdating?
   - Recommendation: Yes, teachers can edit within same academic year. Backdating is allowed but logged in audit trail.

4. **Course enrollment prerequisite:** Should Course prerequisites be tracked (e.g., "must pass CS101 before taking CS201")?
   - Recommendation: Out of scope for MVP. Add as future feature if needed.

5. **Report generation:** Should Admissions/Academic generate PDFs or CSV exports (e.g., enrollment list, attendance sheet, marks report)?
   - Recommendation: Out of scope for MVP. Add as future feature if needed.

---

## Implementation Order (Recommended Sequence)

1. ✓ Phase 1: Project initialization
2. ✓ Phase 2: Database schema (Admissions + Academic in parallel)
3. ✓ Phase 3: Zod schemas & queries (Admissions + Academic in parallel)
4. ✓ Phase 4: API routes (Admissions + Academic in parallel)
5. ✓ Phase 5: Frontend pages (Admissions + Academic in parallel)
6. ✓ Phase 6: Documentation (Admissions + Academic in parallel)
7. ✓ Phase 7: Testing & security checklist

**Total effort:** ~3–4 weeks for one person, or ~1–2 weeks for a pair.

---

**Plan created:** 2026-08-24  
**Team:** Team 1 (Modules 1 & 2)  
**Status:** Ready for review & approval
