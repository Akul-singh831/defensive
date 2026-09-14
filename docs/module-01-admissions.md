# Module 1: Admissions

**Status:** ✅ Complete  
**Team:** Team 1  
**Created:** 2026-08-25  
**Last Updated:** 2026-08-25

## Overview

The Admissions module manages the complete student admission workflow from initial enquiry through enrollment. It implements role-based access control (RBAC) with three roles:

- **Student**: Can submit enquiries and view their own applications
- **Teacher**: Can view student applications (read-only)
- **Admin**: Full management of enquiries, applications, approvals, rejections, and enrollments

---

## Database Schema

### Tables

#### `admissionEnquiries`
Stores initial student interest expressions before formal applications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `email` | TEXT | UNIQUE | Student email address |
| `fullName` | TEXT | NOT NULL | Full name of enquirer |
| `phone` | TEXT | NOT NULL | Contact phone number |
| `interestedProgram` | TEXT | NOT NULL | Program of interest |
| `enquiryDate` | TIMESTAMP | NOT NULL | When enquiry was submitted |
| `status` | TEXT | "new" \| "contacted" \| "closed" | Current enquiry status |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `admissionApplications`
Formal application for admission with detailed information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `enquiryId` | TEXT | FOREIGN KEY → `admissionEnquiries.id` | Related enquiry |
| `studentId` | TEXT | FOREIGN KEY → `users.id` (nullable) | Enrolled student reference |
| `email` | TEXT | NOT NULL | Application email |
| `fullName` | TEXT | NOT NULL | Applicant full name |
| `dateOfBirth` | TEXT | NOT NULL | ISO date format |
| `address` | TEXT | NOT NULL | Residential address |
| `phone` | TEXT | NOT NULL | Contact number |
| `programAppliedFor` | TEXT | NOT NULL | Program name |
| `qualifications` | JSON | NOT NULL | Previous qualifications array |
| `applicationDate` | TIMESTAMP | NOT NULL | Submission date |
| `status` | TEXT | "pending" \| "approved" \| "rejected" \| "enrolled" | Application state |
| `approvedBy` | TEXT | FOREIGN KEY → `users.id` (nullable) | Admin who approved |
| `approvalDate` | TIMESTAMP | nullable | Approval timestamp |
| `rejectionReason` | TEXT | nullable | Why application was rejected |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

#### `enrolledStudents`
Active student enrollments linking to user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID) |
| `userId` | TEXT | UNIQUE, FOREIGN KEY → `users.id` | Enrolled user |
| `enrollmentDate` | TIMESTAMP | NOT NULL | Date of enrollment |
| `program` | TEXT | NOT NULL | Program name |
| `batch` | TEXT | NOT NULL | Cohort/batch identifier |
| `rollNumber` | TEXT | UNIQUE | Student roll number |
| `isActive` | BOOLEAN | DEFAULT true | Active enrollment flag |
| `createdAt` | TIMESTAMP | NOT NULL | Record creation time |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update time |

---

## API Endpoints

### Public Endpoints (No Auth)

#### POST `/api/admissions/create-enquiry`
Submit a new admission enquiry.

**Request Body:**
```json
{
  "email": "student@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "interestedProgram": "Bachelor of Science in Computer Science"
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-here",
    "email": "student@example.com",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "interestedProgram": "Bachelor of Science in Computer Science",
    "enquiryDate": "2026-08-25T10:30:00Z",
    "status": "new",
    "createdAt": "2026-08-25T10:30:00Z",
    "updatedAt": "2026-08-25T10:30:00Z"
  }
}
```

---

### Protected Endpoints (Auth Required)

#### GET `/api/admissions/enquiry/:id`
Retrieve a specific enquiry. Students see only their own (matched by email), admins see all.

**Auth:** `requireAuth()` - any role  
**Query Params:** None

**Response (200):**
```json
{
  "ok": true,
  "data": { /* enquiry object */ }
}
```

