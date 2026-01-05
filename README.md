# TaskFlow Backend

Backend API for TaskFlow — a role-based task management application with JWT authentication, refresh tokens, and centralized error handling.

---

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (access & refresh tokens)
- bcrypt
- dotenv
- CORS

---

## Core Features

- User registration & login
- JWT authentication with access + refresh tokens
- Role-based authorization (`user`, `admin`)
- CRUD operations for tasks
- Task visibility based on role (admin vs user)
- Centralized error handling with consistent error codes

---

## Authentication

- Access tokens are sent via `Authorization: Bearer <token>`
- Refresh tokens are stored on the user document
- Token refresh endpoint issues new access tokens
- Protected routes require authentication middleware

---

## Error Handling

- Controllers throw `AppError` instead of sending responses
- Async controllers are wrapped with `catchAsync`
- A global error handler normalizes:
  - Mongo validation errors
  - Invalid ObjectId casts
  - Duplicate key errors
  - JWT errors

---

## API Routes

- Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
- Users
  - PATCH /api/users/me
  - PATCH /api/users/me/password
  - DELETE /api/users/me
- Tasks
  - POST /api/tasks
  - GET /api/tasks
  - GET /api/tasks/:id
  - PATCH /api/tasks/:id
  - DELETE /api/tasks/:id

---

## Environment Variables

- PORT=5050
- MONGO_URI=your_mongo_uri
- ACCESS_TOKEN_SECRET=your_secret
- REFRESH_TOKEN_SECRET=your_refresh_secret
- ACCESS_TOKEN_EXPIRES=15m
- REFRESH_TOKEN_EXPIRES=7d
