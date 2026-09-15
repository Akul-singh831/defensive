# Turso Database Setup and Configuration Guide

This guide documents the setup, schema synchronization, database seeding, and credentials for the Turso SQLite edge database in this project.

---

## 1. Architecture Overview

- **Database Engine:** LibSQL / SQLite at the edge (Turso Cloud)
- **Client Library:** `@libsql/client` with `drizzle-orm/libsql`
- **Dialect:** `turso` (configured in `drizzle.config.ts`)
- **Isolation:** Shared schema in `lib/schema.ts` with prefixing and modular logic
- **Fallback Support:** If `TURSO_DATABASE_URL` is omitted, `lib/turso.ts` falls back to `file:local.db` for offline testing

---

## 2. Environment Configuration

The Turso credentials are configured in `.env.local`:

```bash
# ===== TURSO DATABASE =====
TURSO_DATABASE_URL=libsql://data-akul.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI...

# ===== JWT SECRET =====
JWT_SECRET=d0b32155de38933f6f9503ad069b344068ec8a3d70d8bb4af646ac3372fb49a4
```

To create your own Turso database if desired:
1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Authenticate: `turso auth login`
3. Create database: `turso db create defensive-db`
4. Get database URL: `turso db show defensive-db --url`
5. Generate access token: `turso db tokens create defensive-db`

---

## 3. Database Commands

| Command | Action | Description |
| :--- | :--- | :--- |
| `bun run db:push` | Schema Sync | Pushes `lib/schema.ts` directly to Turso without interactive prompts |
| `bun run db:sync` | Schema Sync | Alias to `drizzle-kit push` for continuous deployment |
| `bun run db:seed` | Data Seed | Idempotently populates initial users, courses, subjects, and demo records |
| `bun run turso:setup` | Health Check | Runs connectivity test, measures latency, displays table counts and credentials |

---

## 4. Default Seed Accounts

All accounts use industry standard `bcryptjs` hashing (12 salt rounds):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@university.edu` | `AdminPass123!` | Full access to Admissions & Academic Management |
| **Faculty 1** | `faculty1@university.edu` | `FacultyPass123!` | Access to assigned courses (`CS101`, `CS201`), marks, attendance |
| **Faculty 2** | `faculty2@university.edu` | `FacultyPass123!` | Access to assigned courses (`CYB301`, `CYB302`), marks, attendance |
| **Student 1** | `student1@university.edu` | `StudentPass123!` | View own courses, grades, and attendance (`CS2026001`) |
| **Student 2** | `student2@university.edu` | `StudentPass123!` | View own courses, grades, and attendance (`CYB2026002`) |

---

## 5. Seeded Records Summary

- **Users:** 5 accounts (1 admin, 2 faculty, 2 students)
- **Courses:** 4 foundational courses (`CS101`, `CS201`, `CYB301`, `CYB302`)
- **Subjects:** 4 curriculum subjects linked to course IDs
- **Course Assignments:** 4 faculty-to-section teaching assignments
- **Enrolled Students:** 2 student profiles with enrollment and roll numbers
- **Timetable Schedules:** 2 scheduled classes with collision-free rooms and time slots
- **Syllabi:** 2 complete curriculum syllabi
- **Assessments & Marks:** Midterm exam and Quiz with recorded marks
- **Attendance:** Sample verified attendance sessions
- **Admissions:** 3 sample enquiries and 3 applications across various workflow stages

---

## 6. Verification and Health Check

Run the setup and health check utility at any time:

```bash
bun run turso:setup
```

Output confirms:
- Connection status and roundtrip latency
- Total tables found (16 tables)
- Exact record counts per table
- Default login credentials for testing
