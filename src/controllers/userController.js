const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// PATCH /users/me
const updateUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { name, email } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  if (typeof name === "string") user.name = name.trim();
  if (typeof email === "string") user.email = email.trim().toLowerCase();

  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// PATCH /users/me/password
const changePassword = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    throw new AppError(
      "Current password and new password required.",
      400,
      "MISSING_FIELDS"
    );

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");

  const ok = await user.validatePassword(currentPassword);
  if (!ok)
    throw new AppError(
      "Current password is incorrect.",
      400,
      "INVAlID_CREDENTIALS"
    );

  await user.setPassword(newPassword);
  await user.save();

  res.json({ message: "Password updated." });
});

// DELETE /users/me
const deleteUser = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found.", 404, "USER_NOT_FOUND");

  await User.findByIdAndDelete(userId);

  res.json({ message: "Account deleted" });
});

module.exports = { updateUser, changePassword, deleteUser };
