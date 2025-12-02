const express = require('express');
const router = express.Router();
const { createEvent, getEvents, createAnnouncement, getAnnouncements } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/events', protect, admin, createEvent);
router.get('/events', protect, getEvents);
router.post('/announcements', protect, admin, createAnnouncement);
router.get('/announcements', protect, getAnnouncements);

module.exports = router;
