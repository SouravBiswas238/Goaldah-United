const db = require('../config/db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      role VARCHAR(20) DEFAULT 'member', -- member, admin, executive
      status VARCHAR(20) DEFAULT 'pending', -- pending, active
      profile_picture VARCHAR(255),
      profile_picture_data BYTEA,
      mime_type VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await db.query(query);
    console.log('Users table created or already exists');
  } catch (err) {
    console.error('Error creating users table:', err);
  }
};

module.exports = { createTable };
