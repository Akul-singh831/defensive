import { z } from "zod";

export const enquirySchema = z.object({
  email: z.string().email("Valid email required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number required (at least 10 digits)"),
  interestedProgram: z.string().min(1, "Program selection required"),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "converted", "closed"]),
});

export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;

export const applicationSchema = z.object({
  email: z.string().email("Valid email required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Valid date of birth required (YYYY-MM-DD)",
  }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  programAppliedFor: z.string().min(1, "Program selection required"),
  qualifications: z.record(z.string(), z.union([z.string(), z.number()])),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const updateApplicationSchema = applicationSchema.partial();
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const approveApplicationSchema = z.object({
  applicationId: z.string().min(1, "Application ID required"),
  approvalNotes: z.string().optional(),
});

export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;

export const rejectApplicationSchema = z.object({
  applicationId: z.string().min(1, "Application ID required"),
  rejectionReason: z.string().min(5, "Rejection reason required (at least 5 characters)"),
});

export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;

export const enrollStudentSchema = z.object({
  applicationId: z.string().min(1, "Application ID required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  program: z.string().min(1, "Program required"),
  batch: z.string().min(1, "Batch year required"),
  rollNumber: z.string().min(1, "Roll number required"),
});

export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>;

export const calculateMeritSchema = z.object({
  program: z.string().min(1, "Program required"),
  academicYear: z.string().min(1, "Academic year required"),
});

export type CalculateMeritInput = z.infer<typeof calculateMeritSchema>;

export const publishMeritSchema = z.object({
  program: z.string().min(1, "Program required"),
  academicYear: z.string().min(1, "Academic year required"),
});

export type PublishMeritInput = z.infer<typeof publishMeritSchema>;
