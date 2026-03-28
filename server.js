require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-domain.com' : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Helper functions
function readJSONFile(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeJSONFile(filename, data) {
  fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Input validation middleware
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ===== AUTHENTICATION ROUTES =====

// User registration
app.post('/api/auth/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { username, email, password, fullName, adminCode } = req.body;
    const users = readJSONFile('users.json');

    // Check if user already exists
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      fullName,
      role: adminCode === process.env.ADMIN_CODE ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      avatar: null,
      bio: '',
      stats: {
        postsCount: 0,
        commentsCount: 0,
        likesReceived: 0,
        joinDate: new Date().toLocaleDateString()
      }
    };

    users.push(newUser);
    writeJSONFile('users.json', users);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { ...newUser, password: undefined },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readJSONFile('users.json');

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: { ...user, password: undefined },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const users = readJSONFile('users.json');
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ ...user, password: undefined });
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, [
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  handleValidationErrors
], (req, res) => {
  const users = readJSONFile('users.json');
  const userIndex = users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update allowed fields
  const allowedFields = ['fullName', 'email', 'bio', 'avatar'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      users[userIndex][field] = req.body[field];
    }
  });

  writeJSONFile('users.json', users);
  res.json({ ...users[userIndex], password: undefined });
});

// ===== POSTS ROUTES =====

