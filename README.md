# VidNest - Video Hosting Platform

A professional video hosting platform built with Node.js, Express, and MongoDB. Features include user authentication, video uploads, comments, likes, subscriptions, and playlists.

## Features

- 🔐 User Authentication (JWT-based)
- 📹 Video Upload & Management (Cloudinary integration)
- 💬 Comments & Replies
- 👍 Likes & Dislikes
- 📺 Subscriptions
- 📝 Playlists
- 👤 User Profiles with Avatar & Cover Images
- 🔍 Video Search & Filtering

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Authentication**: JWT (Access & Refresh Tokens)
- **Containerization**: Docker & Docker Compose

## Prerequisites

### For Docker Setup (Recommended)
- Docker & Docker Compose installed
- Cloudinary account (for file uploads)

### For Manual Setup
- Node.js (v20 or higher)
- MongoDB (v7 or higher)
- Cloudinary account (for file uploads)

## Getting Started

### Option 1: Docker Setup (Recommended)

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd vidNest
```

#### 2. Create Environment File
```bash
cp .env.example .env
```

#### 3. Configure Environment Variables
Edit `.env` and add your credentials:

```env
# Generate random strings for these secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Get these from your Cloudinary account
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 4. Start the Application
```bash
docker-compose up
```

The API will be available at `http://localhost:8000`

#### 5. Stop the Application
```bash
docker-compose down
```

---

### Option 2: Manual Setup

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd vidNest
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Install and Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service)
net start MongoDB

# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### 4. Create Environment File
```bash
cp .env.example .env
```

#### 5. Configure Environment Variables
Edit `.env` and add your credentials:

```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017/vidnest
CORS_ORIGIN=*

# Generate random strings for these secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRY=10d

# Get these from your Cloudinary account
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### 6. Start the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:8000`

---

## API Documentation

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/refresh-token` - Refresh access token

### User
- `GET /api/v1/users/current-user` - Get current user details
- `PATCH /api/v1/users/update-account` - Update account details
- `PATCH /api/v1/users/avatar` - Update avatar
- `PATCH /api/v1/users/cover-image` - Update cover image
- `GET /api/v1/users/c/:username` - Get user channel profile
- `GET /api/v1/users/history` - Get watch history

### Videos
- `POST /api/v1/videos` - Upload video
- `GET /api/v1/videos` - Get all videos
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video details
- `DELETE /api/v1/videos/:videoId` - Delete video
- `PATCH /api/v1/videos/toggle/publish/:videoId` - Toggle publish status

### Comments
- `POST /api/v1/comments/:videoId` - Add comment
- `GET /api/v1/comments/:videoId` - Get video comments
- `PATCH /api/v1/comments/c/:commentId` - Update comment
- `DELETE /api/v1/comments/c/:commentId` - Delete comment

### Likes
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle comment like
- `GET /api/v1/likes/videos` - Get liked videos

### Subscriptions
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/c/:channelId` - Get channel subscribers
- `GET /api/v1/subscriptions/u/:subscriberId` - Get subscribed channels

### Playlists
- `POST /api/v1/playlists` - Create playlist
- `GET /api/v1/playlists/:playlistId` - Get playlist by ID
- `PATCH /api/v1/playlists/:playlistId` - Update playlist
- `DELETE /api/v1/playlists/:playlistId` - Delete playlist
- `PATCH /api/v1/playlists/add/:videoId/:playlistId` - Add video to playlist
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId` - Remove video from playlist

## Project Structure

```
vidNest/
├── src/
│   ├── controllers/    # Request handlers
│   ├── db/            # Database connection
│   ├── middlewares/   # Auth & upload middlewares
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API routes
│   └── utils/         # Helper functions
├── public/            # Static files
├── .dockerignore      # Docker ignore file
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile         # Docker image definition
└── .env.example       # Environment variables template
