require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

app.use(cors({
    // Update origin
    origin: [
        'https://taskflowreact.netlify.app',
        'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

// API prefix
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
    next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
});

app.use(errorHandler);

module.exports = app;
