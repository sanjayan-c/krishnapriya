// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const AuthUser = require('./models/AuthUser');
const requireAuth = require('./middleware/requireAuth');

const router = express.Router();

// Limit login brute-force
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 tries / minute
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/auth/login
// body: { username, password }
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username = '', password = '' } = req.body || {};
        if (!username || !password) {
            return res.status(400).json({ message: 'username and password are required.' });
        }

        const user = await AuthUser.findOne({ username: String(username).toLowerCase().trim() }).lean();
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            token,
            user: { username: user.username },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Login failed', error: String(error) });
    }
});

// PUT /api/auth
// headers: Authorization: Bearer <token>
// body: { username?, currentPassword?, newPassword? }
router.put('/', requireAuth, async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body || {};

        // Load current single user (by id in token)
        const user = await AuthUser.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // If changing username or password, require currentPassword to confirm identity
        const willChangeUsername =
            typeof username === 'string' && username.trim() && username.toLowerCase() !== user.username;
        const willChangePassword = typeof newPassword === 'string' && newPassword.length > 0;

        if (willChangeUsername || willChangePassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'currentPassword is required to update username or password.' });
            }
            const ok = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        if (willChangeUsername) {
            const nextUsername = username.toLowerCase().trim();
            const existing = await AuthUser.findOne({ username: nextUsername, _id: { $ne: user._id } });
            if (existing) return res.status(409).json({ message: 'Username already taken.' });
            user.username = nextUsername;
        }

        if (willChangePassword) {
            if (newPassword.length < 8) {
                return res.status(400).json({ message: 'newPassword must be at least 8 characters.' });
            }
            user.passwordHash = await bcrypt.hash(newPassword, 12);
        }

        await user.save();

        // Optionally issue a new token since username may have changed
        const newToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({
            token: newToken,
            user: { username: user.username },
            message: 'Credentials updated successfully.',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Update failed', error: String(error) });
    }
});

module.exports = router;
