# Module 2: Academic Management

## 1. Module Name
**Academic Management System (Module 2)** - Defensive Cybersecurity Enterprise Resource Planning (ERP).

---

## 2. Objective
To securely govern university courses, subject mapping, syllabus authoring, conflict-proof timetable generation, attendance tracking, assessment design, and gradebook management. The module guarantees faculty isolation, prevents cross-student academic data leakage (IDOR), prevents grade tampering, and performs server-side schedule collision detection.

---

## 3. Stakeholders
- **Students**: View accredited courses, syllabus guidelines, personal class schedules, own attendance percentages, and published assessment grades.
- **Faculty / Teachers**: Access assigned course sections, create syllabi, record daily class attendance, enter assessment marks, and publish evaluation results.
- **Department Chairs / Administrators**: Create and deactivate courses, map subjects, assign instructors, resolve scheduling conflicts, and generate academic reports.
- **Security & Compliance Officers**: Verify grade modification audit trails, attendance modification logs, and access control policies.

---

## 4. AS-IS Process
In conventional academic systems:
1. Faculty can view or edit marks for any course simply by changing request query parameters like `courseId=CS201` (Broken Access Control).
2. Students can query `/student/:id/marks` for other students to discover their exam performance and GPA (IDOR).
3. Grade boundaries are not enforced server-side; clients can submit negative marks or values greater than the maximum score (e.g. `marks: 999`).
4. Timetables rely on frontend calendar validation, allowing double-booking of instructors or classrooms when requests are submitted directly to the API.
5. Attendance records can be duplicated or fabricated without faculty assignment verification.

---

## 5. TO-BE Process
Under this defensive architecture:
1. **Faculty Assignment Isolation**: Before any attendance or marks update is processed, `assertFacultyCourseOwnership()` checks `course_assignments` to guarantee the instructor is officially assigned to that specific course and section.
2. **Student Privacy Isolation**: Access to `/academic/marks/:courseId/:studentId` and `/academic/attendance/:courseId/:studentId` strictly enforces `assertStudentSelfAccess()`. Students attempting to view other records receive HTTP 403 Forbidden.
3. **Strict Grade Integrity**: `validateGradeBoundaries()` ensures all submitted scores are valid numbers $\ge 0$ and $\le maxMarks$. Calculated letter grades are generated server-side.
4. **Server-Side Timetable Conflict Engine**: `assertNoTimetableConflicts()` mathematically evaluates time interval overlaps before insertion, preventing faculty collision, room overlap, and section conflict.
5. **Duplicate Attendance Defense**: Duplicate entries for the same student on the same date are rejected with HTTP 409 Conflict.
6. **Academic Risk Early Warning**: Automated analysis identifies low attendance ($<75\%$) or failing marks ($<40\%$) to assist advisors without automatic academic penalties.

---

## 6. Functional Requirements
- **FR-1 (Course & Subject Catalog)**: Create, view, update, and deactivate courses with credit values; map subjects to courses.
- **FR-2 (Faculty Course Assignment)**: Link instructors to course sections and academic semesters with administrative verification.
- **FR-3 (Syllabus Authoring)**: Authorized instructors author learning objectives, textbook references, and grading policies.
- **FR-4 (Timetable Scheduling)**: Generate collision-free schedules with day, time slot, room, instructor, and section mapping.
- **FR-5 (Attendance Recording)**: Faculty batch-records present/absent/leave statuses; students track own cumulative rate.
- **FR-6 (Assessments & Gradebook)**: Faculty creates quizzes, midterms, and finals; records scores; computes letter grades; publishes results.

---

## 7. Non-Functional Requirements
- **Security**: Strict prevention of BOLA/IDOR, grade tampering, faculty cross-modification, and timetable race conditions.
- **Consistency**: ACID transactions and unique constraints across attendance and timetable assignments.
- **Availability**: High performance via Drizzle ORM and Turso SQLite edge infrastructure.
- **Accessibility**: Zero em-dash copy, WCAG AA contrast, accessible inputs, and responsive layout.

---

## 8. Roles and Permissions
| Role | View Catalog | Assign Faculty | Manage Timetable | Mark Attendance | Submit Grades | View Own Records |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin** | Yes | **Yes** | **Yes** | Yes (Supervisory) | Yes (Supervisory) | N/A |
| **Faculty** | Yes | No | View Assigned | **Yes (Assigned Only)** | **Yes (Assigned Only)** | N/A |
| **Student** | Yes | No | View Own | **No** | **No** | **Yes (Self Only)** |

---

## 9. Academic Integrity & Verification Workflow
```text
           [ Course Created ]
                   │
                   ▼ (Admin Assigns Faculty)
       [ Faculty Assigned to Class ]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[ Timetable Scheduled ]  [ Daily Attendance ]
(Server Conflict Check)  (Duplicate Date Check)
         │                   │
         └─────────┬─────────┘
                   ▼
       [ Assessment Created ]
                   │
                   ▼ (Faculty Inputs Marks)
       [ Boundary Validation ] (0 <= marks <= maxMarks)
                   │
                   ▼ (Letter Grade Computed)
       [ Controlled Publication ]
                   │
                   ▼ (Student Views Own Result)
        [ Student Gradebook ]
```

---

