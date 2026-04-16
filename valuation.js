/**
 * eBay Valuation Service for Train Depot
 * Uses eBay Browse API to fetch sold/completed listing prices
 * Zero external dependencies - uses Node.js built-in https module
 */

const https = require('https');
const http = require('http');

// ==================== eBay API Configuration ====================

const EBAY_AUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const EBAY_SANDBOX_AUTH_URL = 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';
const EBAY_BROWSE_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
const EBAY_SANDBOX_BROWSE_URL = 'https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search';

// Cache for OAuth token
let _tokenCache = {
  token: null,
  expires: 0
};

// ==================== HTTP Helper ====================

function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 15000
    };

    const req = lib.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// ==================== eBay OAuth ====================

async function getOAuthToken(appId, certId, sandbox = false) {
  // Check cache first
  if (_tokenCache.token && Date.now() < _tokenCache.expires - 60000) {
    return _tokenCache.token;
  }

  const authUrl = sandbox ? EBAY_SANDBOX_AUTH_URL : EBAY_AUTH_URL;
  const credentials = Buffer.from(`${appId}:${certId}`).toString('base64');

  const response = await httpsRequest(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope'
  });

  if (response.statusCode !== 200) {
    const err = JSON.parse(response.body || '{}');
    throw new Error(`eBay auth failed (${response.statusCode}): ${err.error_description || err.error || 'Unknown error'}`);
  }

  const data = JSON.parse(response.body);
  _tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in * 1000)
  };

  return data.access_token;
}

// ==================== eBay Search ====================

/**
 * Search eBay for sold/completed listings of a model train
 * @param {Object} item - The train item to search for
 * @param {Object} config - eBay API configuration {appId, certId, sandbox}
 * @returns {Object} Valuation data
 */
