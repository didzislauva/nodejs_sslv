const adsModel = require('../models/adsModel');
const cheerio = require('cheerio');
const axios = require('axios');





// Main logic for scraping ads (can be called directly or via route)
const scrapeAdsLogic = async (location, sublocation, action) => {
  try {
    // Construct the URL
    const url = constructUrl(location, sublocation, action);
    const html = await fetchHtml(url);
    const firstPageAds = extractAds(html); // Reversed to match database order

    console.log(`Fetching ads from URL: ${url}`);
    console.log(`Fetched ${firstPageAds.length} ads from the first page.`);

    // Fetch most recent N ads from the database
    const recentDatabaseAds = await adsModel.fetchRecentAds(location, sublocation, firstPageAds.length);

    console.log(`Fetched ${recentDatabaseAds.length} recent ads from the database for ${location}/${sublocation}.`);

    const matchedAds = [];
    const unmatchedAds = [];

    // Match and classify ads
    for (const ad of firstPageAds) {
      const match = recentDatabaseAds.find(dbAd => dbAd.ad_key === ad.key);
      if (match) {
        matchedAds.push(match);
      } else {
        unmatchedAds.push(ad);
      }
    }

    console.log(`${matchedAds.length} ads matched with recent database ads.`);
    console.log(`${unmatchedAds.length} ads are new or potentially renewed.`);

    // Process unmatched ads (new or renewed)
    for (const ad of unmatchedAds) {
      const details = await scrapeAdDetails(ad.link);
      if (!details.postingDate) {
        console.log(`Skipped ad ${ad.key} - no posting date found.`);
        continue;
      }

      const existingAd = await adsModel.findAdByKey(ad.key);
      if (!existingAd) {
        console.log(`New ad found: ${ad.key}. Inserting into database.`);
        await adsModel.insertAd(ad.key, ad.link, details.postingDate, location, sublocation);
      } else if (existingAd.posting_date !== details.postingDate) {
        console.log(`Renewed ad found: ${ad.key}. Updating posting date.`);
        await adsModel.updateAdForRenewal(ad.key, details.postingDate);
      }
    }

    // Update `last_seen` for matched ads
    for (const ad of matchedAds) {
      console.log(`Updating last_seen for ad ${ad.ad_key}.`);
      await adsModel.updateLastSeen(ad.ad_key);
    }

    return { matched: matchedAds.length, unmatched: unmatchedAds.length };
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  }
};

// Route handler for scraping ads via HTTP
exports.scrapeAds = async (req, res) => {
  const { location, sublocation, action } = req.params;

  try {
    const result = await scrapeAdsLogic(location, sublocation, action);
    res.json({ message: 'Ads processed successfully', ...result });
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed' });
  }
};

// Helper to construct the URL
const constructUrl = (location, sublocation, action) => {
  const baseUrl = 'https://www.ss.lv/lv/real-estate/flats';
  return `${baseUrl}/${location}/${sublocation}/${action}/`; 
};

// Helper to fetch HTML content from a URL
const fetchHtml = async (url) => {
  try {
    const { data: html } = await axios.get(url);
    return html; // Return the fetched HTML content
  } catch (error) {
    throw new Error(`Failed to fetch HTML: ${error.message}`);
  }
};

// Helper to extract ads from HTML
const extractAds = (html) => {
  const $ = cheerio.load(html);
  const ads = [];

  // Extract ad links and keys
  $('tr').each((index, row) => {
    const link = $(row).find('a.am').attr('href');
    const key = link?.split('/').pop().replace('.html', '');

    // Avoid duplicates in the ads array
    if (link && key && !ads.some((ad) => ad.key === key)) {
      ads.push({ key, link });
    }
  });

  return ads.reverse(); // Return the list of ads
};

// Helper to process a single ad (insert, update, or refresh)
const processAd = async (ad) => {
  const details = await scrapeAdDetails(ad.link); // Fetch posting date
  if (!details.postingDate) return; // Skip if posting date is unavailable

  const postingDate = details.postingDate; // Ensure date format matches YYYY-MM-DD
  const existingAd = await adsModel.findAdByKey(ad.key); // Check if the ad exists in the database

  if (!existingAd) {
    await adsModel.insertAd(ad.key, ad.link, postingDate); // Insert new ad
  } else if (existingAd.posting_date !== postingDate) {
    await adsModel.updateAdForRenewal(ad.key, postingDate); // Update if posting date changed
  } else {
    await adsModel.updateLastSeen(ad.key); // Refresh last_seen if no changes
  }
};

// Helper to scrape additional ad details
const scrapeAdDetails = async (link) => {
  try {
    const fullUrl = `https://www.ss.lv${link}`;
    const { data: html } = await axios.get(fullUrl);
    const $ = cheerio.load(html);

    // Extract posting date
    const postingDateText = $('td.msg_footer').text().match(/Datums:\s(\d{2}\.\d{2}\.\d{4})/);
    let postingDate = postingDateText ? postingDateText[1] : null;

    if (postingDate) {
      const [day, month, year] = postingDate.split('.');
      postingDate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
    }

    return { postingDate };
  } catch (error) {
    console.error(`Failed to scrape ad details for link: ${link}`, error);
    return { postingDate: null };
  }
};

exports.scrapeAdsLogic = scrapeAdsLogic;