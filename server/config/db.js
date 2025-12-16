const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
// });
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "root",
  database: "goaldah",
});
pool.on("connect", () => {
  console.log("Connected to the PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
