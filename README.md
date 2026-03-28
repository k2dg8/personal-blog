# Personal Blog with Advanced Features

This is a comprehensive personal blog application with user authentication, content management, comments system, and advanced features built with Node.js, Express, and JSON file storage.

## 🚀 Features

### Core Features

- **User Authentication**: Secure sign up and sign in with JWT tokens
- **Password Security**: Bcrypt password hashing
- **Role-Based Access**: Admin and regular user roles
- **Profile Management**: User profiles with statistics and bio
- **Admin Dashboard**: Complete content and user management

### Content Management

- **Post Management**: Create, edit, delete blog posts (admin only)
- **Categories & Tags**: Organize posts by categories and tags
- **Rich Post Data**: Author info, view counts, like counts, timestamps
- **Search Functionality**: Search posts by title, content, or tags
- **Pagination**: Efficient handling of large post collections
- **Sorting Options**: Sort by date, popularity, views

### Social Features

- **Comments System**: Users can comment on posts
- **Like System**: Users can like/unlike posts
- **Post Statistics**: View counts, like counts, comment counts
- **Share Functionality**: Share posts via clipboard or native sharing

### Security & Performance

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Server-side validation with express-validator
- **Security Headers**: Helmet.js for security headers
- **Environment Configuration**: Secure environment variable management

## 📁 File Structure

```
personal-blog/
├── index.html          # Main blog homepage with search & pagination
├── sign_up.html        # User registration with validation
├── sign_in.html        # User login with JWT tokens
├── profile.html        # User profile management
├── dashboard.html      # Admin management dashboard
├── posts.json          # Blog posts data storage
├── users.json          # User accounts data storage
├── comments.json       # Comments data storage
├── server.js           # Express backend with security
├── package.json        # Dependencies and scripts
├── .env               # Environment configuration
└── README.md          # This file
```

## 🛠️ Setup Instructions

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file with:

   ```
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ADMIN_CODE=ADMIN123
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Start the Server**:

   ```bash
   npm start
   ```

4. **Access the Blog**:
   Open your browser to `http://localhost:3000`

## 🔐 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Posts

- `GET /api/posts` - Get posts (with search, pagination, filtering)
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts` - Create new post (admin only)
- `PUT /api/posts/:id` - Update post (admin only)
- `DELETE /api/posts/:id` - Delete post (admin only)
- `POST /api/posts/:id/like` - Like/unlike post

### Comments

- `GET /api/posts/:id/comments` - Get comments for a post
- `POST /api/posts/:id/comments` - Add comment to post
- `DELETE /api/comments/:id` - Delete comment (admin or author)

### Utility

- `GET /api/categories` - Get all categories
- `GET /api/stats` - Get site statistics (admin only)
- `GET /api/users` - Get all users (admin only)

## 👤 Default Admin Account

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator

## 🏷️ Categories & Tags

Posts can be organized with:

- **Categories**: General, Technology, Personal, etc.
- **Tags**: #web-development, #javascript, #blogging, etc.

## 🔍 Search & Filtering

- **Search**: Full-text search across titles, content, and tags
- **Categories**: Filter posts by category
- **Sorting**: Newest, oldest, most liked, most viewed
- **Pagination**: 5 posts per page with navigation

## 💬 Comments System

- Users can comment on any post
- Comments are threaded and include author information
- Admin can delete any comment
- Users can delete their own comments

## 📊 Statistics & Analytics

- **Post Metrics**: Views, likes, comments count
- **User Statistics**: Posts created, comments made, join date
- **Site-wide Stats**: Total posts, users, comments, engagement

## 🛡️ Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Server-side validation for all inputs
- **Security Headers**: Helmet.js protection
- **Admin Code**: Special code required for admin registration

## 🎨 UI/UX Enhancements

- **Responsive Design**: Mobile-friendly interface
- **Real-time Search**: Instant search results
- **Loading States**: User feedback during operations
- **Error Handling**: Graceful error messages
- **Modern Styling**: Clean, professional appearance

## 🗂️ Data Storage

- **JSON Files**: Simple, file-based storage
- **Data Persistence**: Survives server restarts
- **Backup Ready**: Easy to backup and migrate
- **Human Readable**: JSON format for easy inspection

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Environment Variables

- `NODE_ENV` - Environment mode
- `PORT` - Server port
- `JWT_SECRET` - JWT signing secret
- `ADMIN_CODE` - Code for admin registration
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## 🚀 Future Enhancements

- **Rich Text Editor**: WYSIWYG post creation
- **Image Upload**: Post images and user avatars
- **Email Notifications**: Comment and post notifications
- **User Following**: Follow other users
- **Post Drafts**: Save drafts before publishing
- **Analytics Dashboard**: Detailed engagement metrics
- **API Documentation**: Swagger/OpenAPI docs
- **Database Migration**: Move from JSON to SQL/NoSQL
- **Caching**: Redis for performance
- **Testing**: Unit and integration tests

## 📝 License

This project is for educational and demonstration purposes.

---

**Built with**: Node.js, Express.js, JWT, bcrypt, HTML5, CSS3, JavaScript ES6+

- Admin code is hardcoded for simplicity
- Add proper authentication and encryption for production use
