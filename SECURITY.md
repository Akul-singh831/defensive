# Security Guide — Ethical Hacking Project

> **Read before you write any `lib/<module>/**` or `app/<route>/**` code.**
> The goal of this project is to *learn* attack vectors by building defensively. The main site must be secure. A separate **demo/insecure** route will later show what breaks when you skip these steps.

> ### ⚠️ Placeholder Notice — Read This
> All code patterns shown for `requireAuth()` / `requireRole()` / `verifyJwt()` / `signJwt()` / `hashPassword()` in this guide are **placeholders / reference implementations**. They will be **built and maintained by the dedicated Authentication & Authorization team** (`team/auth`). If you are not on `team/auth`, **do not create `lib/auth/*` or roll your own JWT/hashing logic** — just `import { requireRole } from "@/lib/auth/guard"` once the auth team lands it. Need it urgently? Ask the lead — don't duplicate.

---

## 1. Golden Rule: Never Expose Global Callable Functions

### ❌ Don't do this
```ts
// lib/xss/queries.ts — BAD: anyone can import and run this from client
export async function deleteAllUsers() {
  return db.delete(users);
}
export async function updatePost(id: number, data: any) {
  return db.update(posts).set(data).where(eq(posts.id, id));
}
```

Any client component or external fetch can call it. No auth, no ownership check, no audit.

### ✅ Do this — Wrap every DB function with AuthN + AuthZ

```ts
// lib/auth/guard.ts — PLACEHOLDER — owned by team/auth (single source of truth)
// Other teams: do NOT create this file, just import from it
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth/jwt";

export async function requireAuth() {
  const token = (await cookies()).get("token")?.value;
  if (!token) throw new Error("UNAUTHENTICATED");
  const payload = await verifyJwt(token); // throws if invalid/expired
  return payload as { userId: string; role: "admin" | "user" | "editor" };
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN: insufficient role");
  return user;
}
```

```ts
// lib/xss/actions.ts — SECURE
"use server";
import { requireRole } from "@/lib/auth/guard"; // PLACEHOLDER — provided by team/auth
import { db } from "@/lib/turso";
import { posts } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function updatePostSecure(postId: number, data: { title: string }) {
  // 1. AuthN — is user logged in?
  const user = await requireRole(["admin", "editor"]);

  // 2. AuthZ — does this user own this resource OR have role permission?
  // For owned resources, also filter by userId:
  // await db.update(posts).set(data).where(and(eq(posts.id, postId), eq(posts.ownerId, user.userId)));

  // 3. Validation — always validate input (zod)
  // const parsed = PostSchema.parse(data);

  return db.update(posts).set(data).where(eq(posts.id, postId));
}
```

**Rules:**
- `lib/turso.ts` / `db` must **never** be imported in a `"use client"` file. Only in Server Components, Route Handlers, or `"use server"` actions.
- Every exported function that reads/writes sensitive data must call `requireAuth()` or `requireRole([...])` as the **first line**.
- Helpers that are internal should **not** be exported: `async function hashPassword()` — keep it private.

---

## 2. Authentication vs Authorization — Don't Confuse Them

| Concept | Meaning | Example |
|---------|---------|---------|
| **Authentication (AuthN)** | *Who are you?* Prove identity. | JWT verified, `userId` extracted. |
| **Authorization (AuthZ)** | *What can you do?* Check permission. | `role === "admin"` before `edit/delete`. |

**You need both, in order:**
```
Request → verify JWT (AuthN) → check role/ownership (AuthZ) → run Drizzle query
```

If you skip AuthN, anyone can call it. If you skip AuthZ, any logged-in user can edit anything.

---

## 3. JWT Authentication — No OAuth Needed

You **do not** need Google/GitHub OAuth for this project. Use simple **JWT with httpOnly cookies**.

### Why not localStorage?
`localStorage` is readable by any XSS payload. `httpOnly` cookies are not readable by JS — mitigates stolen tokens.

### Flow

```
[Register] password → salt + hash → store hash
[Login]    password → hash + compare → if ok → sign JWT {userId, role} → Set-Cookie httpOnly
[Request]  Cookie → verify JWT → allow
[Logout]   Clear cookie
```

### Minimal Implementation

```ts
// lib/auth/jwt.ts — PLACEHOLDER — owned by team/auth
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!); // 32+ chars in .env.local
const alg = "HS256";

export async function signJwt(payload: { userId: string; role: string }) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJwt(token: string) {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
}
```

```ts
// app/api/auth/login/route.ts
import { signJwt } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await signJwt({ userId: String(user.id), role: user.role });
  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return Response.json({ ok: true });
}
```

```ts
// middleware.ts — optional but recommended
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  try { await verifyJwt(token); return NextResponse.next(); }
  catch { return NextResponse.redirect(new URL("/login", req.url)); }
}
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
```

