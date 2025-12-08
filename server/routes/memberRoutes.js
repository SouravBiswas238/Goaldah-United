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

// Custom middleware to handle Multer errors
const uploadMiddleware = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine.
        next();
    });
};

// Avatar Routes
router.post('/avatar', protect, uploadMiddleware, uploadAvatar);
router.get('/:id/avatar', getAvatar); // Public access to view avatars

module.exports = router;