**Response (404):**
```json
{
  "error": "Enquiry not found"
}
```

---

#### GET `/api/admissions/enquiries`
List all enquiries accessible to the user.

**Auth:** `requireAuth()` - any role  
**Query Params:** None

**Response (200):**
```json
{
  "ok": true,
  "data": [ /* array of enquiry objects */ ]
}
```

---

#### POST `/api/admissions/create-application`
Create a formal application from an enquiry.

**Auth:** `requireAuth()` - any role  
**Query Params:** `enquiryId` (required)

**Request Body:**
```json
{
  "email": "student@example.com",
  "fullName": "John Doe",
  "dateOfBirth": "2000-01-15",
  "address": "123 Main St, City, Country",
  "phone": "+1234567890",
  "programAppliedFor": "Bachelor of Science in Computer Science",
  "qualifications": {
    "12thGrade": "A+",
    "entrance": "95"
  }
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-here",
    "enquiryId": "uuid-enquiry",
    "studentId": null,
    "email": "student@example.com",
    "fullName": "John Doe",
    "dateOfBirth": "2000-01-15",
    "address": "123 Main St, City, Country",
    "phone": "+1234567890",
    "programAppliedFor": "Bachelor of Science in Computer Science",
    "qualifications": { /* ... */ },
    "applicationDate": "2026-08-25T10:30:00Z",
    "status": "pending",
    "approvedBy": null,
    "approvalDate": null,
    "rejectionReason": null,
    "createdAt": "2026-08-25T10:30:00Z",
    "updatedAt": "2026-08-25T10:30:00Z"
  }
}
```

---

#### GET `/api/admissions/application/:id`
Retrieve a specific application. Students see only their own, admins see all.

**Auth:** `requireAuth()` - any role  
**Response:** Same structure as create-application response

---

#### GET `/api/admissions/applications`
List all applications accessible to the user.

**Auth:** `requireAuth()` - any role  
**Response (200):**
```json
{
  "ok": true,
  "data": [ /* array of application objects */ ]
}
```

---

#### POST `/api/admissions/approve`
Approve a pending application (admin only).

**Auth:** `requireRole(["admin"])`

**Request Body:**
```json
{
  "applicationId": "uuid-here",
  "approvalNotes": "Excellent qualifications"
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": { /* updated application with status: "approved" */ }
}
```

**Response (403):**
```json
{
  "error": "Forbidden: required role one of admin"
}
```

---

#### POST `/api/admissions/reject`
Reject a pending application (admin only).

**Auth:** `requireRole(["admin"])`

**Request Body:**
```json
{
  "applicationId": "uuid-here",
  "rejectionReason": "Qualifications do not meet program requirements"
}
```

**Response (200):**
```json
{
  "ok": true,
  "data": { /* updated application with status: "rejected" */ }
}
```

---

#### POST `/api/admissions/enroll`
Convert an approved application to an enrolled student (admin only).

**Auth:** `requireRole(["admin"])`

**Request Body:**
```json
{
  "applicationId": "uuid-here",
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "program": "Bachelor of Science in Computer Science",
  "batch": "2026-Fall",
  "rollNumber": "CS-2026-001"
}
```

**Response (201):**
```json
{
  "ok": true,
  "data": { /* updated application with status: "enrolled", new user created */ }
}
```

---

## RBAC Matrix

| Action | Student | Teacher | Admin |
|--------|---------|---------|-------|
| Submit enquiry | ✅ | ❌ | ❌ |
| View own enquiry | ✅ | ❌ | ✅ |
| View all enquiries | ❌ | ❌ | ✅ |
| Create application | ✅ | ❌ | ✅ |
| View own application | ✅ | ❌ | ✅ |
| View all applications | ❌ | ✅ (read-only) | ✅ |
| Approve application | ❌ | ❌ | ✅ |
| Reject application | ❌ | ❌ | ✅ |
| Enroll student | ❌ | ❌ | ✅ |

---

## UI Pages

