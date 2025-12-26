function errorHandler(err, req, res, next) {
    console.error('Unhandled error: ', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({ message });
}

module.exports = errorHandler;