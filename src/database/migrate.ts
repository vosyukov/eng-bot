import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Starting database migration...');
  
  // Create a PostgreSQL connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  // Initialize Drizzle with the connection
  const db = drizzle(pool);
  
  // Run migrations
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './migrations' });
  
  console.log('Migrations completed successfully!');
  
  // Close the connection
  await pool.end();
}

// Run the migration
main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });