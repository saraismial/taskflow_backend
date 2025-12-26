const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('./tokenUtils');


async function register(req, res, next) {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const user = new User({
            email,
            // Default user, can manually create admin later
            role: role === 'admin' ? 'admin' : 'user', 
        });

        await user.setPassword(password);
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            tokens: {
                accessToken, 
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.validatePssword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
}

async function refresh(req, res, next) {
    const jwt = require('jsonwebtoken');

    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }

        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(payload.sub);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            tokens: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    register, 
    login, 
    refresh
}