**Do not roll your own JWT logic.** `lib/auth/jwt.ts`, `lib/auth/guard.ts`, `lib/auth/password.ts`, and `JWT_SECRET` are owned by `team/auth`. All other teams: **do not create `lib/auth/*`** — import `requireRole`/`requireAuth`/`verifyJwt` once the auth team merges. If you need the helpers urgently, ask the lead for the current placeholder or wait for the PR. Do not duplicate auth logic per team.

---

## 4. Passwords — Hashing + Salting (Critical)

### Why?
Turso stores your data. If DB leaks and you stored `password: "123456"` or `sha256(password)`, attackers own every account. Salting + strong hashing makes offline cracking infeasible.

### Concepts

- **Hashing:** One-way function `password → fixed-length string`. Can't reverse. Use `bcrypt` or `argon2id` — **never** `MD5`, `SHA1`, or plain `SHA256(password)`.
- **Salting:** Random unique string per user added before hashing. Prevents rainbow-table attacks. `bcrypt`/`argon2` handle salting automatically — you just store the full hash.
- **Pepper (optional):** App-wide secret added to hash (stored in env, not DB).

### ✅ Correct (bcrypt — salt handled for you)

```ts
// lib/auth/password.ts — PLACEHOLDER — owned by team/auth
import bcrypt from "bcryptjs"; // or better: argon2

export async function hashPassword(password: string) {
  const saltRounds = 12; // 10-12 is standard, higher = slower but safer
  return bcrypt.hash(password, saltRounds); // stores salt inside hash: $2a$12$...
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// usage on register
const passwordHash = await hashPassword(inputPassword);
await db.insert(users).values({ email, passwordHash, role: "user" });
```

Stored in Turso: `$2a$12$LQv3c1yqBWVH...` — includes algorithm, salt, and hash. One column is enough.

### ❌ Insecure (will be shown in demo later)

```ts
// BAD-1: plaintext
await db.insert(users).values({ email, password: inputPassword });

// BAD-2: unsalted fast hash — rainbow tables break this instantly
import { createHash } from "crypto";
const hash = createHash("sha256").update(inputPassword).digest("hex");
```

**Rule: Main site must use `bcrypt` (or `argon2id`) with 12 rounds. Demo route will intentionally use plaintext/unsalted SHA256 to show why it's broken — that is the *only* place insecure code is allowed, and it will be clearly labelled `/demo/insecure-auth`.**

---

## 5. Form Validation — `zod` + `react-hook-form` (Follow AuraEdge Pattern)

