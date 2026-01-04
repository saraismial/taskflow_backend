const User = require("../models/User");

// PATCH /users/me
async function updateUser(req, res, next) {
    try {
        const userId = req.user._id;

        const { name, email } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

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
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue || {})[0] || "field";
            return res.status(409).json({ message: `${field} already in use` });
        }
        next(err);
    }
}

// PATCH /users/me/password
async function changePassword(req, res, next) {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(404).json({ message: "Current password and new password required." });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ message: "User nnot found." });

        const ok = await user.validatePassword(currentPassword);
        if (!ok) return res.status(400).json({ message: "Current password is incorrect." });

        await user.setPassword(newPassword);
        await user.save();

        res.json({ message: "Password updated." });
    } catch (err) {
        next(err);
    }
}

// DELETE /users/me
async function deleteUser(req, res, next) {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: "User not found" });

        await User.findByIdAndDelete(userId);

        res.json({ message: "Account deleted" })
    } catch (err) {
        next(err);
    }
}

module.exports = { updateUser, changePassword, deleteUser }
