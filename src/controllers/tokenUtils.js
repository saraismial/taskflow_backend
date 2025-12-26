const jwt = require('jsonwebtoken');
// Token helpers

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            email: user.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' }
    );
}

module.exports = { generateAccessToken, generateRefreshToken };