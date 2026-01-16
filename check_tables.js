import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL);

(async () => {
  try {
    const result = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'pos_%'
      ORDER BY table_name
    `;
    console.log('POS tables found:', result);
    if (result.length === 0) {
      console.log('No POS tables found. Will run migration again.');
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  }
})();
