const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const { initDB } = require('./models');
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const financeRoutes = require('./routes/financeRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api', eventRoutes); // Routes are defined as /events and /announcements inside

app.get('/', (req, res) => {
    res.send('Goaldah United API is running');
});

// Initialize DB and Start Server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
