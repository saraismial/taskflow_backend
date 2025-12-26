const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        
            if (!token) {
                return res.status(401).json({ message: 'Authorizatoin token missing' });
            }

            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await User.findById(payload.sub).select('-passwordHash');
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Attach user to request
            req.user = user; 

            next();
    } catch (err) {
        console.error('Authorization error: ', err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = auth;