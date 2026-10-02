# Saylo Backend

Backend service for **Saylo**, a real-time messaging application.

The backend is built with Node.js and Fastify and provides REST APIs, authentication, database management, and real-time communication using Socket.IO.

## Tech Stack

- Node.js
- Fastify
- MongoDB
- Mongoose
- Socket.IO
- JWT
- JavaScript

## Features

- User registration and login
- JWT-based authentication
- Protected routes
- Real-time messaging using Socket.IO
- Typing indicators
- Message editing and updates
- Conversation and message persistence using MongoDB
- REST API endpoints

## Project Structure

```text
Saylo-backend/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── uploads/
├── .env.example
├── package.json
└── server.js
```

## Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/saylo_db
COOKIE_SECRET=your_cookie_secret_here
JWT_SECRET=your_jwt_secret_here
```

### Configuration Details

- **PORT**: Port the Fastify server listens on (defaults to `4000`).
- **MONGO_URI**: MongoDB connection URI. Defaults to `mongodb://127.0.0.1:27017/saylo_db` if not provided. When using MongoDB Atlas, remember to URL-encode special characters in the password.
- **COOKIE_SECRET**: Secret key used by `@fastify/cookie` to sign cookies.
- **JWT_SECRET**: Secret key used to sign and verify JWT authentication tokens.
- **NODE_ENV**: Set to `production` in production environments (enables secure cookies).

