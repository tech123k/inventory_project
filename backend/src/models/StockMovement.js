const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  type: { type: String, enum: ['in', 'out'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String, trim: true, default: '' },
  cartonsAfter: { type: Number, default: 0 },
  // Snapshot fields for history display even if stock is deleted
  articleName: { type: String },
  gender: { type: String },
  color: { type: String },
  size: { type: String },
  series: { type: String }
}, { timestamps: true });

stockMovementSchema.index({ user: 1, createdAt: -1 });
stockMovementSchema.index({ stock: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
