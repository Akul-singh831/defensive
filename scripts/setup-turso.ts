import { db } from "../lib/turso";
import { sql } from "drizzle-orm";

async function setupTurso() {
  console.log("==================================================");
  console.log("          TURSO DATABASE SETUP & HEALTH CHECK     ");
  console.log("==================================================");

  // 1. Check environment variables
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log("\n1. Environment Configuration:");
  console.log(`   Database URL: ${dbUrl ? dbUrl : "MISSING (file:local.db fallback)"}`);
  console.log(`   Auth Token:   ${authToken ? "Configured (Present)" : "Not Configured"}`);

  if (!dbUrl || dbUrl.startsWith("file:")) {
    console.log("   Notice: Using local SQLite fallback file.");
  } else {
    console.log("   Status: Connected to remote Turso Cloud Edge instance.");
  }

  // 2. Test connection and measure latency
  console.log("\n2. Connectivity & Latency Test:");
  const startTime = Date.now();
  try {
    const pingResult = await db.all(sql`SELECT 1 as ping;`);
    const latency = Date.now() - startTime;
    console.log(`   Connection: SUCCESS (Roundtrip Latency: ${latency}ms)`);
  } catch (error) {
    console.error("   Connection FAILED:", error);
    process.exit(1);
  }

  // 3. Inspect Tables and Record Counts
  console.log("\n3. Inspecting Database Schema & Record Counts:");
  const tableQuery = await db.all(
    sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;`
  );

  const tables = tableQuery.map((row: any) => row.name);
  console.log(`   Total Tables Found: ${tables.length}`);

  const counts: Record<string, number> = {};
  for (const table of tables) {
    try {
      const res = await db.all(sql.raw(`SELECT COUNT(*) as count FROM "${table}";`));
      const count = (res[0] as any)?.count ?? 0;
      counts[table] = count;
      const formattedName = table.padEnd(26, " ");
      console.log(`   - ${formattedName}: ${count} rows`);
    } catch {
      console.log(`   - ${table}: Error reading count`);
    }
  }

  // 4. Check if seeding is needed
  const userCount = counts["users"] ?? 0;
  if (userCount === 0) {
    console.log("\n⚠️  No users found in database. Running seed script now...");
    const { execSync } = await import("child_process");
    execSync("bun run scripts/seed-turso.ts", { stdio: "inherit" });
  } else {
    console.log(`\n✅ Database is populated with ${userCount} active users.`);
  }

  // 5. Test Credentials Summary
  console.log("\n==================================================");
  console.log("             DEFAULT LOGIN CREDENTIALS            ");
  console.log("==================================================");
  console.log(" Role      | Email                   | Password   ");
  console.log(" ----------+-------------------------+------------");
  console.log(" Admin     | admin@university.edu    | AdminPass123! ");
  console.log(" Faculty 1 | faculty1@university.edu | FacultyPass123! ");
  console.log(" Faculty 2 | faculty2@university.edu | FacultyPass123! ");
  console.log(" Student 1 | student1@university.edu | StudentPass123! ");
  console.log(" Student 2 | student2@university.edu | StudentPass123! ");
  console.log("==================================================");
  console.log(" Turso setup verified and operational!\n");
}

setupTurso().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
