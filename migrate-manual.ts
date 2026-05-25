import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.error('No DATABASE_URL'); process.exit(1); }

  const sql = readFileSync('./drizzle/0000_wide_namora.sql', 'utf-8');
  const statements = sql.split('--> statement-breakpoint').map((s: string) => s.trim()).filter(Boolean);

  const conn = await createConnection(dbUrl);
  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
      console.log('OK:', stmt.slice(0, 80));
    } catch (e: any) {
      if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_KEYNAME') {
        console.log('SKIP (exists):', stmt.slice(0, 60));
      } else {
        console.error('ERR:', e.message, '\nSQL:', stmt.slice(0, 100));
      }
    }
  }
  await conn.end();
  console.log('Done');
}

main();
