import { Pool } from "pg";

// Create a PostgreSQL connection pool
let pool: Pool | null = null;

export function getDbPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function queryDb(query: string, params: any[] = []) {
  const pool = getDbPool();
  try {
    const result = await pool.query(query, params);
    return { data: result.rows, error: null };
  } catch (error: any) {
    console.error("Database query error:", error);
    return { data: null, error: { message: error.message } };
  }
}