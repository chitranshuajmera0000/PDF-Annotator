import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import authMiddleware from '../middleware/authMiddleware.js';
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: 'User created successfully', token, user: { name: newUser.name, email: newUser.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/authenticate', authMiddleware, async (req, res) => {
    if (req.status === 401) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
    try {
        // req.user is userId set by authMiddleware
        const user = await User.findById(req.user).select('name email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User authenticated', user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;