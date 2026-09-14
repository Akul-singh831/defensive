CREATE TABLE `admission_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`enquiry_id` text NOT NULL,
	`student_id` text,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`program_applied_for` text NOT NULL,
	`qualifications` text NOT NULL,
	`application_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`approved_by` text,
	`approval_date` text,
	`rejection_reason` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admission_enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`interested_program` text NOT NULL,
	`enquiry_date` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admission_enquiries_email_unique` ON `admission_enquiries` (`email`);--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`course_id` text NOT NULL,
	`class_date` text NOT NULL,
	`status` text DEFAULT 'absent' NOT NULL,
	`remarks` text,
	`recorded_by` text NOT NULL,
	`recorded_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`role` text,
	`action` text NOT NULL,
	`module` text,
	`details` text,
	`ip_address` text,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `course_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`teacher_id` text NOT NULL,
	`section_code` text NOT NULL,
	`academic_year` text NOT NULL,
	`semester` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`credits` integer NOT NULL,
	`program` text NOT NULL,
	`semester` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_code_unique` ON `courses` (`code`);--> statement-breakpoint
CREATE TABLE `enrolled_students` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`enrollment_date` text NOT NULL,
	`program` text NOT NULL,
	`batch` text NOT NULL,
	`roll_number` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrolled_students_user_id_unique` ON `enrolled_students` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `enrolled_students_roll_number_unique` ON `enrolled_students` (`roll_number`);--> statement-breakpoint
CREATE TABLE `internal_marks` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`course_id` text NOT NULL,
	`assessment_type` text DEFAULT 'assignment' NOT NULL,
	`assessment_name` text NOT NULL,
	`max_marks` integer NOT NULL,
	`marks_obtained` integer NOT NULL,
	`feedback_notes` text,
	`recorded_by` text NOT NULL,
	`recorded_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`course_id` text NOT NULL,
	`section_code` text NOT NULL,
	`academic_year` text NOT NULL,
	`semester` integer NOT NULL,
	`enrollment_date` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `syllabi` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`teacher_id` text NOT NULL,
	`content` text NOT NULL,
	`objectives` text,
	`textbooks` text,
	`assessment_method` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `timetables` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`section_code` text NOT NULL,
	`day_of_week` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`room` text NOT NULL,
	`academic_year` text NOT NULL,
	`semester` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`failed_login_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password_hash", "role", "first_name", "last_name", "is_active", "failed_login_attempts", "locked_until", "created_at", "updated_at") SELECT "id", "email", "password_hash", "role", "first_name", "last_name", "is_active", "failed_login_attempts", "locked_until", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);