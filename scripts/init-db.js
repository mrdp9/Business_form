require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default postgres database first
});

const initDatabase = async () => {
    const client = await pool.connect();

    try {
        console.log('🗄️  Initializing database...\n');

        // Create database if not exists
        const dbName = process.env.DB_NAME || 'businessform_db';
        console.log(`📝 Creating database: ${dbName}`);
        
        try {
            await client.query(`CREATE DATABASE ${dbName};`);
            console.log(`✅ Database created successfully\n`);
        } catch (err) {
            if (err.code === '42P04') {
                console.log(`✅ Database already exists\n`);
            } else {
                throw err;
            }
        }

        // Disconnect and reconnect to the new database
        client.release();
        
        const mainPool = new Pool({
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: dbName,
        });

        const mainClient = await mainPool.connect();

        try {
            // Create submissions table
            console.log('📋 Creating submissions table...');
            
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS submissions (
                    id SERIAL PRIMARY KEY,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    address VARCHAR(255) NOT NULL,
                    postal_code VARCHAR(20) NOT NULL,
                    business_idea TEXT NOT NULL,
                    requirements TEXT NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP,
                    notes TEXT
                );
            `;

            await mainClient.query(createTableQuery);
            console.log('✅ submissions table created\n');

            // Create indexes for better query performance
            console.log('🔍 Creating indexes...');

            const indexQueries = [
                `CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);`,
                `CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);`,
                `CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);`,
            ];

            for (const query of indexQueries) {
                await mainClient.query(query);
            }
            console.log('✅ Indexes created\n');

            // Create trigger for updated_at
            console.log('⏱️  Creating update trigger...');

            const triggerQuery = `
                CREATE OR REPLACE FUNCTION update_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;

                DROP TRIGGER IF EXISTS update_submissions_timestamp ON submissions;
                CREATE TRIGGER update_submissions_timestamp
                BEFORE UPDATE ON submissions
                FOR EACH ROW
                EXECUTE FUNCTION update_timestamp();
            `;

            await mainClient.query(triggerQuery);
            console.log('✅ Update trigger created\n');

            console.log('🎉 Database initialization complete!\n');
            console.log('📊 Database Schema:');
            console.log('   Table: submissions');
            console.log('   Columns: id, first_name, last_name, email, phone, address, postal_code, business_idea, requirements, status, created_at, updated_at, reviewed_at, notes\n');

            mainClient.release();
            await mainPool.end();

        } catch (err) {
            mainClient.release();
            await mainPool.end();
            throw err;
        }

    } catch (err) {
        console.error('❌ Error during database initialization:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

initDatabase();