## 10. Data Requirements
- **Course**: Code (unique), name, credits (1-10), program, semester (1-8), active flag.
- **Subject**: Code (unique), course ID, name, credits, description.
- **Timetable**: Course ID, teacher ID, section, day of week, start time (HH:MM), end time (HH:MM), room number, academic year.
- **Attendance**: Student ID, course ID, class date, status (`present`, `absent`, `leave`), remarks, recordedBy.
- **Assessment**: Course ID, teacher ID, title, type (`assignment`, `quiz`, `midterm`, `final`), max marks, weightage.
- **Internal Marks**: Student ID, assessment ID, marks obtained, max marks, letter grade, feedback, status (`draft`, `published`).

---

## 11. Database Design
- **`courses`**: Primary key `id` (text), `code` (unique), `name`, `credits`, `program`, `semester`, `is_active`, timestamps.
- **`subjects`**: Primary key `id`, foreign key `course_id`, `code` (unique), `name`, `credits`, `description`, timestamps.
- **`course_assignments`**: Primary key `id`, foreign key `course_id`, `teacher_id`, `section_code`, `academic_year`, `semester`, timestamps.
- **`timetables`**: Primary key `id`, foreign key `course_id`, `teacher_id`, `room`, `day_of_week`, `start_time`, `end_time`, `is_published`, timestamps.
- **`attendance_records`**: Primary key `id`, foreign key `student_id`, `course_id`, `class_date`, `status`, `remarks`, `recorded_by`, timestamps.
- **`assessments`**: Primary key `id`, foreign key `course_id`, `teacher_id`, `title`, `type`, `max_marks`, `weightage`, timestamps.
- **`internal_marks`**: Primary key `id`, foreign key `student_id`, `course_id`, `assessment_id`, `marks_obtained`, `max_marks`, `grade`, `status`, timestamps.

---

## 12. API Design
- `POST /api/academic/courses`: Create accredited course (admin only).
- `GET /api/academic/courses`: List courses (filtered by active state for students).
- `PATCH /api/academic/course/:id/status`: Deactivate course (admin only).
- `POST /api/academic/subjects`: Create subject (admin only).
- `GET /api/academic/subjects/:courseId`: List subjects by course.
- `POST /api/academic/create-timetable`: Create schedule slot with server conflict check (admin only).
- `GET /api/academic/timetable/:courseId`: View timetable for course.
- `POST /api/academic/mark-attendance`: Record batch attendance (assigned faculty only).
- `GET /api/academic/attendance/:courseId/:studentId`: View attendance (self or assigned faculty).
- `POST /api/academic/assessments`: Create assessment component.
- `POST /api/academic/record-marks`: Submit marks with boundary validation (assigned faculty only).
- `GET /api/academic/marks/:courseId/:studentId`: View marks (self or assigned faculty).
- `POST /api/academic/results/publish`: Publish assessment results to students.
- `GET /api/academic/metrics`: Aggregate enrollment, attendance rate, and grade distributions.

---

## 13. AI Use Case (Defensive Academic Risk Alert)
Early-warning assistive intelligence to identify students falling below the statutory 75% attendance threshold or scoring below passing marks (40%).

---

## 14. AI Input / Process / Output
- **Input**: Cumulative class attendance records and assessment scores for a student.
- **Process**: Heuristic threshold evaluation (`attendanceRate < 75`, `averageScore < 40`).
- **Output**: `AcademicRiskReport` indicating risk status, exact deficit, and advisory recommendations.

---

## 15. Human Approval (Human-in-the-Loop)
Risk alerts **never alter grades or issue disciplinary actions automatically**. They notify faculty advisors and counselors so appropriate human guidance or support can be arranged.

---

## 16. Security Controls
1. **Faculty Assignment Isolation**: Instructors cannot mutate records for courses they do not teach.
2. **Student Privacy Guard (IDOR)**: Direct object references to other students' marks are rejected with HTTP 403.
3. **Grade Boundary Validation**: Rejects negative values and scores $> maxMarks$.
4. **Timetable Collision Engine**: Server mathematically verifies non-overlapping intervals for faculty, room, and section.
5. **Duplicate Attendance Defense**: Prevents multiple attendance submissions for the same student on the same date.
6. **Audit Trail**: Every grade entry, grade correction, and attendance record is logged with actor metadata.

---

## 17. Reports & Dashboard
The Academic Dashboard offers comprehensive insights:
- Active Course and Subject Totals.
- Aggregate Institutional Attendance Rate.
- Course Assessment Average Percentages.
- Gradebook Letter Distribution ($A+, A, B+, B, C, D, F$).
- Student Academic Risk Indicators.

---

## 18. Testing
- **Unit Tests**: `module-2-academic/tests/unit/academic-services.test.ts`
- **Security Tests**: `module-2-academic/tests/security/academic-security.test.ts`
- **Demonstration Suite**: `scripts/demo-security.ts` (Demo 3, Demo 5, Demo 7)

---

## 19. Risks & Mitigation
- **Risk**: Unauthorized grade alteration by malicious students or unauthorized faculty.
  - **Mitigation**: Server-side faculty ownership checks, boundary limits, and immutable audit logs.
- **Risk**: Timetable chaos from overlapping faculty or room assignments.
  - **Mitigation**: Server-side conflict detection engine executing before database insertion.

---

## 20. Expected Outcomes
A high-integrity academic records system where grades, attendance, and timetables are mathematically and authorizationally protected from tampering, collision, and unauthorized disclosure.
