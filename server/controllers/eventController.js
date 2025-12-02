const db = require('../config/db');

// @desc    Create event (Admin)
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    const { title, date, type, description } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO events (title, date, type, description, created_by_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, date, type, description, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM events WHERE type != \'announcement\' ORDER BY date ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create announcement (Admin)
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    const { title, description } = req.body;

    try {
        // Announcements are events with type 'announcement' and current date
        const result = await db.query(
            'INSERT INTO events (title, date, type, description, created_by_user_id) VALUES ($1, CURRENT_TIMESTAMP, \'announcement\', $2, $3) RETURNING *',
            [title, description, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM events WHERE type = \'announcement\' ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createEvent, getEvents, createAnnouncement, getAnnouncements };
