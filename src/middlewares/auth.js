const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require("../utils/AppError");

async function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        
            if (!token) {
                return next(new AppError("Authorization token missing", 401, "AUTH_MISSING_TOKEN"));
            }

            const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            const user = await User.findById(payload.sub).select('-passwordHash');
            if (!user) {
                return next(new AppError("User not found", 401, "AUTH_USER_NOT_FOUND"));
            }

            // Attach user to request
            req.user = user; 

            next();
    } catch (err) {
        next(err);
    }
}

module.exports = auth;