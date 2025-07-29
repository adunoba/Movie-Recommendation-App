// server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
// Make sure to set your MONGO_URI in a .env file
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas ---

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: [{ type: Number }], // Storing TMDB movie IDs
    watchlist: [{ type: Number }], // Storing TMDB movie IDs
});

const User = mongoose.model('User', UserSchema);

// --- Authentication Middleware ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    // Check for token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add user from payload
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// --- API Routes ---

// 1. User Registration
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Check for existing user
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        const newUser = new User({ username, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        // Save user to DB
        await newUser.save();

        // Create and sign a JWT
        const payload = { id: newUser.id, username: newUser.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }); // Expires in 1 hour

        res.status(201).json({
            token,
            user: { id: newUser.id, username: newUser.username }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. User Login
// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Simple validation
    if (!username || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        // Check for user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create and sign a JWT
        const payload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 });

        res.json({
            token,
            user: { id: user.id, username: user.username, favorites: user.favorites, watchlist: user.watchlist }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 3. Get User Data (Protected)
// @route   GET /api/auth/user
// @desc    Get user data from token
// @access  Private
app.get('/api/auth/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 4. Favorites and Watchlist Management (Protected)

// Add to favorites
app.post('/api/user/favorites', auth, async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user.favorites.includes(movieId)) {
            user.favorites.push(movieId);
            await user.save();
        }
        res.json(user.favorites);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add to watchlist
app.post('/api/user/watchlist', auth, async (req, res) => {
    const { movieId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user.watchlist.includes(movieId)) {
            user.watchlist.push(movieId);
            await user.save();
        }
        res.json(user.watchlist);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));er