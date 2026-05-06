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

// ─── Premium Catalogue PDF — A4 Landscape, one product per page ──────────────
// Light premium cream aesthetic: warm beige panels, gold accents, dark charcoal text.
function drawProductPage(doc, stock, imgBuf, businessName, pageW, pageH, pageNum, totalPages) {
  const GOLD    = '#C9A84C';
  const GOLD_D  = '#7A5C1E';
  const BASE    = '#FBF8F3';   // light cream page background
  const PANEL   = '#EDE3D5';   // warm beige for image panel, header, footer
  const DARK_TXT = '#1C1A16'; // dark charcoal for main text
  const MUTED   = '#8A7A62';  // warm taupe for labels/secondary text
  const BORDER  = '#C8B49A';  // warm border for MRP box

  const headerH = 50;
  const footerH = 50;
  const bodyH   = pageH - headerH - footerH;
  const leftW   = 360;
  const rX      = leftW + 22;
  const rW      = pageW - leftW - 22 - 22;

  // ── Full-page cream background ─────────────────────────────────────────────
  doc.rect(0, 0, pageW, pageH).fillColor(BASE).fill();

  // Subtle warm glow behind image area
  doc.save().opacity(0.18).circle(leftW / 2, pageH / 2, 220).fillColor(GOLD).fill().restore();

  // ── GOLD CORNER ACCENTS ───────────────────────────────────────────────────
  const cLen = 38, cW = 2;
  doc.rect(0, 0, cLen, cW).fillColor(GOLD).fill();
  doc.rect(0, 0, cW, cLen).fillColor(GOLD).fill();
  doc.rect(pageW - cLen, 0, cLen, cW).fillColor(GOLD).fill();
  doc.rect(pageW - cW, 0, cW, cLen).fillColor(GOLD).fill();
  doc.rect(0, pageH - cW, cLen, cW).fillColor(GOLD).fill();
  doc.rect(0, pageH - cLen, cW, cLen).fillColor(GOLD).fill();
  doc.rect(pageW - cLen, pageH - cW, cLen, cW).fillColor(GOLD).fill();
  doc.rect(pageW - cW, pageH - cLen, cW, cLen).fillColor(GOLD).fill();

  // ── HEADER ────────────────────────────────────────────────────────────────
  // Warm beige header strip
  doc.rect(0, 0, pageW, headerH).fillColor(PANEL).fill();
  // Gold bottom border (solid, visible on light bg)
  doc.moveTo(0, headerH).lineTo(pageW, headerH).lineWidth(1.5).strokeColor(GOLD).stroke();

  // Brand logo box
  doc.roundedRect(18, 11, 30, 30, 7).fillColor(GOLD_D).fill();
  doc.roundedRect(20, 11, 30, 30, 7).fillColor(GOLD).fill();
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF')
    .text((businessName || 'I')[0].toUpperCase(), 20, 17, { width: 30, align: 'center', lineBreak: false });

  // Brand name
  doc.fontSize(12).font('Helvetica-Bold').fillColor(DARK_TXT)
    .text(businessName || 'Inventory Pro', 58, 17, { lineBreak: false, characterSpacing: 1.5 });
  doc.fontSize(6.5).font('Helvetica').fillColor(GOLD)
    .text('PREMIUM COLLECTION', 59, 31, { lineBreak: false, characterSpacing: 2.0 });

  // Gender badge (right-aligned)
  const gColors = { Men: '#1d4ed8', Women: '#be185d', Kids: '#7c3aed', Unisex: '#92400e' };
  const gLabel  = (stock.gender || '').toUpperCase();
  const gc      = gColors[stock.gender] || '#92400e';
  const badgeW  = Math.max(gLabel.length * 6.5 + 20, 40);
  doc.roundedRect(pageW - badgeW - 18, 15, badgeW, 19, 9).fillColor(gc).fill();
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
    .text(gLabel, pageW - badgeW - 18, 20, { width: badgeW, align: 'center', lineBreak: false });

  // Date
  doc.fontSize(7).font('Helvetica').fillColor(MUTED)
    .text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      pageW - 110, 36, { width: 90, align: 'right', lineBreak: false });

  // ── LEFT PANEL: Warm beige image area ────────────────────────────────────
  // Beige panel background for the image zone
  doc.rect(0, headerH, leftW, bodyH).fillColor(PANEL).fill();
  // Gold panel divider (solid, premium look)
  doc.moveTo(leftW, headerH).lineTo(leftW, pageH - footerH).lineWidth(1.5).strokeColor(GOLD).stroke();

  const imgAreaW = 290;
  const imgAreaH = bodyH - 40;
  const imgBoxX  = (leftW - imgAreaW) / 2;
  const imgBoxY  = headerH + (bodyH - imgAreaH) / 2;

  if (imgBuf) {
    try {
      const img      = doc.openImage(imgBuf);
      const aspect   = img.width / img.height;
      const boxRatio = imgAreaW / imgAreaH;
      let drawW, drawH, drawX, drawY;

      // CONTAIN: show full image without any clipping
      if (aspect >= boxRatio) {
        drawW = imgAreaW;
        drawH = imgAreaW / aspect;
        drawX = imgBoxX;
        drawY = imgBoxY + (imgAreaH - drawH) / 2;
      } else {
        drawH = imgAreaH;
        drawW = imgAreaH * aspect;
        drawX = imgBoxX + (imgAreaW - drawW) / 2;
        drawY = imgBoxY;
      }

      // Subtle warm shadow beneath image
      doc.save().opacity(0.22)
        .ellipse(drawX + drawW / 2, drawY + drawH + 8, drawW * 0.40, 8)
        .fillColor(MUTED).fill().restore();

      doc.image(imgBuf, drawX, drawY, { width: drawW, height: drawH });

    } catch (_) {
      doc.fontSize(9).font('Helvetica').fillColor(MUTED)
        .text('No Image', imgBoxX, imgBoxY + imgAreaH / 2 - 6, { width: imgAreaW, align: 'center', lineBreak: false });
    }
  } else {
    doc.save().opacity(0.45)
      .roundedRect(imgBoxX + 10, imgBoxY + 10, imgAreaW - 20, imgAreaH - 20, 12)
      .strokeColor(GOLD).lineWidth(0.8).stroke().restore();
    doc.fontSize(9).font('Helvetica').fillColor(MUTED)
      .text('No Image', imgBoxX, imgBoxY + imgAreaH / 2 - 6, { width: imgAreaW, align: 'center', lineBreak: false });
  }

  // Out-of-stock flag
  if ((stock.currentCartons ?? 0) === 0) {
    doc.roundedRect(imgBoxX + 6, imgBoxY + 8, 78, 17, 3).fillColor('#FEE2E2').fill();
    doc.roundedRect(imgBoxX + 6, imgBoxY + 8, 78, 17, 3)
      .strokeColor('#DC2626').lineWidth(0.6).stroke();
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#DC2626')
      .text('OUT OF STOCK', imgBoxX + 11, imgBoxY + 13, { lineBreak: false, characterSpacing: 1.2 });
  }

  // ── RIGHT PANEL: Product Info ─────────────────────────────────────────────
  let ry = headerH + 26;

  // Stock type tag
  doc.rect(rX, ry + 4, 16, 1.5).fillColor(GOLD).fill();
  if (stock.stockType) {
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GOLD)
      .text(stock.stockType.toUpperCase(), rX + 22, ry, { lineBreak: false, characterSpacing: 2.2 });
  }
  ry += 18;

  // Article name (dark charcoal — readable on cream)
  const nameText   = stock.articleName || '—';
  const nameFontSz = nameText.length > 22 ? 18 : nameText.length > 15 ? 22 : 26;
  doc.fontSize(nameFontSz).font('Helvetica-Bold').fillColor(DARK_TXT)
    .text(nameText.toUpperCase(), rX, ry, { width: rW, lineBreak: true, height: nameFontSz * 2.6, ellipsis: true });
  ry += (nameText.length > 20 ? nameFontSz * 2.8 : nameFontSz * 1.5);

  // Gold rule
  doc.rect(rX, ry, 44, 2.5).fillColor(GOLD).fill();
  doc.save().opacity(0.40).rect(rX + 48, ry + 0.75, 26, 1).fillColor(GOLD).fill().restore();
  ry += 18;

  // Spec rows
  const specs = [
    stock.color      ? ['Color',   stock.color]      : null,
    stock.size       ? ['Size',    stock.size]        : null,
    stock.series     ? ['Series',  stock.series]      : null,
    stock.pairCarton ? ['Per Ctn', stock.pairCarton]  : null,
  ].filter(Boolean);

  specs.forEach(([label, value], i) => {
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(MUTED)
      .text(label.toUpperCase(), rX, ry + 1, { width: 52, lineBreak: false, characterSpacing: 1.2 });
    doc.save().opacity(0.55).rect(rX + 58, ry - 2, 0.7, 15).fillColor(GOLD).fill().restore();
    doc.fontSize(11).font('Helvetica-Bold').fillColor(DARK_TXT)
      .text(String(value), rX + 66, ry - 1, { width: rW - 72, lineBreak: false, ellipsis: true });
    if (i < specs.length - 1) {
      doc.save().opacity(0.30).rect(rX, ry + 18, rW, 0.5).fillColor(BORDER).fill().restore();
    }
    ry += 26;
  });

  // ── Availability ──────────────────────────────────────────────────────────
  const priceAreaY = headerH + bodyH - 118;
  const avail      = stock.currentCartons ?? 0;
  const availColor = avail > 5 ? '#16a34a' : avail > 0 ? '#d97706' : '#dc2626';
  const availLabel = avail > 5 ? 'IN STOCK' : avail > 0 ? 'LOW STOCK' : 'OUT OF STOCK';

  const availY = Math.min(ry + 8, priceAreaY - 40);
  if (availY + 30 < priceAreaY) {
    doc.save().opacity(0.12).roundedRect(rX, availY, rW, 26, 5).fillColor(availColor).fill().restore();
    doc.save().opacity(0.45).roundedRect(rX, availY, rW, 26, 5).strokeColor(availColor).lineWidth(0.5).stroke().restore();
    doc.circle(rX + 14, availY + 13, 4).fillColor(availColor).fill();
    doc.fontSize(8).font('Helvetica-Bold').fillColor(availColor)
      .text(availLabel, rX + 24, availY + 8, { lineBreak: false, characterSpacing: 0.8 });
    doc.fontSize(9).font('Helvetica-Bold').fillColor(availColor)
      .text(`${avail} ${avail === 1 ? 'Carton' : 'Cartons'}`, rX, availY + 8, { width: rW - 10, align: 'right', lineBreak: false });
  }

  // ── Price boxes ───────────────────────────────────────────────────────────
  doc.save().opacity(0.55).rect(rX, priceAreaY, rW, 0.7).fillColor(GOLD).fill().restore();
  const priceY = priceAreaY + 12;
  const boxW   = (rW - 14) / 2;
  const boxH   = 54;

  // MRP box (neutral warm bordered)
  doc.save().opacity(0.25).roundedRect(rX, priceY, boxW, boxH, 8).fillColor(BORDER).fill().restore();
  doc.save().opacity(0.55).roundedRect(rX, priceY, boxW, boxH, 8).strokeColor(BORDER).lineWidth(0.6).stroke().restore();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(MUTED)
    .text('M.R.P.', rX + 11, priceY + 9, { lineBreak: false, characterSpacing: 1 });
  doc.fontSize(19).font('Helvetica-Bold').fillColor(DARK_TXT)
    .text(`Rs.${Number(stock.mrp || 0).toLocaleString('en-IN')}`, rX + 11, priceY + 22, { width: boxW - 18, lineBreak: false, ellipsis: true });

  // Rate box (gold accent)
  const rateX = rX + boxW + 14;
  doc.save().opacity(0.18).roundedRect(rateX, priceY, boxW, boxH, 8).fillColor(GOLD).fill().restore();
  doc.save().opacity(0.70).roundedRect(rateX, priceY, boxW, boxH, 8).strokeColor(GOLD).lineWidth(0.6).stroke().restore();
  doc.rect(rateX, priceY, boxW, 3).fillColor(GOLD).fill();
  doc.fontSize(7).font('Helvetica-Bold').fillColor(GOLD)
    .text('OFFER RATE', rateX + 11, priceY + 9, { lineBreak: false, characterSpacing: 1 });
  doc.fontSize(19).font('Helvetica-Bold').fillColor(GOLD_D)
    .text(`Rs.${Number(stock.rate || 0).toLocaleString('en-IN')}`, rateX + 11, priceY + 22, { width: boxW - 18, lineBreak: false, ellipsis: true });

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footY = pageH - footerH;
  doc.rect(0, footY, pageW, footerH).fillColor(PANEL).fill();
  doc.moveTo(0, footY).lineTo(pageW, footY).lineWidth(1.5).strokeColor(GOLD).stroke();

  // Mini thumbnails
  if (imgBuf) {
    [0, 1, 2].forEach((i) => {
      const thumbX = 20 + i * 42;
      const thumbY = footY + 9;
      const thumbS = 32;
      const thumbOpacity = i === 0 ? 0.92 : 0.35;
      doc.save().opacity(i === 0 ? 0.55 : 0.22)
        .roundedRect(thumbX, thumbY, thumbS, thumbS, 4).fillColor(GOLD).fill().restore();
      doc.save().opacity(i === 0 ? 0.65 : 0.30)
        .roundedRect(thumbX, thumbY, thumbS, thumbS, 4).strokeColor(GOLD).lineWidth(0.5).stroke().restore();
      try {
        doc.save();
        doc.roundedRect(thumbX, thumbY, thumbS, thumbS, 4).clip();
        doc.opacity(thumbOpacity)
          .image(imgBuf, thumbX, thumbY, { fit: [thumbS, thumbS], align: 'center', valign: 'center' });
        doc.restore();
      } catch (_) {}
    });
  }

  // Divider
  doc.save().opacity(0.45).rect(148, footY + 10, 0.6, 30).fillColor(GOLD).fill().restore();

  // Footer text
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(GOLD)
    .text('STANDARD CATALOGUE TEMPLATE', 160, footY + 14, { lineBreak: false, characterSpacing: 1.8 });
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.fontSize(7).font('Helvetica').fillColor(MUTED)
    .text(`${businessName || 'Inventory Pro'}  ·  ${dateStr}  ·  ${pageNum} / ${totalPages}`, 160, footY + 28, { lineBreak: false });

  // Right: Min order
  doc.save().opacity(0.45).rect(pageW - 112, footY + 10, 0.6, 30).fillColor(GOLD).fill().restore();
  doc.fontSize(7).font('Helvetica').fillColor(MUTED)
    .text('MIN. ORDER', pageW - 102, footY + 13, { lineBreak: false, characterSpacing: 1 });
  doc.fontSize(12).font('Helvetica-Bold').fillColor(GOLD_D)
    .text('1 Carton', pageW - 102, footY + 26, { lineBreak: false });
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

    // A4 Landscape for premium poster look
    const doc          = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, autoFirstPage: true });
    const businessName = req.user.businessName || 'Inventory Pro';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${businessName.replace(/\s+/g, '_')}_Catalogue.pdf"`);
    doc.pipe(res);

    const pageW = doc.page.width;   // 841.89 (A4 landscape)
    const pageH = doc.page.height;  // 595.28
    const total = stocks.length;

    stocks.forEach((stock, idx) => {
      if (idx > 0) doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });
      drawProductPage(doc, stock, imageMap[stock._id.toString()] || null, businessName, pageW, pageH, idx + 1, total);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: 'Failed to generate PDF.' });
  }
};
