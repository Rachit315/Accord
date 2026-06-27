import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let databaseUrl = "file:./dev.db";

if (process.env.NODE_ENV === "production") {
  const tmpDbPath = "/tmp/dev.db";
  const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

  try {
    // Copy the dev.db file to /tmp if it doesn't exist yet
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        fs.chmodSync(tmpDbPath, 0o666);
      }
    }
    databaseUrl = `file:${tmpDbPath}`;
  } catch (err) {
    console.error("Failed to copy SQLite database to /tmp:", err);
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
