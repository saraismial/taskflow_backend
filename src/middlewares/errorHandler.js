const AppError = require("../utils/AppError");

function normalizeError(err) {
    if (err instanceof AppError) return err;

    if (err.name === "CastError") {
        return new AppError("Invalid ID format", 400, "INVALID_ID", {
            path: err.path,
            value: err.value,
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return new AppError(`${field} already in use`, 409, "DUPLICATE_KEY", {
            field,
        });
    }

    if (err.name === "ValidationError") {
        const details = Object.values(err.errors || {}).map((e) => ({
            path: e.path,
            message: e.message,
        }));
        return new AppError("Validation failed", 400, "VALIDATION_ERROR", details);
    }

    if (err.name === "JsonWebTokenError") {
        return new AppError("Invalid token", 401, "INVALID_TOKEN");
    }

    if (err.name === "TokenExpiredError") {
        return new AppError("Token expired", 401, "TOKEN_EXPIRED");
    }

    return new AppError("Internal server error", 500, "INTERNAL_ERROR");
}

function errorHandler(err, req, res, next) {
    const appErr = normalizeError(err);

    if (appErr.statusCode >= 500) {
        console.error("Unhandled error:", err);
    } else {
        console.warn("Request error:", {
            message: appErr.message,
            code: appErr.code,
            statusCode: appErr.statusCode,
        });
    }

    res.status(appErr.statusCode).json({
        message: appErr.message,
        code: appErr.code,
        details: appErr.details,
    });
}

module.exports = errorHandler;