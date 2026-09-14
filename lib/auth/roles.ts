export const USER_ROLES = ["admin", "teacher", "student"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Modules 1–12 visible in the dashboard grid per role */
export const ROLE_MODULE_ACCESS: Record<UserRole, number[]> = {
  admin: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  teacher: [2, 3, 5, 6, 7, 10, 11, 12],
  student: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12],
};
