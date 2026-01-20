import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL); // ✅ TEMP
console.log(
  "DB_HOST:",
  process.env.DATABASE_URL
    ? new URL(process.env.DATABASE_URL).hostname
    : "missing",
);

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
