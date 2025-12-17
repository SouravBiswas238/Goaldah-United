const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const isProduction = true;
const connectionString = 'postgresql://postgres.ntrnurvfnutomhgsoxto:Sourav23@1$@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true'

const poolConfig = connectionString
    ? {
        connectionString,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

const pool = new Pool(poolConfig);
pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
