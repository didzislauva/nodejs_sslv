const express = require('express');
const loopController = require('../controllers/loopController');

const router = express.Router();

router.post('/add', loopController.addLoop); // Add a new loop
router.post('/start', loopController.startLoop); // Start a loop
router.post('/stop', loopController.stopLoop); // Stop a loop
router.post('/remove', loopController.removeLoop); // Remove a loop
router.get('/', loopController.getLoops); // Get all loops

module.exports = router; 