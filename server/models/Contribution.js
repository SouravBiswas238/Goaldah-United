const db = require('../config/db');

const createTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS contributions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      amount DECIMAL(10, 2) NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      method VARCHAR(50), -- cash, bkash, etc.
      reference_id VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
      note TEXT
    );
  `;
    try {
        await db.query(query);
        console.log('Contributions table created or already exists');
    } catch (err) {
        console.error('Error creating contributions table:', err);
    }
};

module.exports = { createTable };
