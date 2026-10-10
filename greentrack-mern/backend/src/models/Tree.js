import mongoose from 'mongoose';

const treeSchema = new mongoose.Schema({
  treeId: { type: String, unique: true, index: true },
  species: { type: String, required: true, trim: true, maxlength: 100 },
  locationName: { type: String, required: true, trim: true, maxlength: 180 },
  latitude: { type: Number, min: -90, max: 90, default: null },
  longitude: { type: Number, min: -180, max: 180, default: null },
  plantedAt: { type: Date, required: true },
  plantedBy: { type: String, required: true, trim: true, maxlength: 100 },
  status: { type: String, enum: ['alive', 'needs_attention', 'dead', 'replaced', 'unverified'], default: 'unverified' },
  notes: { type: String, trim: true, maxlength: 1000, default: '' },
  lastInspectedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

treeSchema.pre('validate', function () {
  if (!this.treeId && this._id) this.treeId = `TREE-${String(this._id).slice(-6).toUpperCase()}`;
});

treeSchema.index({ species: 'text', locationName: 'text', plantedBy: 'text', treeId: 'text' });

export default mongoose.model('Tree', treeSchema);