> **Reference:** [`auraedge-website/app/register/page.tsx`](https://raw.githubusercontent.com/real-zephex/auraedge-website/refs/heads/main/app/register/page.tsx) — every team must follow the same pattern below for any form or Server Action.

Client-side validation is **not** security alone — it improves UX. **Always re-validate the same `zod` schema on the server** before any Turso query (see after).

### Step 1 — Install (lead will do this, don't touch `package.json` yourselves)

```bash
bun add zod react-hook-form @hookform/resolvers
# if you need shadcn inputs: Form, Input, Label already in @/components/ui
```

### Step 2 — Define your `zod` schema (one schema, reused client + server)

```ts
// lib/<your-module>/schema.ts
import * as z from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.enum(["xss", "sqli", "phishing"], { message: "Pick a category" }),
  email: z.string().email("Valid email is required"),
  isPublished: z.boolean().default(false),
  // optional fields:
  referenceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  // required checkbox:
  agreeToTerms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms",
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

> AuraEdge does exactly this: `registerSchema = z.object({ first_name: z.string().min(2), email: z.string().email(), gender: z.enum([...]), membership_fee_agreement: z.boolean().refine(v => v===true) })` then `type RegisterFormData = z.infer<typeof registerSchema>`.

### Step 3 — Wire `react-hook-form` with `zodResolver` (exact AuraEdge pattern)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createPostSchema, type CreatePostInput } from "@/lib/<your-module>/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreatePostForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "xss",
      email: "",
      isPublished: false,
      referenceUrl: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: CreatePostInput) => {
    // data is already typed + validated by zod
    const res = await fetch("/api/<your-module>/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) toast.error(json.error || "Failed");
    else toast.success("Created!");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Text input — same as AuraEdge: {...register("field")} + error below */}
      <div className="space-y-2">
        <Label className="text-xs font-mono">Title *</Label>
        <Input {...register("title")} placeholder="e.g. Stored XSS demo" />
        {errors.title && (
          <p className="text-xs text-red-500 font-mono">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-mono">Content *</Label>
        <Textarea {...register("content")} placeholder="Describe the attack..." />
        {errors.content && (
          <p className="text-xs text-red-500 font-mono">{errors.content.message}</p>
        )}
      </div>

      {/* Select / enum — same as AuraEdge confidence score select */}
      <div className="space-y-2">
        <Label className="text-xs font-mono">Category *</Label>
        <select
          {...register("category")}
          className="w-full h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="xss">XSS</option>
          <option value="sqli">SQL Injection</option>
          <option value="phishing">Phishing</option>
        </select>
        {errors.category && (
          <p className="text-xs text-red-500 font-mono">{errors.category.message}</p>
        )}
      </div>

      {/* Checkbox — same as AuraEdge membership_fee_agreement */}
      <label className="flex items-start gap-3 p-4 rounded-xl border bg-muted/30 cursor-pointer">
        <input type="checkbox" {...register("agreeToTerms")} className="mt-1" />
        <span className="text-xs font-mono">I agree to the terms *</span>
      </label>
      {errors.agreeToTerms && (
        <p className="text-xs text-red-500 font-mono">{errors.agreeToTerms.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
```

**AuraEdge patterns you must copy:**
- `z.infer<typeof schema>` for the form type — never manually type the form.
- `useForm<T>({ resolver: zodResolver(schema), defaultValues: { ... } })` — always set defaults, especially for `enum`/`boolean`.
- `{...register("fieldName")}` on every input/select/textarea/checkbox.
- `formState: { errors, isSubmitting }` and render `{errors.field && <p>{errors.field.message}</p>}` under each field — exactly like AuraEdge does for every `first_name`, `email`, etc.
- `setValue` / `watch` when you need to auto-populate (AuraEdge uses `useEffect` to `setValue("email", user.email)`).

### Step 4 — Re-validate on the server (never trust the client)

Even with `zodResolver`, an attacker can `curl` your API. Parse again before Drizzle.

```ts
// app/api/<your-module>/create/route.ts  OR  lib/<your-module>/actions.ts ("use server")
import { requireRole } from "@/lib/auth/guard"; // PLACEHOLDER — provided by team/auth
import { createPostSchema } from "@/lib/<your-module>/schema";

export async function POST(req: Request) {
  const user = await requireRole(["admin", "editor"]); // AuthN + AuthZ first
  const raw = await req.json();

  const parsed = createPostSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // parsed.data is now safe to insert
  await db.insert(posts).values({ ...parsed.data, ownerId: user.userId });
  return Response.json({ ok: true });
}

// Server Action alternative:
"use server";
export async function createPostAction(raw: unknown) {
  const user = await requireRole(["admin", "editor"]);
  const data = createPostSchema.parse(raw); // throws if invalid, caught by error boundary
  return db.insert(posts).values({ ...data, ownerId: user.userId });
}
```

> **Rule:** Every mutation path is `requireRole() → schema.safeParse() → db query`. Client `zodResolver` is for UX, server `safeParse/parse` is for security.

---

## 6. Checklist Before Every PR


Copy-paste this into your PR description:

```
- [ ] No function that touches DB is callable without `requireAuth()`/`requireRole()` (placeholder — import from `lib/auth/guard` owned by `team/auth`)
- [ ] DB client (db/turso) never imported in "use client" files
- [ ] All inputs validated with zod (or similar) before Drizzle query
- [ ] Passwords hashed with bcrypt/argon2, never plaintext or MD5/SHA1
- [ ] JWT stored in httpOnly cookie, not localStorage
- [ ] Role check present for edit/delete/admin actions (and ownership check where needed)
- [ ] No package.json changes, no edits to other teams' app/lib folders
- [ ] New tables added to lib/schema.ts with unique names
```

---

## 7. How to Get Help / Request Auth Layer

- `lib/auth/*` (`guard.ts`, `jwt.ts`, `password.ts`) and `JWT_SECRET`/middleware are **owned by `team/auth`**. All examples of `requireRole()`/`requireAuth()` in this doc are **placeholders** — do not re-implement them. Need the layer now? Ask the lead; otherwise `import { requireRole } from "@/lib/auth/guard"` once it lands.
- Want to test "what if auth is broken"? Build it **only** under `app/demo/insecure-auth/` with a big warning banner: `⚠️ Educational demo — intentionally insecure, do not copy`.
- Main site PRs that have global unauthenticated functions, plaintext passwords, or missing role checks will be **rejected**.

---

## 8. Future Demo Plan (Not for main site)

A dedicated demo will be added later (`app/demo/insecure-auth`) to show:

1. **Plaintext vs Hashed:** Two login forms, same password — one stores plaintext, one stores bcrypt. Leak the DB dump (mock) and show cracking time.
2. **No Salt vs Salted:** Two users with same password → unsalted SHA256 gives same hash (reveals reuse), salted bcrypt gives different hashes.
3. **No AuthZ:** Call `updatePost(id)` without role check → any user edits admin posts. Then fix with `requireRole(["admin"])`.

This demo is for learning *why* main-site rules exist. Don't ship demo code to main routes.

---

**TL;DR:**
1. Wrap every sensitive function: `requireAuth()` → `requireRole()` → validate → query.
2. JWT via httpOnly cookies, no OAuth needed.
3. Passwords: `bcrypt.hash(password, 12)` — salt is automatic. Never plaintext/fast-hash.
4. Main site stays secure. Insecure demo comes later, isolated.

Questions? Ping the lead before inventing your own auth.
