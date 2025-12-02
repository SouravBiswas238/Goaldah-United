const express = require('express');
const router = express.Router();
const { getMembers, updateProfile, updateRole } = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getMembers);
router.put('/:id', protect, updateProfile);
router.put('/:id/role', protect, admin, updateRole);

module.exports = router;
