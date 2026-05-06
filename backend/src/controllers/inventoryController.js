const Stock = require('../models/Stock');
const StockMovement = require('../models/StockMovement');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const PDFDocument = require('pdfkit');
const https = require('https');
const http = require('http');

// ─── Cloudinary ───────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'inventory_pro',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
exports.uploadMiddleware = upload.single('image');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const stocks = await Stock.find({ user: userId });

    const totalArticles = stocks.length;
    const totalCartons = stocks.reduce((s, x) => s + (x.currentCartons || 0), 0);
    const totalValue = stocks.reduce((s, x) => s + (x.currentCartons || 0) * (x.rate || 0), 0);
    const lowStock = stocks.filter(x => x.currentCartons > 0 && x.currentCartons <= 5);
    const outOfStock = stocks.filter(x => x.currentCartons === 0);

    const recentMovements = await StockMovement.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('stock', 'articleName gender color size image');

    res.json({ totalArticles, totalCartons, totalValue, lowStockCount: lowStock.length, outOfStockCount: outOfStock.length, recentMovements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
};

// ─── Get All Stocks ───────────────────────────────────────────────────────────
exports.getStocks = async (req, res) => {
  try {
    const { search, gender, stockType, sortBy = 'createdAt', order = 'desc', page = 1, limit = 100 } = req.query;
    const query = { user: req.user._id };

    if (search) query.articleName = { $regex: search, $options: 'i' };
    if (gender) query.gender = gender;
    if (stockType) query.stockType = { $regex: stockType, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Stock.countDocuments(query);
    const stocks = await Stock.find(query)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ stocks, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stocks.' });
  }
};

// ─── Add Stock (Stock In - New Entry) ─────────────────────────────────────────
exports.addStock = async (req, res) => {
  try {
    const { articleName, stockType, gender, size, color, pairCarton, series, noOfCartons, mrp, rate } = req.body;
    if (!articleName || !stockType || !gender) {
      return res.status(400).json({ message: 'Article name, stock type and gender are required.' });
    }

    const qty = Number(noOfCartons) || 0;
    const stock = await Stock.create({
      user: req.user._id,
      articleName: articleName.trim(),
      stockType: stockType.trim(),
      gender,
      image: req.file ? req.file.path : '',
      imagePublicId: req.file ? req.file.filename : '',
      size: size || '',
      color: color || '',
      pairCarton: pairCarton || '',
      series: series || '',
      noOfCartons: qty,
      currentCartons: qty,
      mrp: Number(mrp) || 0,
      rate: Number(rate) || 0
    });

    // Record stock-in movement
    if (qty > 0) {
      await StockMovement.create({
        user: req.user._id,
        stock: stock._id,
        type: 'in',
        quantity: qty,
        cartonsAfter: qty,
        notes: 'Initial stock entry',
        articleName: stock.articleName,
        gender: stock.gender,
        color: stock.color,
        size: stock.size,
        series: stock.series
      });
    }

    res.status(201).json({ message: 'Stock added successfully!', stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add stock.' });
  }
};

// ─── Replenish Stock (Stock In - Add to Existing) ────────────────────────────
exports.replenishStock = async (req, res) => {
  try {
    const { stockId, quantity, notes } = req.body;
    const qty = Number(quantity);
    if (!stockId || !qty || qty < 1) return res.status(400).json({ message: 'Stock ID and quantity are required.' });

    const stock = await Stock.findOne({ _id: stockId, user: req.user._id });
    if (!stock) return res.status(404).json({ message: 'Stock not found.' });

    stock.currentCartons += qty;
    stock.noOfCartons += qty;
    await stock.save();

    await StockMovement.create({
      user: req.user._id,
      stock: stock._id,
      type: 'in',
      quantity: qty,
      cartonsAfter: stock.currentCartons,
      notes: notes || 'Stock replenished',
      articleName: stock.articleName,
      gender: stock.gender,
      color: stock.color,
      size: stock.size,
      series: stock.series
    });

    res.json({ message: `${qty} cartons added to stock!`, stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to replenish stock.' });
  }
};

// ─── Stock Out ────────────────────────────────────────────────────────────────
exports.stockOut = async (req, res) => {
  try {
    const { stockId, quantity, notes } = req.body;
    const qty = Number(quantity);
    if (!stockId || !qty || qty < 1) return res.status(400).json({ message: 'Stock ID and quantity are required.' });

    const stock = await Stock.findOne({ _id: stockId, user: req.user._id });
    if (!stock) return res.status(404).json({ message: 'Stock not found.' });
    if (stock.currentCartons < qty) {
      return res.status(400).json({ message: `Only ${stock.currentCartons} cartons available. Cannot remove ${qty}.` });
    }

    stock.currentCartons -= qty;
    await stock.save();

    await StockMovement.create({
      user: req.user._id,
      stock: stock._id,
      type: 'out',
      quantity: qty,
      cartonsAfter: stock.currentCartons,
      notes: notes || '',
      articleName: stock.articleName,
      gender: stock.gender,
      color: stock.color,
      size: stock.size,
      series: stock.series
    });

    res.json({ message: `${qty} cartons removed from stock!`, stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to process stock out.' });
  }
};

// ─── Get Movement History ─────────────────────────────────────────────────────
exports.getMovements = async (req, res) => {
  try {
    const { type, stockId, page = 1, limit = 50 } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (stockId) query.stock = stockId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await StockMovement.countDocuments(query);
    const movements = await StockMovement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('stock', 'articleName gender color size image series');

    res.json({ movements, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch movement history.' });
  }
};

// ─── Update Stock ─────────────────────────────────────────────────────────────
exports.updateStock = async (req, res) => {
  try {
    const stock = await Stock.findOne({ _id: req.params.id, user: req.user._id });
    if (!stock) return res.status(404).json({ message: 'Stock not found.' });

    if (req.file && stock.imagePublicId) {
      await cloudinary.uploader.destroy(stock.imagePublicId).catch(() => {});
    }

    const { articleName, stockType, gender, size, color, pairCarton, series, mrp, rate } = req.body;
    Object.assign(stock, {
      articleName: articleName || stock.articleName,
      stockType: stockType || stock.stockType,
      gender: gender || stock.gender,
      image: req.file ? req.file.path : stock.image,
      imagePublicId: req.file ? req.file.filename : stock.imagePublicId,
      size: size !== undefined ? size : stock.size,
      color: color !== undefined ? color : stock.color,
      pairCarton: pairCarton !== undefined ? pairCarton : stock.pairCarton,
      series: series !== undefined ? series : stock.series,
      mrp: mrp !== undefined ? Number(mrp) : stock.mrp,
      rate: rate !== undefined ? Number(rate) : stock.rate
    });

    await stock.save();
    res.json({ message: 'Stock updated successfully!', stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update stock.' });
  }
};

// ─── Delete Stock ─────────────────────────────────────────────────────────────
exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findOne({ _id: req.params.id, user: req.user._id });
    if (!stock) return res.status(404).json({ message: 'Stock not found.' });

    if (stock.imagePublicId) {
      await cloudinary.uploader.destroy(stock.imagePublicId).catch(() => {});
    }

    await StockMovement.deleteMany({ stock: stock._id });
    await stock.deleteOne();
    res.json({ message: 'Stock deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete stock.' });
  }
};

// ─── Autocomplete Suggestions ─────────────────────────────────────────────────
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user._id;
    const [articleNames, stockTypes, colors, sizes, series] = await Promise.all([
      Stock.distinct('articleName', { user: userId }),
      Stock.distinct('stockType', { user: userId }),
      Stock.distinct('color', { user: userId }),
      Stock.distinct('size', { user: userId }),
      Stock.distinct('series', { user: userId })
    ]);

    res.json({
      articleNames: articleNames.filter(Boolean).sort(),
      stockTypes: stockTypes.filter(Boolean).sort(),
      colors: colors.filter(Boolean).sort(),
      sizes: sizes.filter(Boolean).sort(),
      series: series.filter(Boolean).sort()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch suggestions.' });
  }
};

// ─── Autofill by Article + Gender ────────────────────────────────────────────
exports.getAutofill = async (req, res) => {
  try {
    const { articleName, gender } = req.query;
    if (!articleName || !gender) return res.json({ stock: null });

    const stock = await Stock.findOne({
      user: req.user._id,
      articleName: new RegExp(`^${articleName.trim()}$`, 'i'),
      gender
    }).sort({ createdAt: -1 });

    res.json({ stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch autofill data.' });
  }
};

// ─── Bulk Import (Upsert) ─────────────────────────────────────────────────────
exports.importStocks = async (req, res) => {
  try {
    const { stocks } = req.body;
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return res.status(400).json({ message: 'No valid stock data provided.' });
    }

    const rows = stocks.map(s => ({
      articleName: (s.articleName || s['Article Name'] || '').toString().trim(),
      stockType: (s.stockType || s['Stock Type'] || '').toString().trim(),
      gender: (s.gender || s['Gender'] || 'Unisex').toString().trim(),
      size: (s.size || s['Size'] || '').toString().trim(),
      color: (s.color || s['Color'] || '').toString().trim(),
      pairCarton: (s.pairCarton || s['Pair/Carton'] || '').toString().trim(),
      series: (s.series || s['Series'] || '').toString().trim(),
      qty: Number(s.noOfCartons || s['No. of Cartons'] || 0),
      mrp: Number(s.mrp || s['MRP'] || 0),
      rate: Number(s.rate || s['Rate'] || 0)
    })).filter(s => s.articleName && s.stockType);

    if (rows.length === 0) return res.status(400).json({ message: 'No valid rows found. Check column headers.' });

    let created = 0, updated = 0;
    const movements = [];

    for (const r of rows) {
      const existing = await Stock.findOne({
        user: req.user._id,
        articleName: new RegExp(`^${r.articleName}$`, 'i'),
        stockType: new RegExp(`^${r.stockType}$`, 'i'),
        gender: r.gender,
        size: r.size,
        color: r.color,
        series: r.series
      });

      if (existing) {
        // Update metadata
        existing.pairCarton = r.pairCarton || existing.pairCarton;
        existing.mrp = r.mrp || existing.mrp;
        existing.rate = r.rate || existing.rate;

        const diff = r.qty - existing.currentCartons;

        if (diff > 0) {
          existing.currentCartons += diff;
          existing.noOfCartons += diff;
          await existing.save();
          movements.push({
            user: req.user._id,
            stock: existing._id,
            type: 'in',
            quantity: diff,
            cartonsAfter: existing.currentCartons,
            notes: 'Updated via Excel import',
            articleName: existing.articleName,
            gender: existing.gender,
            color: existing.color,
            size: existing.size,
            series: existing.series
          });
        } else if (diff < 0) {
          const remove = Math.abs(diff);
          existing.currentCartons -= remove;
          await existing.save();
          movements.push({
            user: req.user._id,
            stock: existing._id,
            type: 'out',
            quantity: remove,
            cartonsAfter: existing.currentCartons,
            notes: 'Adjusted via Excel import',
            articleName: existing.articleName,
            gender: existing.gender,
            color: existing.color,
            size: existing.size,
            series: existing.series
          });
        } else {
          await existing.save();
        }
        updated++;
      } else {
        const stock = await Stock.create({
          user: req.user._id,
          articleName: r.articleName,
          stockType: r.stockType,
          gender: r.gender,
          image: '',
          size: r.size,
          color: r.color,
          pairCarton: r.pairCarton,
          series: r.series,
          noOfCartons: r.qty,
          currentCartons: r.qty,
          mrp: r.mrp,
          rate: r.rate
        });

        if (r.qty > 0) {
          movements.push({
            user: req.user._id,
            stock: stock._id,
            type: 'in',
            quantity: r.qty,
            cartonsAfter: r.qty,
            notes: 'Imported from Excel',
            articleName: stock.articleName,
            gender: stock.gender,
            color: stock.color,
            size: stock.size,
            series: stock.series
          });
        }
        created++;
      }
    }

    if (movements.length > 0) await StockMovement.insertMany(movements);

    res.json({
      message: `Import done: ${created} new, ${updated} updated.`,
      created,
      updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Import failed. Check your Excel file format.' });
  }
};

// ─── Helpers for Catalogue PDF ────────────────────────────────────────────────
function fetchImageBuffer(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      if (res.statusCode !== 200) return resolve(null);
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', () => resolve(null));
    });
    req.setTimeout(6000, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

// ─── Premium catalogue page — one product per A4 page ────────────────────────
// Visual language: dark navy (#070e1c), blue accents (#2563eb), white typography.
// Left panel: product image with glow ring.
// Right panel: article name, specs as pills, price boxes, availability bar.
// Footer: "STANDARD CATALOGUE TEMPLATE" + brand + date + page number.
function drawProductPage(doc, stock, imgBuf, businessName, pageW, pageH, pageNum, totalPages) {
  const headerH = 52;
  const footerH = 42;
  const bodyH   = pageH - headerH - footerH;
  const leftW   = 272;
  const rPad    = 18;
  const rX      = leftW + rPad;
  const rW      = pageW - leftW - rPad - 14;

  // ── Full-page dark background ──────────────────────────────────────────────
  doc.rect(0, 0, pageW, pageH).fillColor('#070e1c').fill();

  // Ambient glow spots
  doc.save().opacity(0.07).circle(520, 20, 260).fillColor('#2563eb').fill().restore();
  doc.save().opacity(0.05).circle(180, pageH, 180).fillColor('#2563eb').fill().restore();

  // ── HEADER ────────────────────────────────────────────────────────────────
  doc.rect(0, 0, pageW, headerH).fillColor('#040b17').fill();
  doc.moveTo(0, headerH).lineTo(pageW, headerH).lineWidth(0.5).strokeColor('#0d1e35').stroke();

  // Brand icon square
  doc.roundedRect(18, 14, 26, 26, 6).fillColor('#2563eb').fill();
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#ffffff')
    .text((businessName || 'I')[0].toUpperCase(), 18, 19.5, { width: 26, align: 'center', lineBreak: false });

  // Brand name
  doc.fontSize(11.5).font('Helvetica-Bold').fillColor('#f1f5f9')
    .text(businessName || 'Inventory Pro', 52, 21.5, { lineBreak: false });

  // Gender badge (right-aligned)
  const gColors = { Men: '#1d4ed8', Women: '#be185d', Kids: '#6d28d9', Unisex: '#374151' };
  const gc      = gColors[stock.gender] || '#374151';
  const gLabel  = (stock.gender || '').toUpperCase();
  const badgeW  = gLabel.length * 6.5 + 22;
  doc.roundedRect(pageW - badgeW - 16, 17, badgeW, 18, 9).fillColor(gc).fill();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
    .text(gLabel, pageW - badgeW - 16, 22, { width: badgeW, align: 'center', lineBreak: false });

  // ── LEFT PANEL ────────────────────────────────────────────────────────────
  doc.rect(0, headerH, leftW, bodyH).fillColor('#060d1a').fill();
  doc.moveTo(leftW, headerH).lineTo(leftW, headerH + bodyH)
    .lineWidth(0.5).strokeColor('#0d1e35').stroke();

  // Glow ring behind image
  const cx = leftW / 2;
  const cy = headerH + bodyH / 2;
  doc.save().opacity(0.18).circle(cx, cy, 125).fillColor('#2563eb').fill().restore();
  doc.save().opacity(0.07).circle(cx, cy, 148).fillColor('#2563eb').fill().restore();

  // Image box
  const imgSize = 214;
  const imgX    = (leftW - imgSize) / 2;
  const imgY    = cy - imgSize / 2;

  // Shadow offset
  doc.save().opacity(0.55)
    .roundedRect(imgX + 5, imgY + 9, imgSize, imgSize, 14)
    .fillColor('#000000').fill().restore();

  doc.roundedRect(imgX, imgY, imgSize, imgSize, 14).fillColor('#0c1a2e').fill();
  doc.roundedRect(imgX, imgY, imgSize, imgSize, 14)
    .strokeColor('#122040').lineWidth(0.8).stroke();

  if (imgBuf) {
    try {
      const img    = doc.openImage(imgBuf);
      const aspect = img.width / img.height;
      let drawW, drawH, drawX, drawY;
      if (aspect >= 1) {
        drawH = imgSize; drawW = imgSize * aspect;
        drawX = imgX - (drawW - imgSize) / 2; drawY = imgY;
      } else {
        drawW = imgSize; drawH = imgSize / aspect;
        drawX = imgX; drawY = imgY - (drawH - imgSize) / 2;
      }
      doc.save().roundedRect(imgX, imgY, imgSize, imgSize, 14).clip()
        .image(imgBuf, drawX, drawY, { width: drawW, height: drawH }).restore();
    } catch (_) {
      doc.fontSize(9).font('Helvetica').fillColor('#1e3a5f')
        .text('No Image', imgX, cy - 5, { width: imgSize, align: 'center', lineBreak: false });
    }
  }

  // ── RIGHT PANEL ───────────────────────────────────────────────────────────
  let ry = headerH + 24;

  // Article name
  doc.fontSize(19).font('Helvetica-Bold').fillColor('#f1f5f9')
    .text(stock.articleName || '—', rX, ry, { width: rW, lineBreak: false, ellipsis: true });
  ry += 26;

  // Stock type
  if (stock.stockType) {
    doc.fontSize(8.5).font('Helvetica').fillColor('#334155')
      .text(stock.stockType.toUpperCase(), rX, ry, { width: rW, characterSpacing: 0.9, lineBreak: false });
    ry += 18;
  }

  // Divider
  doc.moveTo(rX, ry).lineTo(rX + rW, ry).lineWidth(0.4).strokeColor('#0d1e35').stroke();
  ry += 14;

  // Spec rows
  const specs = [
    stock.color      ? ['COLOR',  stock.color]      : null,
    stock.size       ? ['SIZE',   stock.size]       : null,
    stock.series     ? ['SERIES', stock.series]     : null,
    stock.pairCarton ? ['UNIT',   stock.pairCarton] : null,
  ].filter(Boolean);

  specs.forEach(([label, value]) => {
    const isSeries = label === 'SERIES';
    doc.fontSize(7.5).font('Helvetica').fillColor('#334155')
      .text(label, rX, ry + 2, { width: 36, lineBreak: false });

    const valText = String(value);
    const pillW   = Math.min(rW - 44, valText.length * 6.8 + 20);
    doc.roundedRect(rX + 44, ry - 1, pillW, 16, 4)
      .fillColor(isSeries ? '#0d1f40' : '#0d1830').fill();
    doc.fontSize(8.5).font('Helvetica-Bold')
      .fillColor(isSeries ? '#93c5fd' : '#e2e8f0')
      .text(valText, rX + 44 + 7, ry + 1.5, { width: pillW - 14, lineBreak: false, ellipsis: true });

    ry += 23;
  });

  // ── Price section (bottom-anchored) ───────────────────────────────────────
  const priceY = headerH + bodyH - 114;

  // Separator before prices
  if (ry + 8 < priceY) {
    doc.moveTo(rX, priceY - 14).lineTo(rX + rW, priceY - 14)
      .lineWidth(0.4).strokeColor('#0d1e35').stroke();
  }

  const boxW = (rW - 8) / 2;
  const boxH = 52;

  // MRP
  doc.roundedRect(rX, priceY, boxW, boxH, 8).fillColor('#0a1625').fill();
  doc.roundedRect(rX, priceY, boxW, boxH, 8).strokeColor('#0d1e35').lineWidth(0.5).stroke();
  doc.fontSize(7).font('Helvetica').fillColor('#334155').text('MRP', rX + 10, priceY + 9, { lineBreak: false });
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#f8fafc')
    .text(`Rs. ${Number(stock.mrp || 0).toLocaleString('en-IN')}`, rX + 10, priceY + 24, { width: boxW - 16, lineBreak: false, ellipsis: true });

  // Rate
  const rateX = rX + boxW + 8;
  doc.roundedRect(rateX, priceY, boxW, boxH, 8).fillColor('#0d1f40').fill();
  doc.roundedRect(rateX, priceY, boxW, boxH, 8).strokeColor('#1a3060').lineWidth(0.5).stroke();
  doc.rect(rateX, priceY, boxW, 3).fillColor('#2563eb').fill(); // top accent bar
  doc.fontSize(7).font('Helvetica').fillColor('#93c5fd').text('RATE', rateX + 10, priceY + 9, { lineBreak: false });
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#60a5fa')
    .text(`Rs. ${Number(stock.rate || 0).toLocaleString('en-IN')}`, rateX + 10, priceY + 24, { width: boxW - 16, lineBreak: false, ellipsis: true });

  // Availability bar
  const avail       = stock.currentCartons ?? 0;
  const availColor  = avail > 5 ? '#34d399' : avail > 0 ? '#fbbf24' : '#f87171';
  const availBg     = avail > 5 ? '#052018' : avail > 0 ? '#1a0e00' : '#1a0505';
  const availBorder = avail > 5 ? '#0a4030' : avail > 0 ? '#402800' : '#401010';
  const availY      = priceY + boxH + 9;

  doc.roundedRect(rX, availY, rW, 30, 7).fillColor(availBg).fill();
  doc.roundedRect(rX, availY, rW, 30, 7).strokeColor(availBorder).lineWidth(0.5).stroke();
  doc.fontSize(7.5).font('Helvetica').fillColor('#475569')
    .text('STOCK AVAILABLE', rX + 10, availY + 10, { lineBreak: false });
  doc.fontSize(10).font('Helvetica-Bold').fillColor(availColor)
    .text(`${avail} cartons`, rX, availY + 9, { width: rW - 10, align: 'right', lineBreak: false });

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footY = pageH - footerH;
  doc.rect(0, footY, pageW, footerH).fillColor('#040b17').fill();
  doc.moveTo(0, footY).lineTo(pageW, footY).lineWidth(0.5).strokeColor('#0d1e35').stroke();

  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#2d4a6a')
    .text('STANDARD CATALOGUE TEMPLATE', 18, footY + 16, { lineBreak: false });

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.fontSize(7.5).font('Helvetica').fillColor('#2d4a6a')
    .text(
      `${businessName || 'Inventory Pro'}  ·  ${dateStr}  ·  ${pageNum} / ${totalPages}`,
      0, footY + 16, { width: pageW - 18, align: 'right', lineBreak: false }
    );
}

// ─── Download Catalogue PDF ───────────────────────────────────────────────────
exports.downloadCataloguePDF = async (req, res) => {
  try {
    const { search, gender, stockType, showOutOfStock } = req.query;

    const query = { user: req.user._id };
    if (search) query.articleName = { $regex: search, $options: 'i' };
    if (gender) query.gender = gender;
    if (stockType) query.stockType = { $regex: stockType, $options: 'i' };
    if (showOutOfStock === 'false') query.currentCartons = { $gt: 0 };

    const stocks = await Stock.find(query).sort({ gender: 1, articleName: 1 });
    if (stocks.length === 0) return res.status(400).json({ message: 'No products match the filter.' });

    // Pre-fetch all images in parallel
    const imageMap = {};
    await Promise.all(
      stocks.filter(s => s.image).map(async (s) => {
        imageMap[s._id.toString()] = await fetchImageBuffer(s.image);
      })
    );

    const doc          = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const businessName = req.user.businessName || 'Inventory Pro';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${businessName.replace(/\s+/g, '_')}_Catalogue.pdf"`);
    doc.pipe(res);

    const pageW = 595.28;
    const pageH = 841.89;
    const total = stocks.length;

    stocks.forEach((stock, idx) => {
      if (idx > 0) doc.addPage();
      drawProductPage(doc, stock, imageMap[stock._id.toString()] || null, businessName, pageW, pageH, idx + 1, total);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: 'Failed to generate PDF.' });
  }
};
