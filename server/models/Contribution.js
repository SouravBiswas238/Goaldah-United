const db = require("../config/db");

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
      note TEXT,
      screenshot_url VARCHAR(255),
      month VARCHAR(7), -- Format: YYYY-MM
      approved_by INTEGER REFERENCES users(id),
      approved_at TIMESTAMP,
      rejected_reason TEXT
    );
  `;
  try {
    await db.query(query);
    console.log("Contributions table created or already exists");

    // Add new columns if they don't exist (for existing databases)
    const alterQueries = [
      "ALTER TABLE contributions ADD COLUMN IF NOT EXISTS screenshot_url VARCHAR(255)",
      "ALTER TABLE contributions ADD COLUMN IF NOT EXISTS month VARCHAR(7)",
      "ALTER TABLE contributions ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id)",
      "ALTER TABLE contributions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP",
      "ALTER TABLE contributions ADD COLUMN IF NOT EXISTS rejected_reason TEXT",
    ];

    for (const alterQuery of alterQueries) {
      try {
        await db.query(alterQuery);
      } catch (err) {
        // Ignore errors if column already exists
      }
    }

    console.log("Contributions table updated with new columns");
  } catch (err) {
    console.error("Error creating contributions table:", err);
  }
};

module.exports = { createTable };
