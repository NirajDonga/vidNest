# VideoTube Backend API

A feature-rich backend API for a video sharing platform similar to YouTube. Built with Node.js, Express, and MongoDB.

## Features

- **User Management**
  - Registration and authentication with JWT
  - Profile management with avatar and cover image upload
  - Password management
  - Watch history tracking

- **Video Management**
  - Upload videos with thumbnails
  - Video browsing and search
  - Video statistics (views, likes)
  - Update and delete videos

- **Social Features**
  - Subscribe to channels
  - Like videos and comments
  - Comment on videos
  - Create and manage playlists

- **Dashboard**
  - Channel statistics 
  - Video analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose (v8.15.1)
- **Authentication**: JWT (jsonwebtoken v9.0.2)
- **File Storage**: Cloudinary
- **File Handling**: Multer (v2.0.0)
- **Password Encryption**: bcrypt (v6.0.0)
- **Environment Variables**: dotenv (v16.5.0)
- **CORS Support**: cors (v2.8.5)
- **Development**: nodemon (v3.1.10)

## API Endpoints

### User Routes
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login
- `POST /api/v1/users/logout` - Logout
- `POST /api/v1/users/refresh-token` - Refresh access token
- `POST /api/v1/users/change-password` - Change password
- `POST /api/v1/users/current-user` - Get current user details
- `PATCH /api/v1/users/update-account` - Update account details
- `PATCH /api/v1/users/update-avatar` - Update user avatar
- `PATCH /api/v1/users/update-coverImage` - Update cover image
- `PATCH /api/v1/users/remove-coverImage` - Remove cover image
- `GET /api/v1/users/c/:username` - Get channel profile
- `GET /api/v1/users/history` - Get watch history

### Video Routes
- `GET /api/v1/videos` - Get all videos
- `POST /api/v1/videos` - Upload a video
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video details
- `DELETE /api/v1/videos/:videoId` - Delete a video

### Like Routes
- `POST /api/v1/likes/toggle/v/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/c/:commentId` - Toggle comment like
- `GET /api/v1/likes/videos` - Get liked videos

### Comment Routes
- `GET /api/v1/comments/:videoId` - Get video comments
- `POST /api/v1/comments/:videoId` - Add a comment
- `PATCH /api/v1/comments/c/:commentId` - Update a comment
- `DELETE /api/v1/comments/c/:commentId` - Delete a comment

### Subscription Routes
- `GET /api/v1/subscriptions/c/:channelId` - Get channel's subscribers
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/u/:subscriberId` - Get subscribed channels

### Playlist Routes
- `POST /api/v1/playlists` - Create a playlist
- `GET /api/v1/playlists/:playlistId` - Get playlist by ID
- `PATCH /api/v1/playlists/:playlistId` - Update playlist
- `DELETE /api/v1/playlists/:playlistId` - Delete playlist
- `PATCH /api/v1/playlists/add/:videoId/:playlistId` - Add video to playlist
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId` - Remove video from playlist
- `GET /api/v1/playlists/user/:userId` - Get user playlists

### Dashboard Routes
- `GET /api/v1/dashboard/stats` - Get channel stats
- `GET /api/v1/dashboard/videos` - Get channel videos

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd videotube-backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=*

   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the development server
   ```
   npm run dev
   ```

## Project Structure

```
/src
  /controllers     # Request handlers
  /db              # Database connection
  /middlewares     # Express middlewares
  /models          # Mongoose models
  /routes          # API routes
  /utils           # Helper functions
  app.js           # Express app setup
  index.js         # Entry point
  constants.js     # Application constants
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
