const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articleName: { type: String, required: true, trim: true },
  stockType: { type: String, required: true, trim: true },
  gender: { type: String, required: true, enum: ['Men', 'Women', 'Kids', 'Unisex'] },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  size: { type: String, trim: true, default: '' },
  color: { type: String, trim: true, default: '' },
  pairCarton: { type: String, enum: ['Pair', 'Carton', ''], default: '' },
  series: { type: String, trim: true, default: '' },
  noOfCartons: { type: Number, default: 0 },
  currentCartons: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  rate: { type: Number, default: 0 }
}, { timestamps: true });

stockSchema.index({ user: 1, articleName: 1, gender: 1 });

module.exports = mongoose.model('Stock', stockSchema);
