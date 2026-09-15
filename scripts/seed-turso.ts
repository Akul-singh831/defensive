import { db } from "../lib/turso";
import * as schema from "../lib/schema";
import { hashPassword } from "../lib/auth/password";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting Lamrin Tech Skills University Punjab (LTSU) database seed...");

  const now = new Date().toISOString();

  // 1. SEED SYSTEM USERS
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
      firstName: "LTSU",
      lastName: "Registrar",
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
      firstName: "Dr. Alan",
      lastName: "Turing (IBM Practice Lead)",
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
      firstName: "Dr. Grace",
      lastName: "Hopper (Tata Tech SME)",
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
      firstName: "Simran",
      lastName: "Kaur (LTSU Scholar)",
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
      firstName: "Gurpreet",
      lastName: "Singh",
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

  // 2. SEED LTSU ACADEMIC COURSES
  console.log("📚 Seeding LTSU academic & skill courses...");
  const seedCourses = [
    {
      id: "crs_ibm_ccv",
      code: "IBM-CCV101",
      name: "Cloud Computing & Virtualization (IBM)",
      credits: 4,
      program: "B.Tech CSE (Cloud Computing) - IBM",
      semester: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_ibm_aiml",
      code: "IBM-AIML201",
      name: "Artificial Intelligence & Deep Learning (IBM)",
      credits: 4,
      program: "B.Tech CSE (AI & Machine Learning) - IBM",
      semester: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_ibm_csdf",
      code: "IBM-CSDF101",
      name: "Cyber Security & Digital Forensics (IBM)",
      credits: 4,
      program: "B.Tech CSE (Cyber Security) - IBM",
      semester: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_tat_rob",
      code: "TAT-ROB101",
      name: "Industrial Robotics & Automation (Tata Tech)",
      credits: 4,
      program: "B.Tech Mechanical (Robotics & Automation) - Tata Tech",
      semester: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_tat_ev",
      code: "TAT-EV201",
      name: "Electric Vehicles & Advanced Mobility (Tata Tech)",
      credits: 4,
      program: "B.Tech Mechanical (Electric Vehicles) - Tata Tech",
      semester: 3,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_uscm_fin",
      code: "USCM-FIN101",
      name: "Financial Technology & Analytics (NSDC)",
      credits: 3,
      program: "BBA (Financial Technology) - NSDC",
      semester: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "crs_pharm_101",
      code: "RIP-PHARM101",
      name: "Pharmaceutical Chemistry & Pharmacology",
      credits: 4,
      program: "B.Pharmacy - Rayat Institute",
      semester: 1,
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
      console.log(`   + Created LTSU course: ${course.code} - ${course.name}`);
    } else {
      console.log(`   * LTSU course exists: ${course.code}`);
    }
  }

  // 3. SEED SUBJECTS
  console.log("📖 Seeding subjects & modules...");
  const seedSubjects = [
    {
      id: "sub_ibm_ccv",
      courseId: "crs_ibm_ccv",
      code: "SUB-IBM-CCV",
      name: "Enterprise Cloud Architecture & OpenShift",
      credits: 4,
      description: "IBM Cloud platform services, RedHat OpenShift containers, Kubernetes orchestration, and hybrid enterprise deployments",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sub_ibm_aiml",
      courseId: "crs_ibm_aiml",
      code: "SUB-IBM-AIML",
      name: "IBM Watson & Neural Networks",
      credits: 4,
      description: "Deep neural networks, computer vision, natural language understanding, and Watson API integrations",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sub_tat_rob",
      courseId: "crs_tat_rob",
      code: "SUB-TAT-ROB",
      name: "PLC Programming & Industrial Robotic Arms",
      credits: 4,
      description: "6-axis robot kinematics, Siemens/Allen-Bradley PLC programming, SCADA interfaces, and factory automation",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "sub_tat_ev",
      courseId: "crs_tat_ev",
      code: "SUB-TAT-EV",
      name: "EV Powertrains & Battery Thermal Management",
      credits: 4,
      description: "Lithium-ion chemistry, regenerative braking algorithms, inverter topologies, and vehicle CAN communication",
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

  // 4. SEED COURSE ASSIGNMENTS
  console.log("👨‍🏫 Seeding faculty assignments...");
  const seedAssignments = [
    {
      id: "asg_ibm_ccv_fac1",
      courseId: "crs_ibm_ccv",
      teacherId: "usr_faculty1",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "asg_tat_rob_fac2",
      courseId: "crs_tat_rob",
      teacherId: "usr_faculty2",
      sectionCode: "A",
      academicYear: "2026-2027",
      semester: 1,
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
      console.log(`   + Created assignment: Course ${asg.courseId} -> Faculty ${asg.teacherId}`);
    } else {
      console.log(`   * Assignment exists: ${asg.id}`);
    }
  }

  // 5. SEED ENROLLED STUDENTS
  console.log("🎓 Seeding enrolled students...");
  const seedEnrolledStudents = [
    {
      id: "enr_ltsu_001",
      userId: "usr_student1",
      applicationId: "app_ltsu_001",
      enrollmentNumber: "LTSU/2026/CSE/0142",
      enrollmentDate: now,
      program: "B.Tech CSE (Cloud Computing) - IBM",
      batch: "2026-2030",
      rollNumber: "260100142",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enr_ltsu_002",
      userId: "usr_student2",
      applicationId: "app_ltsu_002",
      enrollmentNumber: "LTSU/2026/ME/0089",
      enrollmentDate: now,
      program: "B.Tech Mechanical (Robotics & Automation) - Tata Tech",
      batch: "2026-2030",
      rollNumber: "260200089",
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

  // 6. SEED TIMETABLES (LTSU REAL LABS)
  console.log("⏰ Seeding practical skill lab schedules...");
  const seedTimetables = [
    {
      id: "tt_ibm_ccv_mon",
      courseId: "crs_ibm_ccv",
      subjectId: "sub_ibm_ccv",
      teacherId: "usr_faculty1",
      sectionCode: "A",
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "10:30",
      room: "Lab-IBM-01 (Cloud Innovation Center)",
      academicYear: "2026-2027",
      semester: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tt_tat_rob_tue",
      courseId: "crs_tat_rob",
      subjectId: "sub_tat_rob",
      teacherId: "usr_faculty2",
      sectionCode: "A",
      dayOfWeek: "Tuesday",
      startTime: "11:00",
      endTime: "12:30",
      room: "Workshop-TT-A (Tata Robotics & Smart Mfg)",
      academicYear: "2026-2027",
      semester: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "tt_ansys_wed",
      courseId: "crs_tat_ev",
      subjectId: "sub_tat_ev",
      teacherId: "usr_faculty2",
      sectionCode: "A",
      dayOfWeek: "Wednesday",
      startTime: "14:00",
      endTime: "15:30",
      room: "Lab-ANSYS-01 (Simulation Center)",
      academicYear: "2026-2027",
      semester: 3,
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

  // 7. SEED SYLLABI
  console.log("📋 Seeding LTSU industry-integrated syllabi...");
  const seedSyllabi = [
    {
      id: "syl_ibm_ccv",
      courseId: "crs_ibm_ccv",
      subjectId: "sub_ibm_ccv",
      teacherId: "usr_faculty1",
      content: "Unit 1: Cloud Architecture Foundations. Unit 2: Virtualization & Hypervisors. Unit 3: Containerization with Docker & Podman. Unit 4: RedHat OpenShift Enterprise Clusters. Unit 5: Industry Capstone Project with IBM Cloud Services.",
      objectives: "Equip students with enterprise-grade cloud deployment, serverless scaling, and microservices architecture certified by IBM.",
      textbooks: "Cloud Computing Architecture (IBM Redbooks), OpenShift in Action (Manning)",
      assessmentMethod: "Quizzes (20%), Practical Skill Lab Examination (30%), End Term Exam (50%)",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "syl_tat_rob",
      courseId: "crs_tat_rob",
      subjectId: "sub_tat_rob",
      teacherId: "usr_faculty2",
      content: "Unit 1: Industrial Robotics Fundamentals. Unit 2: Kinematic Models & End-Effectors. Unit 3: PLC Automation and SCADA Integration. Unit 4: Computer Vision for Pick-and-Place Systems. Unit 5: Industry 4.0 Smart Manufacturing Cell Implementation.",
      objectives: "Develop industry-ready engineers proficient in automated manufacturing lines and robotic cell operation directly supervised by Tata Technologies experts.",
      textbooks: "Industrial Robotics & Automation (Tata Technologies Press), Robot Modeling & Control (Spong)",
      assessmentMethod: "Continuous Lab Assessment (30%), Mid-Term Evaluation (20%), Final Project Demonstration (50%)",
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

  // 8. SEED ASSESSMENTS & MARKS
  console.log("📊 Seeding assessments & marks...");
  const seedAssessments = [
    {
      id: "asm_ibm_lab_eval",
      courseId: "crs_ibm_ccv",
      teacherId: "usr_faculty1",
      title: "IBM Cloud OpenShift Cluster Practical Exam",
      type: "midterm",
      maxMarks: 100,
      weightage: 30,
      dueDate: "2026-10-15",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "asm_tat_rob_quiz",
      courseId: "crs_tat_rob",
      teacherId: "usr_faculty2",
      title: "PLC Automation & Arm Kinematics Quiz",
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
      id: "mrk_simran_ibm",
      assessmentId: "asm_ibm_lab_eval",
      studentId: "usr_student1",
      courseId: "crs_ibm_ccv",
      assessmentType: "midterm",
      assessmentName: "IBM Cloud OpenShift Cluster Practical Exam",
      maxMarks: 100,
      marksObtained: 94,
      grade: "A+",
      feedbackNotes: "Exemplary zero-downtime cluster deployment and microservice routing.",
      recordedBy: "usr_faculty1",
      recordedAt: now,
      status: "published",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mrk_gurpreet_rob",
      assessmentId: "asm_tat_rob_quiz",
      studentId: "usr_student2",
      courseId: "crs_tat_rob",
      assessmentType: "quiz",
      assessmentName: "PLC Automation & Arm Kinematics Quiz",
      maxMarks: 25,
      marksObtained: 23,
      grade: "A",
      feedbackNotes: "Precise ladder logic diagrams and inverse kinematics calculations.",
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

  // 9. SEED ATTENDANCE RECORDS
  console.log("📅 Seeding attendance records...");
  const seedAttendance = [
    {
      id: "att_simran_day1",
      studentId: "usr_student1",
      courseId: "crs_ibm_ccv",
      classDate: "2026-09-08",
      status: "present",
      remarks: "Completed OpenShift container configuration lab on time",
      recordedBy: "usr_faculty1",
      recordedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "att_gurpreet_day1",
      studentId: "usr_student2",
      courseId: "crs_tat_rob",
      classDate: "2026-09-09",
      status: "present",
      remarks: "Demonstrated 6-axis robotic arm pick-and-place calibration",
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

  // 10. SEED ADMISSIONS ENQUIRIES & APPLICATIONS (LTSU-SET 2026)
  console.log("🏢 Seeding LTSU admission enquiries & applications...");
  const seedEnquiries = [
    {
      id: "enq_ltsu_001",
      email: "jaspreet.singh@example.com",
      fullName: "Jaspreet Singh",
      phone: "+91 98140-12345",
      interestedProgram: "B.Tech CSE (Cloud Computing) - IBM",
      enquiryDate: now,
      status: "converted",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enq_ltsu_002",
      email: "harleen.kaur@example.com",
      fullName: "Harleen Kaur",
      phone: "+91 98765-43210",
      interestedProgram: "B.Tech Mechanical (Robotics & Automation) - Tata Tech",
      enquiryDate: now,
      status: "contacted",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enq_ltsu_003",
      email: "rohan.sharma@example.com",
      fullName: "Rohan Sharma",
      phone: "+91 94170-55667",
      interestedProgram: "BBA (Financial Technology) - NSDC",
      enquiryDate: now,
      status: "new",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enq_ltsu_004",
      email: "navjot.kaur@example.com",
      fullName: "Navjot Kaur",
      phone: "+91 98888-22334",
      interestedProgram: "B.Pharmacy - Rayat Institute",
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
      id: "app_ltsu_001",
      enquiryId: "enq_ltsu_001",
      studentId: "usr_student1",
      email: "student1@university.edu",
      fullName: "Simran Kaur",
      dateOfBirth: "2006-03-14",
      address: "Model Town, Ropar, Punjab 140001",
      phone: "+91 98150-11223",
      programAppliedFor: "B.Tech CSE (Cloud Computing) - IBM",
      qualifications: JSON.stringify([
        { degree: "12th Standard (Non-Medical)", institution: "Punjab School Education Board", score: "96.4%", year: 2025 },
        { degree: "LTSU-SET 2026", institution: "Lamrin Tech Skills University", score: "Rank 8 (Percentile: 99.2)", year: 2026 }
      ]),
      applicationDate: "2026-08-15",
      status: "enrolled",
      meritScore: 96.4,
      meritRank: 1,
      isMeritPublished: true,
      approvedBy: "usr_admin",
      approvalDate: "2026-08-20",
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "app_ltsu_002",
      enquiryId: null,
      studentId: "usr_student2",
      email: "student2@university.edu",
      fullName: "Gurpreet Singh",
      dateOfBirth: "2005-11-20",
      address: "Urban Estate, Phase 2, Patiala, Punjab 147002",
      phone: "+91 98720-99881",
      programAppliedFor: "B.Tech Mechanical (Robotics & Automation) - Tata Tech",
      qualifications: JSON.stringify([
        { degree: "12th Standard (Non-Medical)", institution: "CBSE New Delhi", score: "91.8%", year: 2025 },
        { degree: "LTSU-SET 2026", institution: "Lamrin Tech Skills University", score: "Rank 24 (Percentile: 97.4)", year: 2026 }
      ]),
      applicationDate: "2026-08-18",
      status: "enrolled",
      meritScore: 91.8,
      meritRank: 2,
      isMeritPublished: true,
      approvedBy: "usr_admin",
      approvalDate: "2026-08-21",
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "app_ltsu_003",
      enquiryId: "enq_ltsu_002",
      studentId: null,
      email: "harleen.kaur@example.com",
      fullName: "Harleen Kaur",
      dateOfBirth: "2006-07-09",
      address: "Sector 70, Mohali, Punjab 160071",
      phone: "+91 98765-43210",
      programAppliedFor: "B.Tech Mechanical (Robotics & Automation) - Tata Tech",
      qualifications: JSON.stringify([
        { degree: "12th Standard (Non-Medical)", institution: "ICSE Council", score: "88.5%", year: 2025 }
      ]),
      applicationDate: "2026-09-01",
      status: "under_review",
      meritScore: 88.5,
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

  // 11. AUDIT LOG ENTRY
  console.log("🛡️ Recording LTSU initialization audit entry...");
  const auditId = `aud_ltsu_${Date.now()}`;
  await db.insert(schema.auditLogs).values({
    id: auditId,
    actorId: "usr_admin",
    actorRole: "admin",
    action: "LTSU_CAMPUS_SEED_SYNCHRONIZED",
    resourceType: "database",
    resourceId: "turso",
    previousState: "GENERIC_DATA",
    newState: "LTSU_AUTHENTIC_ANCHORS",
    details: JSON.stringify({
      institution: "Lamrin Tech Skills University Punjab",
      partners: ["IBM", "Tata Technologies", "Ansys", "NSDC"],
      coursesSeeded: seedCourses.length,
      applicationsSeeded: seedApplications.length,
    }),
    ipAddress: "127.0.0.1",
    result: "SUCCESS",
    timestamp: now,
  });

  console.log("✅ Lamrin Tech Skills University Punjab database synchronization completed!");
}

seed().catch((err) => {
  console.error("❌ Seed failed with error:", err);
  process.exit(1);
});
