const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');

// Route for scraping ads based on action and location
router.get('/:location/:sublocation/:action', adsController.scrapeAds);

module.exports = router;