# Module 1: Admissions Management

## 1. Module Name
**Admissions Management System (Module 1)** - Defensive Cybersecurity Enterprise Resource Planning (ERP).

---

## 2. Objective
To securely digitize the prospective student lifecycle from initial enquiry to multi-step formal application, automated merit evaluation, ranking, administrative review, approval, and final university enrollment. The module enforces zero-trust authorization, prevents Insecure Direct Object References (IDOR), stops workflow tampering, and maintains a tamper-evident audit trail for every sensitive action.

---

## 3. Stakeholders
- **Prospective Students / Applicants**: Submit enquiries, draft formal applications, submit academic qualifications, and view official merit rankings.
- **Admissions Administrators & Officers**: Review applications, evaluate eligibility, compute and publish merit lists, approve/reject candidates, and issue formal enrollments.
- **Academic Registrar**: Receives verified enrolled students into the university database with generated roll numbers and credentials.
- **Information Security Team (Blue Team)**: Audits admissions logs, monitors anomaly alerts, and ensures data confidentiality.

---

## 4. AS-IS Process
In traditional or insecure implementations:
1. Enquiries and applications are submitted through unvalidated web forms or email attachments.
2. Application data is directly mutable by clients without role verification or state machine constraints.
3. Applicants can access or tamper with other applicants' records simply by modifying URL parameters (IDOR).
4. Privileged fields such as `status: "approved"` or `meritScore: 100` are sent directly from frontend clients and accepted by the server without authorization (Mass Assignment).
5. State transitions can be skipped (e.g., jump directly from unreviewed draft to enrolled student).
6. Lack of immutable audit logging makes tracking unauthorized admissions or tampering impossible.

---

## 5. TO-BE Process
Under this defensive cybersecurity ERP:
1. **Defensive Pipeline**: Every request passes through `requireAuth() -> requireRole() -> Ownership Validation -> Zod Schema Parse -> State Machine Check -> Parameterized Query -> Audit Event`.
2. **Server-Side State Machine**: Rigid transition rules (`DRAFT` $\to$ `SUBMITTED` $\to$ `UNDER_REVIEW` $\to$ `APPROVED`/`REJECTED` $\to$ `ENROLLED`). Direct jumps are rejected with HTTP 400.
3. **Mass Assignment Defense**: Privileged properties are stripped on the server; client input cannot modify status, merit scores, or approval timestamps.
4. **Ownership & IDOR Prevention**: Applicants are cryptographically bound to their session token; accessing another applicant's record returns HTTP 403 Forbidden.
5. **Human-in-the-Loop AI**: Assistive anomaly detection flags suspicious or duplicate applications without taking autonomous administrative action.
6. **Immutable Audit Logging**: Every enquiry, submission, approval, rejection, and enrollment records actor ID, previous state, new state, IP address, and timestamp.

---

## 6. Functional Requirements
- **FR-1 (Enquiries)**: Create, view, update status (`new`, `contacted`, `converted`, `closed`), and convert enquiries into applications.
- **FR-2 (Application Management)**: Multi-step wizard supporting personal profile, course preference, academic qualification records, draft saving, and final submission.
- **FR-3 (Merit Scoring & Ranking)**: Automated calculation of normalized scores based on 10th/12th/entrance records; automated ranking within academic programs.
- **FR-4 (Merit Publication)**: Administrative verification and controlled publication of merit ranks to applicants with data minimization (masking personal details).
- **FR-5 (Approval & Enrollment)**: Administrative approval/rejection with mandatory rejection reason; enrollment creation generating unique roll numbers and student user accounts.

---

## 7. Non-Functional Requirements
- **Security**: Zero tolerance for IDOR, SQL injection, XSS, CSRF, and broken access control.
- **Data Minimization**: Non-admin views hide internal reviewer notes, unpublished scores, and fellow applicants' private contact data.
- **Performance**: API responses under 100ms using parameterized Drizzle queries on Turso/SQLite.
- **Accessibility**: Keyboard navigable forms, explicit focus rings, screen reader labels, and compliance with modern web design standards.

---

## 8. Roles and Permissions
| Role | Create Enquiry | Submit App | View Own App | View All Apps | Approve/Reject | Calculate Merit | Publish Merit | Enroll Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Admin** | Yes | Yes | Yes | Yes | **Yes** | **Yes** | **Yes** | **Yes** |
| **Applicant / Student** | Yes | Yes | **Yes (Own Only)** | No | **No** | No | No | **No** |
| **Faculty** | No | No | No | No | **No** | No | No | **No** |

---

## 9. Workflow State Machine
```text
      [ DRAFT ]
          │
          ▼ (Applicant Submits)
    [ SUBMITTED ]
          │
          ▼ (Admin Evaluation / Merit Rank)
  [ UNDER_REVIEW ]
     │          │
     ▼          ▼
[ APPROVED ]  [ REJECTED ]
     │
     ▼ (Admin Enrolls)
 [ ENROLLED ]
```
- Illegal transitions (e.g. `DRAFT -> ENROLLED`, `SUBMITTED -> ENROLLED`, `REJECTED -> ENROLLED`) are strictly blocked by `validateStateTransition()`.

