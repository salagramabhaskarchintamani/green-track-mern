import { Router } from 'express';
import mongoose from 'mongoose';
import Tree from '../models/Tree.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
const statuses = ['alive', 'needs_attention', 'dead', 'replaced', 'unverified'];

function cleanTree(body) {
  const data = {};
  for (const key of ['species', 'locationName', 'plantedBy', 'notes']) {
    if (body[key] !== undefined) data[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
  }
  if (body.plantedAt !== undefined) data.plantedAt = new Date(body.plantedAt);
  if (body.status !== undefined) data.status = body.status;
  for (const key of ['latitude', 'longitude']) {
    if (body[key] !== undefined) data[key] = body[key] === '' || body[key] === null ? null : Number(body[key]);
  }
  if (body.lastInspectedAt !== undefined) data.lastInspectedAt = body.lastInspectedAt ? new Date(body.lastInspectedAt) : null;
  return data;
}

function validateTree(data, partial = false) {
  const errors = [];
  for (const field of ['species', 'locationName', 'plantedBy', 'plantedAt']) {
    const value = data[field];
    if ((!partial && (value === undefined || value === null || value === '')) || (partial && value !== undefined && (value === null || value === ''))) errors.push(`${field} is required.`);
  }
  if (data.plantedAt !== undefined && Number.isNaN(new Date(data.plantedAt).getTime())) errors.push('Planting date is invalid.');
  if (data.status !== undefined && !statuses.includes(data.status)) errors.push('Status is not supported.');
  for (const key of ['latitude', 'longitude']) if (data[key] !== undefined && data[key] !== null && !Number.isFinite(data[key])) errors.push(`${key} must be a valid number.`);
  return errors;
}

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '100', 10)));
    const query = {};
    const search = String(req.query.search || '').trim();
    if (search) query.$or = [
      { treeId: { $regex: search, $options: 'i' } },
      { species: { $regex: search, $options: 'i' } },
      { locationName: { $regex: search, $options: 'i' } },
      { plantedBy: { $regex: search, $options: 'i' } }
    ];
    if (req.query.status && statuses.includes(req.query.status)) query.status = req.query.status;
    if (req.query.location) query.locationName = { $regex: String(req.query.location), $options: 'i' };
    const [trees, total] = await Promise.all([
      Tree.find(query).sort({ plantedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('createdBy', 'name email'),
      Tree.countDocuments(query)
    ]);
    res.json({ trees, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

router.get('/stats/summary', async (req, res, next) => {
  try {
    const [total, statusCounts, monthly] = await Promise.all([
      Tree.countDocuments(),
      Tree.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Tree.aggregate([
        { $match: { plantedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) } } },
        { $group: { _id: { year: { $year: '$plantedAt' }, month: { $month: '$plantedAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);
    const byStatus = Object.fromEntries(statusCounts.map(item => [item._id, item.count]));
    const alive = byStatus.alive || 0;
    const confirmed = alive + (byStatus.dead || 0);
    res.json({
      total,
      alive,
      needsAttention: byStatus.needs_attention || 0,
      dead: byStatus.dead || 0,
      replaced: byStatus.replaced || 0,
      unverified: byStatus.unverified || 0,
      survivalRate: confirmed ? Math.round((alive / confirmed) * 1000) / 10 : null,
      byStatus,
      monthly: monthly.map(item => ({ year: item._id.year, month: item._id.month, count: item.count }))
    });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid tree ID.' });
    const tree = await Tree.findById(req.params.id).populate('createdBy', 'name email');
    if (!tree) return res.status(404).json({ message: 'Tree record not found.' });
    res.json({ tree });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = cleanTree(req.body);
    const errors = validateTree(data);
    if (errors.length) return res.status(400).json({ message: errors[0], errors });
    if (data.status === undefined) data.status = 'unverified';
    const tree = await Tree.create({ ...data, createdBy: req.user._id });
    res.status(201).json({ tree });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid tree ID.' });
    const data = cleanTree(req.body);
    const errors = validateTree(data, true);
    if (errors.length) return res.status(400).json({ message: errors[0], errors });
    const tree = await Tree.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true }).populate('createdBy', 'name email');
    if (!tree) return res.status(404).json({ message: 'Tree record not found.' });
    res.json({ tree });
  } catch (error) { next(error); }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid tree ID.' });
    const tree = await Tree.findByIdAndDelete(req.params.id);
    if (!tree) return res.status(404).json({ message: 'Tree record not found.' });
    res.json({ message: 'Tree record deleted.' });
  } catch (error) { next(error); }
});

router.post('/:id/inspections', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid tree ID.' });
    const status = String(req.body.status || '');
    const notes = String(req.body.notes || '').trim();
    if (!statuses.includes(status)) return res.status(400).json({ message: 'Choose a valid tree status.' });
    const tree = await Tree.findByIdAndUpdate(req.params.id, { $set: { status, notes, lastInspectedAt: new Date() } }, { new: true, runValidators: true });
    if (!tree) return res.status(404).json({ message: 'Tree record not found.' });
    res.json({ tree, message: 'Inspection recorded.' });
  } catch (error) { next(error); }
});

export default router;
