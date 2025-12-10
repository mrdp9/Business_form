require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'businessform_db',
});

/**
 * Utility script for common database operations
 * Usage: node scripts/db-utils.js [command] [args...]
 */

const commands = {
    /**
     * Show database statistics
     */
    stats: async () => {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_submissions,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending,
                    COUNT(*) FILTER (WHERE status = 'approved') as approved,
                    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
                    MIN(created_at) as first_submission,
                    MAX(created_at) as last_submission
                FROM submissions;
            `;
            
            const result = await pool.query(query);
            console.log('\n📊 Database Statistics:\n');
            console.log(result.rows[0]);
            console.log('');
        } catch (err) {
            console.error('Error:', err.message);
        } finally {
            await pool.end();
        }
    },

    /**
     * List all submissions (formatted table)
     */
    list: async () => {
        try {
            const query = `
                SELECT 
                    id, 
                    first_name, 
                    email, 
                    status, 
                    created_at
                FROM submissions
                ORDER BY created_at DESC
                LIMIT 10;
            `;
            
            const result = await pool.query(query);
            console.log('\n📋 Recent Submissions (Last 10):\n');
            console.table(result.rows);
        } catch (err) {
            console.error('Error:', err.message);
        } finally {
            await pool.end();
        }
    },

    /**
     * Export submissions to JSON
     */
    export: async () => {
        try {
            const query = 'SELECT * FROM submissions ORDER BY created_at DESC;';
            const result = await pool.query(query);
            
            const fs = require('fs');
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `submissions_${timestamp}.json`;
            
            fs.writeFileSync(filename, JSON.stringify(result.rows, null, 2));
            console.log(`✅ Exported ${result.rows.length} submissions to ${filename}`);
        } catch (err) {
            console.error('Error:', err.message);
        } finally {
            await pool.end();
        }
    },

    /**
     * Clear all submissions (with confirmation)
     */
    clear: async () => {
        try {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question('⚠️  This will delete ALL submissions. Are you sure? (yes/no): ', async (answer) => {
                if (answer.toLowerCase() === 'yes') {
                    const query = 'DELETE FROM submissions;';
                    await pool.query(query);
                    console.log('✅ All submissions cleared');
                } else {
                    console.log('❌ Operation cancelled');
                }
                rl.close();
                await pool.end();
            });
        } catch (err) {
            console.error('Error:', err.message);
        }
    },

    /**
     * Drop and recreate submissions table
     */
    reset: async () => {
        try {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.question('⚠️  This will DROP the submissions table. Are you sure? (yes/no): ', async (answer) => {
                if (answer.toLowerCase() === 'yes') {
                    await pool.query('DROP TABLE IF EXISTS submissions CASCADE;');
                    
                    const createTableQuery = `
                        CREATE TABLE submissions (
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
                    
                    await pool.query(createTableQuery);
                    console.log('✅ Table recreated successfully');
                } else {
                    console.log('❌ Operation cancelled');
                }
                rl.close();
                await pool.end();
            });
        } catch (err) {
            console.error('Error:', err.message);
        }
    },

    /**
     * Show help
     */
    help: () => {
        console.log(`
📚 Database Utility Commands:

  node scripts/db-utils.js stats   - Show database statistics
  node scripts/db-utils.js list    - List recent submissions
  node scripts/db-utils.js export  - Export all submissions to JSON
  node scripts/db-utils.js clear   - Delete all submissions
  node scripts/db-utils.js reset   - Drop and recreate table
  node scripts/db-utils.js help    - Show this help message

Example:
  node scripts/db-utils.js stats
        `);
    }
};

// Get command from arguments
const command = process.argv[2] || 'help';

if (command in commands) {
    commands[command]();
} else {
    console.error(`❌ Unknown command: ${command}`);
    console.log('Run: node scripts/db-utils.js help');
}
