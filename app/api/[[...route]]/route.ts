import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { demoPostSchema } from "@/lib/demo/schema";

// All API routes go through Hono — DO NOT use Next.js Route Handlers.
// Base path is /api, so Hono route "/hello" => /api/hello
// For auth patterns, take inspiration from: https://github.com/real-zephex/Auth-Api
//   → see Auth-Api/src/index.ts (Hono + bcryptjs + jose + hono/cookie) and lib/auth/jwt.ts

const app = new Hono().basePath("/api");

app.use(logger());
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (c) => c.text("Hello Hono! — Ethical Hacking Project API"));
app.get("/hello", (c) => c.json({ message: "hello world" }));

// Demo endpoint — shows zod validation + Hono processing
// Client validates with zodResolver (UX), server re-validates with safeParse (security)
app.post("/demo/post", async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON", message: "Send valid JSON" }, 400);
  }

  const parsed = demoPostSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json(
      {
        error: "Validation failed on server",
        details: parsed.error,
        message: "Server rejected — zod safeParse failed. Check your fields.",
      },
      400
    );
  }

  // Simulate server processing (e.g. write to DB, sanitize, audit log)
  // In real team code: await requireRole(c, ["editor"]) before this, then await db.insert(...)
  await new Promise((r) => setTimeout(r, 500));

  return c.json(
    {
      message: "message received",
      data: parsed.data,
      at: new Date().toISOString(),
      note: "Client zodResolver passed, server safeParse passed, Hono processed it.",
    },
    200
  );
});

// Example (placeholder — owned by team/auth, see Auth-Api for real impl):
// app.post("/register", async (c) => {
//   const { email, password } = await c.req.json();
//   // 1. validate with zod, 2. hash with bcryptjs, 3. insert via Drizzle, 4. sign JWT with jose, 5. setCookie httpOnly
//   // see https://github.com/real-zephex/Auth-Api/blob/main/src/index.ts
//   return c.json({ message: "see SECURITY.md + Auth-Api" });
// });

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
