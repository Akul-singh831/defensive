import { db } from "@/lib/turso";
import { auditLogs } from "@/lib/schema";
import { generateId } from "@/lib/id";
import type { JwtPayload } from "@/lib/auth/jwt";

export interface AcademicAuditEventParams {
  actor?: JwtPayload | { userId?: string; role?: string };
  action: string;
  resourceType: string;
  resourceId?: string | null;
  previousState?: string | null;
  newState?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  result?: "SUCCESS" | "DENIED" | "ERROR";
}

/**
 * Record an audit event for academic operations
 */
export async function logAcademicAudit(params: AcademicAuditEventParams): Promise<void> {
  try {
    const actorId = params.actor?.userId || "anonymous";
    const actorRole = params.actor?.role || "unauthenticated";

    await db.insert(auditLogs).values({
      id: generateId(),
      actorId,
      actorRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId || null,
      previousState: params.previousState || null,
      newState: params.newState || null,
      details: params.details || null,
      ipAddress: params.ipAddress || null,
      result: params.result || "SUCCESS",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[AUDIT_FAILURE] Could not write academic audit log:", error);
  }
}
