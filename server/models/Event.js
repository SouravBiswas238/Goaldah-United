const db = require('../config/db');

const createTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      date TIMESTAMP NOT NULL,
      type VARCHAR(50), -- meeting, sports, cleanup
      description TEXT,
      created_by_user_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    try {
        await db.query(query);
        console.log('Events table created or already exists');
    } catch (err) {
        console.error('Error creating events table:', err);
    }
};

module.exports = { createTable };
