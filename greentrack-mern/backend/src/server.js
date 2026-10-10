import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import treeRoutes from './routes/trees.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',').map(x => x.trim()) || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'GreenTrack API' }));
app.use('/api/auth', authRoutes);
app.use('/api/trees', treeRoutes);

app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (error?.code === 11000) return res.status(409).json({ message: 'A record with this unique value already exists.' });
  if (error?.name === 'ValidationError') return res.status(400).json({ message: error.message });
  res.status(500).json({ message: 'Unexpected server error.' });
});

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and configure it.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('replace-this')) throw new Error('Set JWT_SECRET in backend/.env before starting the API.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`GreenTrack API running on http://localhost:${PORT}`));
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}
