const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("./tokenUtils");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError(
      "Name, email, and password required",
      400,
      "MISSING_FIELDS"
    );
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(
      "User with this email already exists",
      409,
      "EMAIL_IN_USE"
    );
  }

  const user = new User({
    name,
    email,
    // Default user, can manually create admin later
    role: role === "admin" ? "admin" : "user",
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
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password required", 400, "MISSING_FIELDS");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.validatePassword(password))) {
    throw new AppError("Invalid credentials", 400, "INVALID_CREDENTIALS");
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  });
});

const refresh = catchAsync(async (req, res) => {
  const jwt = require("jsonwebtoken");
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token required", 400, "MISSING_REFRESH_TOKEN");
  }

  const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(payload.sub);

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
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
});

module.exports = {
  register,
  login,
  refresh,
};
