const express = require('express');
const loopRouter = require('./routes/loopRouter');
const adsRouter = require('./routes/adsRouter'); // Import adsRouter
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.json());
app.use(express.static('public'));

// Global loops array
const loops = [];

// Pass loops to the router as middleware
app.use('/loops', (req, res, next) => {
  req.loops = loops; // Attach loops to the request
  next();
}, loopRouter);

// Use adsRouter for ads-related routes
app.use('/ads', adsRouter);

// Root route to display the GUI
app.get('/', (req, res) => {
  res.render('loops', { loops }); // Render the EJS template with loops data
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
