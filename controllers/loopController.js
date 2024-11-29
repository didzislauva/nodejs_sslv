const adsController = require('./adsController'); // Import adsController

let loops = []; // Store loops in memory
let intervals = {};


// Add a loop
exports.addLoop = (req, res) => {
  const { location, sublocation, action, interval } = req.body;

  if (!req.loops) {
    console.error('Loops array not found!');
    return res.status(500).json({ message: 'Internal server error: Loops not found' });
  }

  const id = req.loops.length + 1;
  const newLoop = { id, location, sublocation, action, interval, status: 'Stopped' };
  req.loops.push(newLoop);

  console.log(`Added loop with ID ${id}. Current loops:`, req.loops);

  res.json(newLoop);
};

// Start a loop
exports.startLoop = async (req, res) => {
  const { id } = req.body;
  const loop = req.loops.find(l => l.id === id);

  if (!loop) {
    console.error(`Loop with ID ${id} not found!`);
    return res.status(404).json({ message: 'Loop not found.' });
  }

  if (loop.status === 'Running') {
    console.warn(`Loop with ID ${id} is already running.`);
    return res.status(400).json({ message: 'Loop already running.' });
  }
  
  
   // Scrape ads immediately
  try {
    console.log(`Scraping ads immediately for loop ID ${id}: ${loop.location}/${loop.sublocation}/${loop.action}`);
    const result = await adsController.scrapeAdsLogic(loop.location, loop.sublocation, loop.action);
    console.log(`Initial scrape result for loop ID ${id}:`, result);
  } catch (error) {
    console.error(`Error during initial scrape for loop ID ${id}:`, error.message);
  }
  
  

  // Set interval for subsequent scraping
  loop.intervalId = setInterval(() => {
    (async () => {
      try {
        console.log(`Running scheduled scrape for loop ID ${id}: ${loop.location}/${loop.sublocation}/${loop.action}`);
        const result = await adsController.scrapeAdsLogic(loop.location, loop.sublocation, loop.action);
        console.log(`Scheduled scrape result for loop ID ${id}:`, result);
      } catch (error) {
        console.error(`Error during scheduled scrape for loop ID ${id}:`, error.message);
      }
    })(); // Immediately Invoked Function Expression (IIFE)
  }, loop.interval * 3600 * 1000); // Convert interval from hours to milliseconds


  loop.status = 'Running';
  console.log(`Started loop with ID ${id}. Current loops:`, req.loops);

  res.json({ message: `Loop ${id} started.` });
};

// Stop a loop
exports.stopLoop = (req, res) => {
  const { id } = req.body;
  const loop = req.loops.find(l => l.id === id);

  if (!loop) {
    console.error(`Loop with ID ${id} not found!`);
    return res.status(404).json({ message: 'Loop not found.' });
  }

  clearInterval(loop.intervalId);
  loop.status = 'Stopped';

  console.log(`Stopped loop with ID ${id}. Current loops:`, req.loops);

  res.json({ message: `Loop ${id} stopped.` });
};

// Remove a loop
exports.removeLoop = (req, res) => {
  const { id } = req.body;

  if (!req.loops) {
    console.error('Loops array not found!');
    return res.status(500).json({ message: 'Internal server error: Loops not found' });
  }

  const loopIndex = req.loops.findIndex(loop => loop.id === id);
  if (loopIndex === -1) {
    console.error(`Loop with ID ${id} not found!`);
    return res.status(404).json({ message: 'Loop not found.' });
  }

  req.loops.splice(loopIndex, 1); // Remove the loop

  console.log(`Removed loop with ID ${id}. Remaining loops:`, req.loops);

  res.json({ message: `Loop ${id} removed.` });
};


// Get all loops
exports.getLoops = (req, res) => {
  if (!req.loops) {
    console.error('Loops array not found!');
    return res.status(500).json({ message: 'Internal server error: Loops not found' });
  }

  // Exclude intervalId to prevent circular structure issues
  const sanitizedLoops = req.loops.map(({ intervalId, ...loop }) => loop);

  console.log('Fetched all loops:', sanitizedLoops);

  res.json(sanitizedLoops); // Send sanitized loops array as JSON
};