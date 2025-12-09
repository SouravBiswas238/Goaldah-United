const db = require('../config/db');

const migrate = async () => {
    try {
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5);
        `);
        console.log('Successfully added blood_group column to users table.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
