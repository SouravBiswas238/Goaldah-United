const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getMembers, updateProfile, updateRole, uploadAvatar, getAvatar } = require('../controllers/memberController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure Multer for Memory Storage (BLOB)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Images only!'));
        }
    }
});

router.get('/', protect, getMembers);
router.put('/:id', protect, updateProfile);
router.put('/:id/role', protect, admin, updateRole);

// Avatar Routes
router.post('/avatar', protect, upload.single('image'), uploadAvatar);
router.get('/:id/avatar', getAvatar); // Public access to view avatars

module.exports = router;
