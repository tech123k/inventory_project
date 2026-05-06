const express = require('express');
const router = express.Router();
const inv = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard-stats', inv.getDashboardStats);
router.get('/stocks', inv.getStocks);
router.post('/stocks', inv.uploadMiddleware, inv.addStock);
router.put('/stocks/:id', inv.uploadMiddleware, inv.updateStock);
router.delete('/stocks/:id', inv.deleteStock);
router.post('/stock-out', inv.stockOut);
router.post('/replenish', inv.replenishStock);
router.get('/movements', inv.getMovements);
router.get('/suggestions', inv.getSuggestions);
router.get('/autofill', inv.getAutofill);
router.get('/catalogue-pdf', inv.downloadCataloguePDF);
router.post('/import', inv.importStocks);

module.exports = router;
