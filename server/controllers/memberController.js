const db = require('../config/db');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
const getMembers = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, phone, role, status, profile_picture, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/members/:id
// @access  Private
const updateProfile = async (req, res) => {
    const { name, profile_picture } = req.body;
    const userId = req.params.id;

    // Ensure user is updating their own profile or is admin
    if (req.user.id != userId && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this profile' });
    }

    try {
        const result = await db.query(
            'UPDATE users SET name = $1, profile_picture = $2 WHERE id = $3 RETURNING id, name, phone, role, profile_picture',
            [name, profile_picture, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user role/status (Admin only)
// @route   PUT /api/members/:id/role
// @access  Private/Admin
const updateRole = async (req, res) => {
    const { role, status } = req.body;
    const userId = req.params.id;

    try {
        const result = await db.query(
            'UPDATE users SET role = COALESCE($1, role), status = COALESCE($2, status) WHERE id = $3 RETURNING id, name, role, status',
            [role, status, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload user avatar (BLOB)
// @route   POST /api/members/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const { buffer, mimetype } = req.file;

    try {
        const result = await db.query(
            'UPDATE users SET profile_picture_data = $1, mime_type = $2 WHERE id = $3 RETURNING id',
            [buffer, mimetype, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the URL to fetch this avatar
        // Assuming the server is reachable at the same host
        const protocol = req.protocol;
        const host = req.get('host');
        const avatarUrl = `${protocol}://${host}/api/members/${userId}/avatar?t=${Date.now()}`; // Add timestamp to bust cache

        // Also update the profile_picture URL field for backward compatibility/easy fetching
        await db.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [avatarUrl, userId]);

        res.json({ message: 'Avatar uploaded', avatarUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user avatar
// @route   GET /api/members/:id/avatar
// @access  Public (or Private if you prefer)
const getAvatar = async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await db.query('SELECT profile_picture_data, mime_type FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0 || !result.rows[0].profile_picture_data) {
            return res.status(404).send('Avatar not found');
        }

        const { profile_picture_data, mime_type } = result.rows[0];

        res.set('Content-Type', mime_type);
        res.send(profile_picture_data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

module.exports = { getMembers, updateProfile, updateRole, uploadAvatar, getAvatar };