---

## 10. Data Requirements
- **Enquiry**: Full name, email, phone, interested program, enquiry date, status.
- **Application**: Legal name, verified email, phone, DOB, address, program applied for, qualification records (10th/12th percentages, entrance exam rank), status, merit score, merit rank, approval metadata.
- **Enrollment**: Unique enrollment ID, user ID, roll number, academic year, program, active status.

---

## 11. Database Design
- **`admission_enquiries`**: Primary key `id` (text), `email`, `full_name`, `phone`, `interested_program`, `status`, `created_at`, `updated_at`.
- **`admission_applications`**: Primary key `id`, foreign key `enquiry_id`, `student_id`, `email`, `full_name`, `date_of_birth`, `address`, `phone`, `program_applied_for`, `qualifications` (JSON string), `status`, `merit_score`, `merit_rank`, `is_merit_published`, `approved_by`, `approval_date`, `rejection_reason`, timestamps.
- **`merit_lists`**: Primary key `id`, `program`, `academic_year`, `generated_by`, `is_verified`, `is_published`, `published_at`, timestamps.
- **`enrolled_students`**: Primary key `id`, foreign key `user_id` (unique), `application_id`, `enrollment_number` (unique), `roll_number` (unique), `program`, `batch`, `is_active`, timestamps.

---

## 12. API Design
- `POST /api/admissions/enquiries`: Create new admission enquiry.
- `GET /api/admissions/enquiries`: List enquiries (admin sees all; student sees own).
- `PATCH /api/admissions/enquiry/:id/status`: Update enquiry status (admin only).
- `POST /api/admissions/applications`: Create draft application.
- `GET /api/admissions/applications`: List applications (role-filtered).
- `GET /api/admissions/application/:id`: Detail view with IDOR ownership check.
- `PUT /api/admissions/application/:id`: Update draft application (owner only, draft state only).
- `POST /api/admissions/application/:id/submit`: Submit draft for formal review.
- `POST /api/admissions/merit/calculate`: Calculate and rank applicants (admin only).
- `POST /api/admissions/merit/publish`: Publish verified merit list (admin only).
- `GET /api/admissions/merit/list`: View official ranking.
- `POST /api/admissions/approve`: Approve application (admin only).
- `POST /api/admissions/reject`: Reject application with mandatory reason (admin only).
- `POST /api/admissions/enroll`: Enroll approved student and provision user account (admin only).
- `GET /api/admissions/metrics`: Admissions conversion and volume analytics (admin only).

---

## 13. AI Use Case (Defensive Anomaly Detection)
Assistive intelligence to identify suspicious application patterns, duplicate identity submissions, disposable email domains, and impossible qualification scores.

---

## 14. AI Input / Process / Output
- **Input**: Applicant submission data (name, email domain, phone format, claimed percentage scores).
- **Process**: Heuristic and rule-based anomaly scoring evaluating risk vectors.
- **Output**: `AnomalyReport` object containing `isSuspicious` (boolean), `riskLevel` (`LOW`, `MEDIUM`, `HIGH`), and detailed reasons for review.

---

## 15. Human Approval (Human-in-the-Loop)
The assistive AI system **never automatically rejects or approves applications**. It attaches an anomaly indicator to the application record. The decision to advance or reject a flagged application rests exclusively with authorized human admissions officers.

---

## 16. Security Controls
1. **Authentication**: Signed JWT in secure `httpOnly` cookies.
2. **RBAC**: Centralized `requireRole(c, ["admin"])` authorization guard.
3. **IDOR Defense**: `assertAdmissionsOwnership()` blocks cross-applicant access.
4. **Mass Assignment**: `sanitizeApplicationPayload()` strips privileged fields.
5. **SQL Injection Defense**: 100% parameterized queries via Drizzle ORM.
6. **XSS Defense**: Input validated by Zod and rendered as escaped text.
7. **Audit Trail**: Tamper-evident logging to `audit_logs` table.

---

## 17. Reports & Dashboard
The Admissions Dashboard provides real-time operational statistics:
- Total Enquiries and Uncontacted Enquiries.
- Applications Volume by Status (Draft, Submitted, Under Review, Approved, Enrolled).
- Aggregate Conversion Rate from Initial Enquiry to Enrolled Student.
- Program popularity distribution.

---

## 18. Testing
- **Unit Tests**: `module-1-admissions/tests/unit/validation.test.ts`
- **Security Tests**: `module-1-admissions/tests/security/admissions-security.test.ts`
- **Demonstration Suite**: `scripts/demo-security.ts` (Demo 1, Demo 2, Demo 4, Demo 6, Demo 7)

---

## 19. Risks & Mitigation
- **Risk**: Unauthorized applicant enrollment or grade inflation.
  - **Mitigation**: Server-side role checks, mass assignment sanitization, and workflow state transition validation.
- **Risk**: Information disclosure of fellow applicants' personal data.
  - **Mitigation**: Server-side field minimization and IDOR ownership assertions.

---

## 20. Expected Outcomes
A hardened, modern admissions platform where prospective students can safely apply, and administrators can evaluate, rank, and enroll candidates without exposure to OWASP Top 10 vulnerabilities.
