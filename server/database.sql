-- Users Table
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
  blood_group VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contributions Table
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

-- Events Table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  type VARCHAR(50), -- meeting, sports, cleanup
  description TEXT,
  created_by_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  purpose TEXT NOT NULL,
  withdrawn_by_user_id INTEGER REFERENCES users(id),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  receipt_url VARCHAR(255),
  note TEXT
);
