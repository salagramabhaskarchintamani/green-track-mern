import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '8h' });
}

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.checkPassword(password))) return res.status(401).json({ message: 'Incorrect email or password.' });
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ token: createToken(user), user: safeUser });
  } catch (error) { next(error); }
});

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || !email.includes('@') || password.length < 8) {
      return res.status(400).json({ message: 'Enter a name, valid email, and password with at least 8 characters.' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, passwordHash: await User.hashPassword(password), role: 'volunteer' });
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.status(201).json({ token: createToken(user), user: safeUser });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default router;
