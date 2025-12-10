require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'businessform_db',
});

const sampleData = [
    {
        firstName: 'John',
        lastName: 'Anderson',
        email: 'john.anderson@example.com',
        phone: '+1-555-123-4567',
        address: '123 Tech Avenue, San Francisco',
        postalCode: '94105',
        businessIdea: 'AI-Powered Project Management Tool',
        requirements: 'Build a cloud-based project management platform using AI to automate task allocation and deadline predictions. Target audience: SMEs and startups. Timeline: 6 months. Budget: $250,000.',
    },
    {
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@example.com',
        phone: '+1-555-234-5678',
        address: '456 Innovation Drive, New York',
        postalCode: '10001',
        businessIdea: 'Sustainable Fashion E-Commerce Platform',
        requirements: 'Create an eco-friendly online marketplace for sustainable fashion brands. Features include carbon footprint tracking, ethical sourcing verification. Target audience: eco-conscious millennials. Timeline: 8 months. Budget: $300,000.',
    },
    {
        firstName: 'Michael',
        lastName: 'Rodriguez',
        email: 'michael.rodriguez@example.com',
        phone: '+1-555-345-6789',
        address: '789 Business Plaza, Austin',
        postalCode: '78701',
        businessIdea: 'Healthcare IoT Monitoring System',
        requirements: 'Develop IoT devices and mobile app for real-time health monitoring. Integration with hospital systems, HIPAA compliant, telemedicine features. Target audience: hospitals and clinics. Timeline: 12 months. Budget: $500,000.',
    },
    {
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@example.com',
        phone: '+1-555-456-7890',
        address: '321 Corporate Blvd, Seattle',
        postalCode: '98101',
        businessIdea: 'Real Estate Virtual Tours Platform',
        requirements: 'Build 3D virtual tour platform for real estate listings using VR/AR technology. Features: interactive floor plans, property history, market analysis. Target audience: real estate agents. Timeline: 9 months. Budget: $400,000.',
    },
    {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@example.com',
        phone: '+1-555-567-8901',
        address: '654 Innovation Way, Boston',
        postalCode: '02101',
        businessIdea: 'FinTech Personal Finance App',
        requirements: 'Create a comprehensive personal finance app with budgeting, investment tracking, and AI-powered financial advice. Security: military-grade encryption. Mobile: iOS and Android. Timeline: 10 months. Budget: $350,000.',
    },
];

const seedDatabase = async () => {
    const client = await pool.connect();

    try {
        console.log('🌱 Seeding database with sample data...\n');

        for (const data of sampleData) {
            const query = `
                INSERT INTO submissions 
                (first_name, last_name, email, phone, address, postal_code, business_idea, requirements)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
                RETURNING id;
            `;

            const result = await client.query(query, [
                data.firstName,
                data.lastName,
                data.email,
                data.phone,
                data.address,
                data.postalCode,
                data.businessIdea,
                data.requirements,
            ]);

            if (result.rows.length > 0) {
                console.log(`✅ Added: ${data.firstName} ${data.lastName} (ID: ${result.rows[0].id})`);
            } else {
                console.log(`⏭️  Skipped: ${data.firstName} ${data.lastName} (already exists)`);
            }
        }

        console.log('\n🎉 Seeding complete!');

    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

seedDatabase();
