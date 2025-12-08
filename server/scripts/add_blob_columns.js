const db = require('../config/db');

const migrate = async () => {
    try {
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture_data BYTEA,
            ADD COLUMN IF NOT EXISTS mime_type VARCHAR(50);
        `);
        console.log('Successfully added BLOB columns to users table.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
