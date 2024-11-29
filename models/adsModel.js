const db = require('../database/dbConnection');


// Find an ad by key
exports.findAdByKey = async (adKey) => {
  const query = `
    SELECT ad_key, link, DATE(posting_date) as posting_date, renewals, last_seen
    FROM ads
    WHERE ad_key = ? LIMIT 1
  `;
  const [rows] = await db.execute(query, [adKey]);
  return rows[0]; // Return a single row or undefined if not found
};

// Insert a new ad
exports.insertAd = async (adKey, link, postingDate, location, sublocation) => {
  const query = `
    INSERT INTO ads (ad_key, link, posting_date, location, sublocation, renewals, last_seen)
    VALUES (?, ?, ?, ?, ?, 0, NOW())
  `;
  await db.execute(query, [adKey, link, postingDate, location, sublocation]);
};

// Update an existing ad's posting date and increment renewals
exports.updateAdForRenewal = async (adKey, postingDate) => {
  const query = `
    UPDATE ads 
    SET 
      renewals = CASE WHEN posting_date != ? THEN renewals + 1 ELSE renewals END, 
      posting_date = ?, 
      last_seen = NOW()
    WHERE ad_key = ? AND posting_date != ?
  `;
  await db.execute(query, [postingDate, postingDate, adKey, postingDate]);
};

// Refresh the last_seen timestamp
exports.updateLastSeen = async (adKey) => {
  const query = `
    UPDATE ads 
    SET last_seen = NOW() 
    WHERE ad_key = ?
  `;
  await db.execute(query, [adKey]);
};

// Fetch most recent N ads filtered by location and sublocation
exports.fetchRecentAds = async (location, sublocation, limit) => {
  const query = `
    SELECT ad_key, posting_date
    FROM ads
    WHERE location = ? AND sublocation = ?
    ORDER BY id DESC
    LIMIT ?
  `;
  const [rows] = await db.execute(query, [location, sublocation, limit]);
  return rows;
};