import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Very lightweight in-memory rate limiter (per-IP) for auth routes
// Note: For production, prefer a robust store like Redis with express-rate-limit
const attempts = new Map();
const WINDOW_MS = 60_000; // 1 minute window
const MAX_ATTEMPTS = 30; // 30 requests per minute per IP

const limitAuth = (req, res, next) => {
  try {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const entry = attempts.get(key) || { count: 0, reset: now + WINDOW_MS };

    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + WINDOW_MS;
    }

    entry.count += 1;
    attempts.set(key, entry);

    if (entry.count > MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
    next();
  } catch {
    // On limiter error, do not block
    next();
  }
};

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', limitAuth, async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input types' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Normalize inputs
    email = String(email).trim().toLowerCase();
    username = String(username).trim();

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }

    // Create user
    let user;
    try {
      user = await User.create({
        username,
        email,
        password
      });
    } catch (err) {
      // Handle duplicate key errors from the database
      if (err?.code === 11000) {
        // Determine which field duplicated
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(400).json({ message: `${field} already taken` });
      }
      throw err;
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    const message = error?.message?.includes('JWT_SECRET')
      ? 'Server misconfiguration: JWT secret missing'
      : 'Server error during registration';
    res.status(500).json({ message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', limitAuth, async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input types' });
    }

    // Normalize inputs
    email = String(email).trim().toLowerCase();

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    const message = error?.message?.includes('JWT_SECRET')
      ? 'Server misconfiguration: JWT secret missing'
      : 'Server error during login';
    res.status(500).json({ message });
  }
});

export default router;
