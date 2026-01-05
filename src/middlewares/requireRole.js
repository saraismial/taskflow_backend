function requireRole(requiredRole) {
    return function (req, res, next) {
        if (!req.user) {
            return next(new AppError("Not authenticated", 401, "NOT_AUTHENTICATED"));
        }
        if (req.user.role !== requiredRole) {
            return next(new AppError("Forbidden", 403, "FORBIDDEN_ROLE"));
        }
        next();
    }
}

module.exports = requireRole;