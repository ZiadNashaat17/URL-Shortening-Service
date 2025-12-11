# URL Shortening Service 🔗

A powerful RESTful API that transforms long URLs into compact, trackable short links. Built with Node.js, Express, and MongoDB, this service provides a complete solution for URL shortening with user authentication, click tracking, and email verification.

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Documentation](#-api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [URL Shortening Endpoints](#url-shortening-endpoints)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Security Features](#-security-features)
- [Development](#-development)
- [License](#-license)
- [Author](#-author)
- [Contributing](#-contributing)
- [Show your support](#-show-your-support)

## ✨ Features

### Core Functionality
- **URL Shortening**: Convert long URLs into short, manageable links using NanoID
- **Click Tracking**: Monitor the number of clicks on each shortened URL
- **Duplicate Prevention**: Automatically detects and returns existing short URLs for the same original URL
- **URL Validation**: Ensures all URLs are valid before creating short links

### User Management
- **User Registration**: Create an account with email verification
- **Email Verification**: Secure email verification system using SendGrid
- **Authentication**: JWT-based authentication system
- **Password Management**: Forgot password, reset password, and change password functionality
- **Account Management**: Deactivate and reactivate user accounts
- **User Profile**: View and update user information

### User-URL Ownership
- **Authenticated URLs**: Users can create URLs linked to their account
- **Anonymous URLs**: Non-authenticated users can create public URLs
- **URL Isolation**: Users only access their own URLs or public URLs
- **Personalized Tracking**: Users get individual click statistics for their URLs

### Security & Performance
- **Rate Limiting**: Protects against abuse with configurable request limits (10,000 requests/hour)
- **Helmet**: Security headers for Express applications
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for user passwords
- **Environment Variables**: Secure configuration management

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- SendGrid API key (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ZiadNashaat17/URL-Shortening-Service.git
   cd URL-Shortening-Service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `config.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE=mongodb://localhost:27017/url-shortener
   BASE=http://localhost:3000/api/url
   
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRATION=90d
   
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourservice.com
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run start-dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register a New User
```http
POST /user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123"
}
```

#### Verify Email
```http
GET /user/verify-email/:verifyToken
```

#### Login
```http
POST /user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Forgot Password
```http
POST /user/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
PATCH /user/reset-password/:resetToken
Content-Type: application/json

{
  "password": "newPassword123",
  "passwordConfirm": "newPassword123"
}
```

#### Change Password (Authenticated)
```http
PATCH /user/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "password": "newPassword123",
  "passwordConfirm": "newPassword123"
}
```

#### Get User Profile (Authenticated)
```http
GET /user
Authorization: Bearer <token>
```

#### Update User Profile (Authenticated)
```http
PATCH /user/update-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### Deactivate Account (Authenticated)
```http
PATCH /user/deactivate-user
Authorization: Bearer <token>
```

#### Reactivate Account
```http
PATCH /user/reactivate-user
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### URL Shortening Endpoints

#### Create Short URL
```http
POST /url
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "originalUrl": "https://www.example.com/very-long-url-that-needs-shortening"
}
```

**Response:**
```json
{
  "status": "success",
  "url": {
    "urlId": "V1StGXR8_Z",
    "shortUrl": "http://localhost:3000/api/url/V1StGXR8_Z",
    "originalUrl": "https://www.example.com/very-long-url-that-needs-shortening",
    "clicks": 0,
    "user": "userId or null",
    "createdAt": "2025-12-11T10:30:00.000Z",
    "updatedAt": "2025-12-11T10:30:00.000Z"
  }
}
```

#### Access Short URL (Redirect)
```http
GET /url/:urlId
Authorization: Bearer <token> (optional)
```

This endpoint redirects to the original URL and increments the click counter.

## 🏗️ Project Structure

```
URL-Shortening-Service/
├── src/
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server startup and database connection
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── urlController.js    # URL shortening logic
│   │   └── userController.js   # User management logic
│   ├── middlewares/
│   │   ├── authenticate.js     # JWT authentication middleware
│   │   ├── authorize.js        # Authorization middleware
│   │   ├── errorController.js  # Global error handler
│   │   ├── optionalAuthenticate.js  # Optional auth for URLs
│   │   └── validateUrl.js      # URL validation middleware
│   ├── models/
│   │   ├── urlModel.js         # URL schema and model
│   │   └── userModel.js        # User schema and model
│   ├── routes/
│   │   ├── urlRoutes.js        # URL-related routes
│   │   └── userRoutes.js       # User and auth routes
│   └── util/
│       ├── apiFeatures.js      # API utility functions
│       ├── appError.js         # Custom error class
│       ├── email.js            # Email sending functionality
│       ├── emailTemplateFun.js # Email templates
│       └── filterObj.js        # Object filtering utility
├── biome.json                  # Biome linter/formatter config
├── config.env                  # Environment variables
├── package.json                # Project dependencies
└── README.md                   # This file
```

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **NanoID**: Unique ID generation for short URLs
- **SendGrid**: Email delivery service
- **Helmet**: Security middleware
- **Express Rate Limit**: Rate limiting middleware
- **Validator**: String validation library
- **Biome**: Fast linter and formatter

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **Rate Limiting**: 10,000 requests per hour per IP
- **Helmet**: Sets various HTTP headers for security
- **Input Validation**: Comprehensive validation for all inputs
- **Environment Variables**: Sensitive data stored securely

## 🧪 Development

### Code Formatting and Linting
```bash
npm run lint-format
```

This project uses Biome for fast linting and formatting.

## 📝 License

ISC License

## 👤 Author

**Ziad Nashaat**
- GitHub: [@ZiadNashaat17](https://github.com/ZiadNashaat17)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/ZiadNashaat17/URL-Shortening-Service/issues).

## ⭐ Show your support

Give a ⭐️ if this project helped you!
