const db = require('../config/db');

const createTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      amount DECIMAL(10, 2) NOT NULL,
      purpose TEXT NOT NULL,
      withdrawn_by_user_id INTEGER REFERENCES users(id),
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      receipt_url VARCHAR(255),
      note TEXT
    );
  `;
    try {
        await db.query(query);
        console.log('Expenses table created or already exists');
    } catch (err) {
        console.error('Error creating expenses table:', err);
    }
};

module.exports = { createTable };
