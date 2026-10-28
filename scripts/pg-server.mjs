// Local dev Postgres via embedded-postgres (no Docker / Homebrew / cloud needed).
// Keeps a real Postgres server running on localhost:5432 for Prisma to connect to.
// Run in background: `nohup node scripts/pg-server.mjs > /tmp/intentify-pg.log 2>&1 &`
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const DATA_DIR = new URL("../pgdata", import.meta.url).pathname;
const DB_NAME = "intentify";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: 5432,
  persistent: true,
  onLog: (m) => console.log("[pg]", m),
  onError: (e) => console.error("[pg:err]", e),
});

const alreadyInitialised = existsSync(`${DATA_DIR}/PG_VERSION`);

try {
  if (!alreadyInitialised) {
    console.log("Initialising new Postgres cluster at", DATA_DIR);
    await pg.initialise();
  } else {
    console.log("Reusing existing cluster at", DATA_DIR);
  }

  await pg.start();
  console.log("Postgres started on localhost:5432");

  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Created database "${DB_NAME}"`);
  } catch (e) {
    console.log(`Database "${DB_NAME}" already exists (ok)`);
  }

  console.log("READY"); // sentinel for the waiter

  // Keep process alive so the cluster stays up.
  const shutdown = async () => {
    console.log("Stopping Postgres...");
    try { await pg.stop(); } catch {}
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  setInterval(() => {}, 1 << 30);
} catch (err) {
  console.error("Failed to start embedded Postgres:", err);
  process.exit(1);
}
