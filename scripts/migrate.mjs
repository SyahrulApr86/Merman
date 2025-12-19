import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const runMigration = async () => {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not defined');
        process.exit(1);
    }

    console.log('⏳ Starting database migration...');

    try {
        // Create migration connection
        const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
        const db = drizzle(migrationClient);

        // Run migrations from the ./drizzle folder
        await migrate(db, { migrationsFolder: './drizzle' });

        console.log('✅ Database migration completed successfully');

        // Close the connection
        await migrationClient.end();
    } catch (error) {
        console.error('❌ Database migration failed:');
        console.error(error);
        process.exit(1);
    }
};

runMigration();