async function searchEbay(item, config) {
  if (!config.appId || !config.certId) {
    throw new Error('eBay API credentials not configured. Go to Settings to add your eBay App ID and Cert ID.');
  }

  const token = await getOAuthToken(config.appId, config.certId, config.sandbox);
  const browseUrl = config.sandbox ? EBAY_SANDBOX_BROWSE_URL : EBAY_BROWSE_URL;

  // Build progressively broader queries — all stay in the OO gauge category
  // so we never cross-match N-gauge or O-gauge items (different price tier).
  const attempts = buildSearchAttempts(item);

  let bestData = null;
  let bestQuery = '';
  for (const attempt of attempts) {
    const params = new URLSearchParams({
      q: attempt.q,
      category_ids: '180293',  // OO Gauge — always enforced
      filter: 'conditionIds:{1000|1500|2000|2500|3000|4000|5000|6000|7000},' +
              'buyingOptions:{FIXED_PRICE|AUCTION},' +
              'priceCurrency:GBP',
      sort: '-price',
      limit: '30'
    });

    const response = await httpsRequest(`${browseUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB',
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode !== 200) {
      const err = JSON.parse(response.body || '{}');
      throw new Error(`eBay search failed (${response.statusCode}): ${err.errors?.[0]?.message || 'Unknown error'}`);
    }

    const data = JSON.parse(response.body);
    const filtered = filterRelevantListings(data.itemSummaries || [], item);
    if (filtered.length > 0) {
      bestData = { itemSummaries: filtered };
      bestQuery = attempt.q;
      break;
    }
  }

  const result = parseEbayResults(bestData || {}, item);
  result.searchQuery = bestQuery;
  return result;
}

/**
 * Progressively broader queries. All stay in the OO gauge category.
 */
function buildSearchAttempts(item) {
  const attempts = [];
  const mfg = (item.manufacturer || '').trim();
  const code = (item.productCode || '').trim();
  const name = (item.name || '').trim();

  if (code && mfg) attempts.push({ q: `${mfg} ${code}` });
  if (code) attempts.push({ q: code });
  if (name && mfg) attempts.push({ q: `${mfg} ${name}` });
  if (name) attempts.push({ q: name });

  if (attempts.length === 0) attempts.push({ q: 'OO gauge' });
  return attempts;
}

/**
 * Keep only listings whose title plausibly matches our item AND
 * looks like an actual model — not a photograph, postcard, book,
 * decal, transfer, brochure, etc. Sellers routinely list those in
 * the OO Gauge category and they were inflating the comparables
 * pool with £1-£5 items that are not models at all.
 */
const NON_MODEL_KEYWORDS = [
  // Paper / media collectables
  'photo', 'photograph', 'postcard', 'post card', 'poster', 'print',
  'slide', 'negative', 'book', 'booklet', 'magazine', 'brochure',
  'catalogue', 'catalog', 'leaflet', 'manual', 'instruction',
  // Decals / transfers / stickers
  'decal', 'sticker', 'transfer', 'name plate only', 'nameplate only',
  // Empty packaging
  'empty box', 'box only', 'empty case',
  // Unrelated
  'dvd', 'video', 'cd-rom', 'cdrom'
];

function filterRelevantListings(listings, item) {
  const code = (item.productCode || '').toLowerCase().trim();
  const mfg = (item.manufacturer || '').toLowerCase().trim();
  const nameWords = (item.name || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length >= 4 && !['with', 'class', 'tank', 'type'].includes(w));

  return listings.filter(l => {
    const title = (l.title || '').toLowerCase();

    // Hard-reject non-model listings (photos, postcards, books, decals, …)
    if (NON_MODEL_KEYWORDS.some(k => title.includes(k))) return false;

    // Must plausibly match our item by code, manufacturer, or name keyword
    if (code && title.includes(code)) return true;
    if (mfg && title.includes(mfg)) return true;
    if (nameWords.some(w => title.includes(w))) return true;
    return false;
  });
}

/**
 * Parse eBay API results into valuation data
 */
function parseEbayResults(data, item) {
  const listings = data.itemSummaries || [];

  if (listings.length === 0) {
    return {
      found: false,
      listingsAnalysed: 0,
      marketValue: null,
      priceRange: null,
      confidence: 'none',
      searchQuery: data._query || '',
      message: 'No matching listings found on eBay',
      valuationDate: new Date().toISOString(),
      listings: []
    };
  }

  // Extract prices (convert to GBP float)
  const prices = listings
    .map(l => ({
      price: parseFloat(l.price?.value || 0),
      currency: l.price?.currency || 'GBP',
      title: l.title,
      condition: l.condition,
      itemWebUrl: l.itemWebUrl,
      image: l.thumbnailImages?.[0]?.imageUrl || null
    }))
    .filter(l => l.price > 0);

  if (prices.length === 0) {
    return {
      found: false,
      listingsAnalysed: 0,
      marketValue: null,
      priceRange: null,
      confidence: 'none',
      message: 'Listings found but no valid prices',
      valuationDate: new Date().toISOString(),
      listings: []
    };
  }

  // Sort by price
  prices.sort((a, b) => a.price - b.price);

  // Calculate statistics
  const allPrices = prices.map(p => p.price);
  const sum = allPrices.reduce((a, b) => a + b, 0);
  const avg = sum / allPrices.length;

  // Use median for more robust estimate (less affected by outliers)
  const mid = Math.floor(allPrices.length / 2);
  const median = allPrices.length % 2 !== 0
    ? allPrices[mid]
    : (allPrices[mid - 1] + allPrices[mid]) / 2;

  // Remove outliers (prices more than 2x median) for better average
  const filtered = allPrices.filter(p => p <= median * 2.5 && p >= median * 0.3);
  const cleanAvg = filtered.length > 0
    ? filtered.reduce((a, b) => a + b, 0) / filtered.length
    : avg;

  // Determine confidence based on number of listings and price spread
  const spread = allPrices[allPrices.length - 1] - allPrices[0];
  const spreadPercent = median > 0 ? (spread / median) * 100 : 100;
  let confidence = 'low';
  if (prices.length >= 5 && spreadPercent < 50) confidence = 'high';
  else if (prices.length >= 3 && spreadPercent < 80) confidence = 'medium';
  else if (prices.length >= 2) confidence = 'low';

  // Condition adjustment factor
  const conditionMultiplier = getConditionMultiplier(item.condition);
  const adjustedValue = Math.round(cleanAvg * conditionMultiplier * 100) / 100;

  return {
    found: true,
    listingsAnalysed: prices.length,
    marketValue: Math.round(adjustedValue * 100) / 100,
    rawAverage: Math.round(cleanAvg * 100) / 100,
    median: Math.round(median * 100) / 100,
    priceRange: {
      low: Math.round(allPrices[0] * 100) / 100,
      high: Math.round(allPrices[allPrices.length - 1] * 100) / 100
    },
    confidence,
    conditionAdjustment: conditionMultiplier !== 1.0
      ? `Adjusted ${conditionMultiplier > 1 ? 'up' : 'down'} for "${item.condition || 'unknown'}" condition`
      : null,
    valuationDate: new Date().toISOString(),
    message: `Based on ${prices.length} eBay listing${prices.length !== 1 ? 's' : ''}`,
    listings: prices.slice(0, 5).map(p => ({
      title: p.title,
      price: p.price,
      condition: p.condition,
      url: p.itemWebUrl,
      image: p.image
    }))
  };
}

/**
 * Get price adjustment multiplier based on item condition
 * Mint boxed items command a premium; fair/poor items trade at a discount
 */
function getConditionMultiplier(condition) {
  const multipliers = {
    'mint-boxed': 1.15,
    'mint': 1.05,
    'excellent-boxed': 1.0,   // baseline
    'excellent': 0.95,
    'good': 0.85,
    'fair': 0.70,
    'poor': 0.50
  };
  return multipliers[condition] || 1.0;
}

// ==================== Batch Valuation ====================

/**
 * Value multiple items (with rate limiting to respect eBay API limits)
 * @param {Array} items - Array of items to value
 * @param {Object} config - eBay API config
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Array} Array of {itemId, valuation} objects
 */
async function batchValuate(items, config, onProgress) {
  const results = [];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      if (onProgress) onProgress(i + 1, items.length, item.name);
      const valuation = await searchEbay(item, config);
      results.push({ itemId: item.id, valuation });
    } catch (err) {
      results.push({
        itemId: item.id,
        valuation: {
          found: false,
          error: err.message,
          valuationDate: new Date().toISOString()
        }
      });
    }
    // Rate limit: 500ms between requests to be kind to eBay API
    if (i < items.length - 1) {
      await delay(500);
    }
  }

  return results;
}

// ==================== Token Cache Management ====================

function clearTokenCache() {
  _tokenCache = { token: null, expires: 0 };
}

module.exports = {
  searchEbay,
  batchValuate,
  clearTokenCache,
  getConditionMultiplier
};