### `/app/admissions/page.tsx` (Main Dashboard)
- Students: Display form to submit new enquiry + list of their applications
- Admins: Dashboard showing stats + list of all applications with action buttons

### `/app/admissions/enquiry/[id]/page.tsx` (Enquiry Detail)
- Display enquiry information
- Owner-only view (students see own, admins see all)

### `/app/admissions/application/[id]/page.tsx` (Application Detail)
- Display full application details
- If admin and status is "pending": Show approve/reject forms side-by-side
- If admin and status is "approved": Show enroll button

---

## Implementation Details

### Validation
All endpoints use Zod schemas for client and server-side validation:
- **Enquiry Schema**: email, fullName (min 2), phone (min 10), interestedProgram
- **Application Schema**: All enquiry fields + dateOfBirth (ISO), address (min 5), qualifications (JSON)
- **Approve Schema**: applicationId, approvalNotes (optional)
- **Reject Schema**: applicationId, rejectionReason (min 5)
- **Enroll Schema**: applicationId, email, password (min 8), firstName, lastName, program, batch, rollNumber

### Security Patterns
1. **Client Validation**: react-hook-form + zodResolver provides UX feedback
2. **Server Validation**: Every endpoint calls `schema.safeParse()` before DB operation
3. **Authentication**: `requireAuth(c)` from `lib/auth/guard.ts` verifies JWT in httpOnly cookie
4. **Authorization**: `requireRole(c, allowedRoles)` checks user role against endpoint requirements
5. **Ownership Checks**: Query functions verify user can access the resource (student by email match, admin all)

### Error Handling
```typescript
try {
  const user = await requireRole(c, ["admin"]);
  // ... operation
  return c.json({ ok: true, data: result }, 200);
} catch (error) {
  if (error instanceof AuthError) {
    return c.json({ error: error.message }, error.status);
  }
  return c.json({ error: "Operation failed" }, 500);
}
```

### Database Queries
All data access goes through `lib/admissions/queries.ts`:
- `createEnquiry(data)` - Insert enquiry
- `getEnquiry(id, user)` - Get with ownership check
- `listEnquiries(user)` - List visible to user
- `createApplication(data, enquiryId)` - Insert application
- `getApplication(id, user)` - Get with ownership check
- `listApplications(user)` - List visible to user
- `approveApplication(appId, adminId, notes?)` - Approve + audit log
- `rejectApplication(appId, reason, adminId)` - Reject + audit log
- `enrollStudent(data)` - Atomic: create user + enrolledStudent record + update application

---

## Testing Checklist

- [ ] Submit enquiry as anonymous user (no auth required)
- [ ] Submit enquiry as logged-in student
- [ ] Create application from enquiry as student
- [ ] Attempt to view other student's application (should fail)
- [ ] Approve application as admin
- [ ] Reject application as admin with reason
- [ ] Enroll approved student (creates user account, generates JWT)
- [ ] Verify enrolled student can log in with generated password
- [ ] Check audit logs for all admin actions
- [ ] Test form validation (client + server)

---

## Future Enhancements

1. **Bulk Upload**: Import applications from CSV/Excel
2. **Notifications**: Email notifications on application status changes
3. **Payment**: Integration with payment gateway for application fees
4. **Document Upload**: Accept supporting documents (transcripts, certificates)
5. **Interview Scheduling**: Automated interview slot booking
6. **Analytics**: Dashboard showing acceptance rates, demographics, etc.

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
- **Queries & Validation**: `lib/admissions/schemas.ts`, `lib/admissions/queries.ts`
- **API Routes**: `app/api/[[...route]]/route.ts` (Admissions section)
- **UI Pages**: `app/admissions/**`

---

## Related Documentation

- [Blue Team RBAC Contract](../docs/RBAC.md)
- [Auth System Documentation](../docs/AUTH.md)
- [API Patterns](../docs/API-PATTERNS.md)
- [Module 2: Academic](./module-02-academic.md)
