import { db } from "../lib/turso";
import * as schema from "../lib/schema";
import { hashPassword } from "../lib/auth/password";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting Turso database seed...");

  const now = new Date().toISOString();

  // 1. SEED USERS
  console.log("👤 Seeding system users (Admin, Faculty, Students)...");
  
  const adminPassHash = await hashPassword("AdminPass123!");
  const facultyPassHash = await hashPassword("FacultyPass123!");
  const studentPassHash = await hashPassword("StudentPass123!");

  const seedUsers = [
    {
      id: "usr_admin",
      email: "admin@university.edu",
      passwordHash: adminPassHash,
      role: "admin",
      firstName: "System",
      lastName: "Administrator",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_faculty1",
      email: "faculty1@university.edu",
      passwordHash: facultyPassHash,
      role: "teacher",
      firstName: "Alan",
      lastName: "Turing",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_faculty2",
      email: "faculty2@university.edu",
      passwordHash: facultyPassHash,
      role: "teacher",
      firstName: "Grace",
      lastName: "Hopper",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_student1",
      email: "student1@university.edu",
      passwordHash: studentPassHash,
      role: "student",
      firstName: "Alice",
      lastName: "Smith",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_student2",
      email: "student2@university.edu",
      passwordHash: studentPassHash,
      role: "student",
      firstName: "Bob",
      lastName: "Johnson",
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const user of seedUsers) {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, user.email))
      .get();

    if (!existing) {
      await db.insert(schema.users).values(user);
      console.log(`   + Created user: ${user.email} (${user.role})`);
    } else {
      console.log(`   * User exists: ${user.email}`);
    }
  }

  // 2. SEED COURSES
  console.log("📚 Seeding academic courses...");
  const seedCourses = [
    {
      id: "crs_cs101",
      code: "CS101",
      name: "Introduction to Computer Science",
      credits: 3,
      program: "Computer Science",
      semester: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_cs201",
      code: "CS201",
      name: "Data Structures and Algorithms",
      credits: 4,
      program: "Computer Science",
      semester: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_cyb301",
      code: "CYB301",
      name: "Network Security and Cryptography",
      credits: 4,
      program: "Cybersecurity",
      semester: 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_cyb302",
      code: "CYB302",
      name: "Ethical Hacking and Penetration Testing",
      credits: 4,
      program: "Cybersecurity",
      semester: 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const course of seedCourses) {
    const existing = await db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.code, course.code))
      .get();

    if (!existing) {
      await db.insert(schema.courses).values(course);
      console.log(`   + Created course: ${course.code} - ${course.name}`);
    } else {
      console.log(`   * Course exists: ${course.code}`);
    }
  }

  // 3. SEED SUBJECTS
  console.log("📖 Seeding subjects...");
  const seedSubjects = [
    {
      id: "sub_cs101",
      courseId: "crs_cs101",
      code: "SUB-CS101",
      name: "Foundations of Computing",
      credits: 3,
      description: "Fundamental programming concepts, hardware architecture, and problem solving",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sub_cs201",
      courseId: "crs_cs201",
      code: "SUB-CS201",
      name: "Advanced Data Structures",
      credits: 4,
      description: "Trees, graphs, dynamic programming, and asymptotic complexity analysis",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sub_cyb301",
      courseId: "crs_cyb301",
      code: "SUB-CYB301",
      name: "Cryptography Principles",
      credits: 4,
      description: "Symmetric and asymmetric encryption, public key infrastructure, and hash integrity",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sub_cyb302",
      courseId: "crs_cyb302",
      code: "SUB-CYB302",
      name: "Offensive Security and Penetration Testing",
      credits: 4,
      description: "Vulnerability assessment, privilege escalation, and defensive remediation",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const sub of seedSubjects) {
    const existing = await db
      .select()
      .from(schema.subjects)
      .where(eq(schema.subjects.code, sub.code))
      .get();

    if (!existing) {
      await db.insert(schema.subjects).values(sub);
      console.log(`   + Created subject: ${sub.code} - ${sub.name}`);
    } else {
      console.log(`   * Subject exists: ${sub.code}`);
    }
  }

  // 4. SEED COURSE ASSIGNMENTS (FACULTY TO SECTION)
  console.log("👨‍🏫 Seeding course assignments...");
  const seedAssignments = [
    {
      id: "asg_cs101_fac1",
      courseId: "crs_cs101",
      teacherId: "usr_faculty1",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "asg_cs201_fac1",
      courseId: "crs_cs201",
      teacherId: "usr_faculty1",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "asg_cyb301_fac2",
      courseId: "crs_cyb301",
      teacherId: "usr_faculty2",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "asg_cyb302_fac2",
      courseId: "crs_cyb302",
      teacherId: "usr_faculty2",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 5,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const asg of seedAssignments) {
    const existing = await db
      .select()
      .from(schema.courseAssignments)
      .where(eq(schema.courseAssignments.id, asg.id))
      .get();

    if (!existing) {
      await db.insert(schema.courseAssignments).values(asg);
      console.log(`   + Created assignment: Course ${asg.courseId} -> Faculty ${asg.teacherId} (Sec ${asg.sectionCode})`);
    } else {
      console.log(`   * Assignment exists: ${asg.id}`);
    }
  }

  // 5. SEED ENROLLED STUDENTS
  console.log("🎓 Seeding enrolled students...");
  const seedEnrolledStudents = [
    {
      id: "enr_student1",
      userId: "usr_student1",
      applicationId: "app_seed_001",
      enrollmentNumber: "ENR-2026-001",
      enrollmentDate: now,
      program: "Computer Science",
      batch: "2026-2030",
      rollNumber: "CS2026001",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enr_student2",
      userId: "usr_student2",
      applicationId: "app_seed_002",
      enrollmentNumber: "ENR-2026-002",
      enrollmentDate: now,
      program: "Cybersecurity",
      batch: "2026-2030",
      rollNumber: "CYB2026002",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const enr of seedEnrolledStudents) {
    const existing = await db
      .select()
      .from(schema.enrolledStudents)
      .where(eq(schema.enrolledStudents.userId, enr.userId))
      .get();

    if (!existing) {
      await db.insert(schema.enrolledStudents).values(enr);
      console.log(`   + Enrolled student: ${enr.rollNumber} (${enr.program})`);
    } else {
      console.log(`   * Enrolled student exists: ${enr.rollNumber}`);
    }
  }

  // 6. SEED STUDENT COURSE ENROLLMENTS
  console.log("📝 Seeding student course enrollments...");
  const seedStudentEnrollments = [
    {
      id: "stdenr_1_cs101",
      studentId: "usr_student1",
      courseId: "crs_cs101",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 1,
      enrollmentDate: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "stdenr_2_cyb301",
      studentId: "usr_student2",
      courseId: "crs_cyb301",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 5,
      enrollmentDate: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const senr of seedStudentEnrollments) {
    const existing = await db
      .select()
      .from(schema.studentEnrollments)
      .where(eq(schema.studentEnrollments.id, senr.id))
      .get();

    if (!existing) {
      await db.insert(schema.studentEnrollments).values(senr);
      console.log(`   + Student enrollment: Student ${senr.studentId} in Course ${senr.courseId}`);
    } else {
      console.log(`   * Student enrollment exists: ${senr.id}`);
    }
  }

  // 7. SEED TIMETABLES
  console.log("⏰ Seeding timetable schedules...");
  const seedTimetables = [
    {
      id: "tt_cs101_mon",
      courseId: "crs_cs101",
      subjectId: "sub_cs101",
      teacherId: "usr_faculty1",
      sectionCode: "A",
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "10:30",
      room: "Lab-301",
      academicYear: "2026-2027",
      semester: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tt_cyb301_tue",
      courseId: "crs_cyb301",
      subjectId: "sub_cyb301",
      teacherId: "usr_faculty2",
      sectionCode: "A",
      dayOfWeek: "Tuesday",
      startTime: "11:00",
      endTime: "12:30",
      room: "Cyber-Lab-2",
      academicYear: "2026-2027",
      semester: 5,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const tt of seedTimetables) {
    const existing = await db
      .select()
      .from(schema.timetables)
      .where(eq(schema.timetables.id, tt.id))
      .get();

    if (!existing) {
      await db.insert(schema.timetables).values(tt);
      console.log(`   + Timetable slot: ${tt.dayOfWeek} ${tt.startTime}-${tt.endTime} (${tt.room})`);
    } else {
      console.log(`   * Timetable slot exists: ${tt.id}`);
    }
  }

  // 8. SEED SYLLABI
  console.log("📋 Seeding syllabi...");
  const seedSyllabi = [
    {
      id: "syl_cs101",
      courseId: "crs_cs101",
      subjectId: "sub_cs101",
      teacherId: "usr_faculty1",
      content: "Module 1: Intro to Binary Logic. Module 2: Control Flow. Module 3: Functions & Memory.",
      objectives: "Develop structural problem solving using high level languages.",
      textbooks: "Introduction to Computation and Programming Using Python (Guttag)",
      assessmentMethod: "Quizzes (20%), Midterm (30%), Final Exam (50%)",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "syl_cyb301",
      courseId: "crs_cyb301",
      subjectId: "sub_cyb301",
      teacherId: "usr_faculty2",
      content: "Module 1: Classical Ciphers. Module 2: Block Ciphers & AES. Module 3: Asymmetric RSA & ECC. Module 4: Hash Functions & Zero Knowledge Proofs.",
      objectives: "Understand mathematical underpinnings and practical implementation of modern cryptography.",
      textbooks: "Cryptography and Network Security (William Stallings)",
      assessmentMethod: "Lab Exercises (30%), Midterm (30%), Term Project (40%)",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const syl of seedSyllabi) {
    const existing = await db
      .select()
      .from(schema.syllabi)
      .where(eq(schema.syllabi.id, syl.id))
      .get();

    if (!existing) {
      await db.insert(schema.syllabi).values(syl);
      console.log(`   + Syllabus created for Course ${syl.courseId}`);
    } else {
      console.log(`   * Syllabus exists: ${syl.id}`);
    }
  }

  // 9. SEED ASSESSMENTS AND MARKS
  console.log("📊 Seeding assessments and marks...");
  const seedAssessments = [
    {
      id: "asm_cs101_mid",
      courseId: "crs_cs101",
      teacherId: "usr_faculty1",
      title: "CS101 Midterm Examination",
      type: "midterm",
      maxMarks: 100,
      weightage: 30,
      dueDate: "2026-10-15",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "asm_cyb301_quiz1",
      courseId: "crs_cyb301",
      teacherId: "usr_faculty2",
      title: "Cryptography Quiz 1",
      type: "quiz",
      maxMarks: 25,
      weightage: 10,
      dueDate: "2026-09-30",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const asm of seedAssessments) {
    const existing = await db
      .select()
      .from(schema.assessments)
      .where(eq(schema.assessments.id, asm.id))
      .get();

    if (!existing) {
      await db.insert(schema.assessments).values(asm);
      console.log(`   + Assessment created: ${asm.title}`);
    } else {
      console.log(`   * Assessment exists: ${asm.id}`);
    }
  }

  const seedMarks = [
    {
      id: "mrk_std1_mid",
      assessmentId: "asm_cs101_mid",
      studentId: "usr_student1",
      courseId: "crs_cs101",
      assessmentType: "midterm",
      assessmentName: "CS101 Midterm Examination",
      maxMarks: 100,
      marksObtained: 92,
      grade: "A",
      feedbackNotes: "Outstanding algorithmic efficiency and clean structure.",
      recordedBy: "usr_faculty1",
      recordedAt: now,
      status: "published",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mrk_std2_quiz1",
      assessmentId: "asm_cyb301_quiz1",
      studentId: "usr_student2",
      courseId: "crs_cyb301",
      assessmentType: "quiz",
      assessmentName: "Cryptography Quiz 1",
      maxMarks: 25,
      marksObtained: 24,
      grade: "A+",
      feedbackNotes: "Flawless modular arithmetic and cipher breakdown.",
      recordedBy: "usr_faculty2",
      recordedAt: now,
      status: "published",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const mrk of seedMarks) {
    const existing = await db
      .select()
      .from(schema.internalMarks)
      .where(eq(schema.internalMarks.id, mrk.id))
      .get();

    if (!existing) {
      await db.insert(schema.internalMarks).values(mrk);
      console.log(`   + Mark recorded for student ${mrk.studentId}: ${mrk.marksObtained}/${mrk.maxMarks}`);
    } else {
      console.log(`   * Mark exists: ${mrk.id}`);
    }
  }

  // 10. SEED ATTENDANCE RECORDS
  console.log("📅 Seeding attendance records...");
  const seedAttendance = [
    {
      id: "att_std1_day1",
      studentId: "usr_student1",
      courseId: "crs_cs101",
      classDate: "2026-09-08",
      status: "present",
      remarks: "On time and participated actively in lab exercises",
      recordedBy: "usr_faculty1",
      recordedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "att_std2_day1",
      studentId: "usr_student2",
      courseId: "crs_cyb301",
      classDate: "2026-09-09",
      status: "present",
      remarks: "Completed cryptanalysis demonstration",
      recordedBy: "usr_faculty2",
      recordedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const att of seedAttendance) {
    const existing = await db
      .select()
      .from(schema.attendanceRecords)
      .where(eq(schema.attendanceRecords.id, att.id))
      .get();

    if (!existing) {
      await db.insert(schema.attendanceRecords).values(att);
      console.log(`   + Attendance recorded: Student ${att.studentId} (${att.status})`);
    } else {
      console.log(`   * Attendance exists: ${att.id}`);
    }
  }

  // 11. SEED ADMISSIONS ENQUIRIES & APPLICATIONS
  console.log("🏢 Seeding admission enquiries & applications...");
  const seedEnquiries = [
    {
      id: "enq_seed_001",
      email: "david.miller@example.com",
      fullName: "David Miller",
      phone: "555-0199",
      interestedProgram: "Cybersecurity",
      enquiryDate: now,
      status: "converted",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enq_seed_002",
      email: "elena.rostova@example.com",
      fullName: "Elena Rostova",
      phone: "555-0188",
      interestedProgram: "Computer Science",
      enquiryDate: now,
      status: "contacted",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enq_seed_003",
      email: "frank.wright@example.com",
      fullName: "Frank Wright",
      phone: "555-0177",
      interestedProgram: "Computer Science",
      enquiryDate: now,
      status: "new",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const enq of seedEnquiries) {
    const existing = await db
      .select()
      .from(schema.admissionEnquiries)
      .where(eq(schema.admissionEnquiries.email, enq.email))
      .get();

    if (!existing) {
      await db.insert(schema.admissionEnquiries).values(enq);
      console.log(`   + Admission enquiry: ${enq.fullName} (${enq.status})`);
    } else {
      console.log(`   * Enquiry exists: ${enq.email}`);
    }
  }

  const seedApplications = [
    {
      id: "app_seed_001",
      enquiryId: "enq_seed_001",
      studentId: "usr_student1",
      email: "student1@university.edu",
      fullName: "Alice Smith",
      dateOfBirth: "2005-04-12",
      address: "42 Turing Way, Cambridge",
      phone: "555-0123",
      programAppliedFor: "Computer Science",
      qualifications: JSON.stringify([
        { degree: "High School Diploma", institution: "North Academy", score: "94.5%", year: 2024 }
      ]),
      applicationDate: "2026-08-15",
      status: "enrolled",
      meritScore: 94.5,
      meritRank: 1,
      isMeritPublished: true,
      approvedBy: "usr_admin",
      approvalDate: "2026-08-20",
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "app_seed_002",
      enquiryId: null,
      studentId: "usr_student2",
      email: "student2@university.edu",
      fullName: "Bob Johnson",
      dateOfBirth: "2004-11-23",
      address: "88 Hopper Ave, Arlington",
      phone: "555-0144",
      programAppliedFor: "Cybersecurity",
      qualifications: JSON.stringify([
        { degree: "High School Diploma", institution: "West High", score: "89.0%", year: 2024 }
      ]),
      applicationDate: "2026-08-18",
      status: "enrolled",
      meritScore: 89.0,
      meritRank: 2,
      isMeritPublished: true,
      approvedBy: "usr_admin",
      approvalDate: "2026-08-21",
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "app_seed_003",
      enquiryId: "enq_seed_002",
      studentId: null,
      email: "elena.rostova@example.com",
      fullName: "Elena Rostova",
      dateOfBirth: "2005-07-09",
      address: "15 Cyber Square, Seattle",
      phone: "555-0188",
      programAppliedFor: "Computer Science",
      qualifications: JSON.stringify([
        { degree: "High School Diploma", institution: "St. Jude Collegiate", score: "91.2%", year: 2025 }
      ]),
      applicationDate: "2026-09-01",
      status: "under_review",
      meritScore: 91.2,
      meritRank: null,
      isMeritPublished: false,
      approvedBy: null,
      approvalDate: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const app of seedApplications) {
    const existing = await db
      .select()
      .from(schema.admissionApplications)
      .where(eq(schema.admissionApplications.id, app.id))
      .get();

    if (!existing) {
      await db.insert(schema.admissionApplications).values(app);
      console.log(`   + Admission application: ${app.fullName} (${app.status})`);
    } else {
      console.log(`   * Application exists: ${app.id}`);
    }
  }

  // 12. AUDIT LOG SEED ENTRY
  console.log("🛡️ Seeding initial audit trail...");
  const auditId = `aud_seed_${Date.now()}`;
  await db.insert(schema.auditLogs).values({
    id: auditId,
    actorId: "usr_admin",
    actorRole: "admin",
    action: "DATABASE_INITIALIZATION_SEEDED",
    resourceType: "database",
    resourceId: "turso",
    previousState: "EMPTY",
    newState: "SEEDED",
    details: JSON.stringify({
      users: seedUsers.length,
      courses: seedCourses.length,
      enquiries: seedEnquiries.length,
      applications: seedApplications.length,
    }),
    ipAddress: "127.0.0.1",
    result: "SUCCESS",
    timestamp: now,
  });

  console.log("✅ Turso database seed completed successfully!");
}

seed().catch((err) => {
  console.error("❌ Seed failed with error:", err);
  process.exit(1);
});