// Get posts with search, pagination, and filtering
app.get('/api/posts', (req, res) => {
  try {
    let posts = readJSONFile('posts.json');

    // Search functionality
    const search = req.query.search;
    if (search) {
      const searchTerm = search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Category filter
    const category = req.query.category;
    if (category) {
      posts = posts.filter(post => post.category === category);
    }

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.json({
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(posts.length / limit),
        totalPosts: posts.length,
        hasNext: endIndex < posts.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post with comments
app.get('/api/posts/:id', (req, res) => {
  try {
    const posts = readJSONFile('posts.json');
    const post = posts.find(p => p.id == req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments for this post
    const comments = readJSONFile('comments.json').filter(c => c.postId == req.params.id);

    // Increment view count
    post.views = (post.views || 0) + 1;
    writeJSONFile('posts.json', posts);

    res.json({ ...post, comments });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new post (admin only)
app.post('/api/posts', authenticateToken, requireAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  handleValidationErrors
], (req, res) => {
  try {
    const posts = readJSONFile('posts.json');
    const users = readJSONFile('users.json');
    const author = users.find(u => u.id === req.user.id);

    const newPost = {
      id: Date.now(),
      title: req.body.title,
      content: req.body.content,
      category: req.body.category || 'General',
      tags: req.body.tags || [],
      author: {
        id: author.id,
        username: author.username,
        fullName: author.fullName
      },
      date: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      likes: 0,
      views: 0,
      commentsCount: 0,
      featured: req.body.featured || false
    };

    posts.push(newPost);
    writeJSONFile('posts.json', posts);

    // Update author's post count
    const authorIndex = users.findIndex(u => u.id === req.user.id);
    if (authorIndex !== -1) {
      users[authorIndex].stats.postsCount = (users[authorIndex].stats.postsCount || 0) + 1;
      writeJSONFile('users.json', users);
    }

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post (admin only)
app.put('/api/posts/:id', authenticateToken, requireAdmin, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  handleValidationErrors
], (req, res) => {
  try {
    const posts = readJSONFile('posts.json');
    const postIndex = posts.findIndex(p => p.id == req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update post
    const updatedFields = ['title', 'content', 'category', 'tags', 'featured'];
    updatedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        posts[postIndex][field] = req.body[field];
      }
    });
    posts[postIndex].lastModified = new Date().toISOString();

    writeJSONFile('posts.json', posts);
    res.json(posts[postIndex]);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post (admin only)
app.delete('/api/posts/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const posts = readJSONFile('posts.json');
    const postIndex = posts.findIndex(p => p.id == req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove post
    posts.splice(postIndex, 1);
    writeJSONFile('posts.json', posts);

    // Also remove associated comments
    const comments = readJSONFile('comments.json').filter(c => c.postId != req.params.id);
    writeJSONFile('comments.json', comments);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/unlike post
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  try {
    const posts = readJSONFile('posts.json');
    const postIndex = posts.findIndex(p => p.id == req.params.id);

    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[postIndex];
    const userId = req.user.id;

    // Initialize likes array if it doesn't exist
    if (!post.likedBy) post.likedBy = [];

    const likeIndex = post.likedBy.indexOf(userId);
    if (likeIndex === -1) {
      // Like the post
      post.likedBy.push(userId);
      post.likes = post.likedBy.length;
    } else {
      // Unlike the post
      post.likedBy.splice(likeIndex, 1);
      post.likes = post.likedBy.length;
    }

    writeJSONFile('posts.json', posts);
    res.json({ likes: post.likes, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== COMMENTS ROUTES =====

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  try {
    const comments = readJSONFile('comments.json');
    const postComments = comments.filter(c => c.postId == req.params.id);

    // Sort by date (newest first)
    postComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(postComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to post
app.post('/api/posts/:id/comments', authenticateToken, [
  body('content').notEmpty().withMessage('Comment content is required'),
  handleValidationErrors
], (req, res) => {
  try {
    const comments = readJSONFile('comments.json');
    const users = readJSONFile('users.json');
    const posts = readJSONFile('posts.json');

    const author = users.find(u => u.id === req.user.id);
    const post = posts.find(p => p.id == req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      id: Date.now(),
      postId: parseInt(req.params.id),
      author: {
        id: author.id,
        username: author.username,
        fullName: author.fullName
      },
      content: req.body.content,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    comments.push(newComment);
    writeJSONFile('comments.json', comments);

    // Update post's comment count
    const postIndex = posts.findIndex(p => p.id == req.params.id);
    if (postIndex !== -1) {
      posts[postIndex].commentsCount = (posts[postIndex].commentsCount || 0) + 1;
      writeJSONFile('posts.json', posts);
    }

    // Update user's comment count
    const authorIndex = users.findIndex(u => u.id === req.user.id);
    if (authorIndex !== -1) {
      users[authorIndex].stats.commentsCount = (users[authorIndex].stats.commentsCount || 0) + 1;
      writeJSONFile('users.json', users);
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment (admin or comment author)
app.delete('/api/comments/:id', authenticateToken, (req, res) => {
  try {
    const comments = readJSONFile('comments.json');
    const commentIndex = comments.findIndex(c => c.id == req.params.id);

    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = comments[commentIndex];

    // Check if user is admin or comment author
    if (req.user.role !== 'admin' && req.user.id !== comment.author.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comments.splice(commentIndex, 1);
    writeJSONFile('comments.json', comments);

    // Update post's comment count
    const posts = readJSONFile('posts.json');
    const postIndex = posts.findIndex(p => p.id == comment.postId);
    if (postIndex !== -1) {
      posts[postIndex].commentsCount = Math.max(0, (posts[postIndex].commentsCount || 0) - 1);
      writeJSONFile('posts.json', posts);
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== UTILITY ROUTES =====

// Get categories
app.get('/api/categories', (req, res) => {
  try {
    const posts = readJSONFile('posts.json');
    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
app.get('/api/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const posts = readJSONFile('posts.json');
    const users = readJSONFile('users.json');
    const comments = readJSONFile('comments.json');

    const stats = {
      totalPosts: posts.length,
      totalUsers: users.length,
      totalComments: comments.length,
      totalLikes: posts.reduce((sum, post) => sum + (post.likes || 0), 0),
      totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0),
      adminUsers: users.filter(u => u.role === 'admin').length,
      recentPosts: posts.slice(0, 5).map(p => ({ id: p.id, title: p.title, date: p.date })),
      recentUsers: users.slice(-5).map(u => ({ id: u.id, username: u.username, joinDate: u.stats?.joinDate }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = readJSONFile('users.json');
    // Remove passwords from response
    const safeUsers = users.map(u => ({ ...u, password: undefined }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
});