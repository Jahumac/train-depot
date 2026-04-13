/**
 * Train Depot - Model Train Catalog Server
 * Zero external dependencies - uses only Node.js built-in modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');

const PORT = process.env.PORT || 8005;
const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads');
const MAX_BODY_SIZE = 50 * 1024 * 1024;   // 50 MB overall request limit
const MAX_FILE_SIZE = 10 * 1024 * 1024;    // 10 MB per uploaded file
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json'
};

// ==================== Session Store ====================

const sessions = new Map();

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(res) {
  const token = generateSessionToken();
  const maxAgeSec = Math.floor(SESSION_MAX_AGE / 1000);
  sessions.set(token, {
    created: Date.now(),
    expires: Date.now() + SESSION_MAX_AGE
  });
  res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSec}`);
  return token;
}

function destroySession(req, res) {
  const token = getSessionToken(req);
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
}

function getSessionToken(req) {
  const cookies = req.headers.cookie || '';
  const match = cookies.match(/(?:^|;\s*)session=([a-f0-9]+)/);
  return match ? match[1] : null;
}

function isValidSession(req) {
  const token = getSessionToken(req);
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (session.expires < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function isAuthenticated(req) {
  // If no password is set, everything is open
  if (!db.hasPassword()) return true;
  return isValidSession(req);
}

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expires < now) sessions.delete(token);
  }
}, 60 * 60 * 1000);

// ==================== Rate Limiter ====================

const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // max attempts per window
const RATE_LIMIT_BLOCK = 15 * 60 * 1000; // block for 15 min after exceeding

function getRateLimitKey(req) {
  return req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
}

function checkRateLimit(req) {
  const key = getRateLimitKey(req);
  const now = Date.now();
  let record = rateLimits.get(key);

  if (!record) return true;
  if (record.blockedUntil && record.blockedUntil > now) return false;
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimits.delete(key);
    return true;
  }
  return record.attempts < RATE_LIMIT_MAX;
}

function recordLoginAttempt(req) {
  const key = getRateLimitKey(req);
  const now = Date.now();
  let record = rateLimits.get(key);

  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    record = { firstAttempt: now, attempts: 0 };
  }
  record.attempts++;
  if (record.attempts >= RATE_LIMIT_MAX) {
    record.blockedUntil = now + RATE_LIMIT_BLOCK;
  }
  rateLimits.set(key, record);
}

function clearRateLimit(req) {
  const key = getRateLimitKey(req);
  rateLimits.delete(key);
}

// Clean up old rate limit records every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimits) {
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW * 2) rateLimits.delete(key);
  }
}, 30 * 60 * 1000);

// ==================== Helpers ====================

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function readBody(req, limit = MAX_BODY_SIZE) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;
    req.on('data', chunk => {
      totalSize += chunk.length;
      if (totalSize > limit) {
        req.destroy();
        reject(new Error(`Request body exceeds maximum size of ${Math.round(limit / 1024 / 1024)}MB`));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseJsonBody(buffer) {
  try {
    return JSON.parse(buffer.toString());
  } catch {
    return null;
  }
}

/**
 * Parse multipart form data (for image uploads)
 */
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundary = Buffer.from(`--${boundary}--`);

  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length + 2; // skip \r\n

  while (start < buffer.length) {
    let end = buffer.indexOf(boundaryBuffer, start);
    if (end === -1) break;

    const partData = buffer.slice(start, end - 2); // -2 for \r\n before boundary
    const headerEnd = partData.indexOf('\r\n\r\n');
    if (headerEnd === -1) { start = end + boundaryBuffer.length + 2; continue; }

    const headerStr = partData.slice(0, headerEnd).toString();
    const body = partData.slice(headerEnd + 4);

    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    const contentTypeMatch = headerStr.match(/Content-Type:\s*(.+)/i);

    parts.push({
      name: nameMatch ? nameMatch[1] : '',
      filename: filenameMatch ? filenameMatch[1] : null,
      contentType: contentTypeMatch ? contentTypeMatch[1].trim() : null,
      data: body
    });

    start = end + boundaryBuffer.length + 2;
    if (buffer.slice(end, end + endBoundary.length).equals(endBoundary)) break;
  }

  return parts;
}

/**
 * Parse CSV string into array of objects
 */
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim().toLowerCase().replace(/\s+/g, '_')] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// ==================== Auth Route Handlers ====================

async function handleAuthRequest(req, res, pathname) {
  // POST /api/auth/login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    if (!checkRateLimit(req)) {
      return sendError(res, 429, 'Too many login attempts. Please try again in 15 minutes.');
    }

    const body = await readBody(req, 1024); // small limit for login
    const data = parseJsonBody(body);
    if (!data || !data.password) return sendError(res, 400, 'Password is required');

    // If no password set yet, this is the setup call
    if (!db.hasPassword()) {
      if (data.password.length < 4) return sendError(res, 400, 'Password must be at least 4 characters');
      db.setPassword(data.password);
      createSession(res);
      clearRateLimit(req);
      return sendJson(res, 200, { message: 'Password set and logged in', setup: true });
    }

    // Verify password
    if (db.verifyPassword(data.password)) {
      createSession(res);
      clearRateLimit(req);
      return sendJson(res, 200, { message: 'Logged in' });
    }

    recordLoginAttempt(req);
    return sendError(res, 401, 'Invalid password');
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    destroySession(req, res);
    return sendJson(res, 200, { message: 'Logged out' });
  }

  // GET /api/auth/status
  if (pathname === '/api/auth/status' && req.method === 'GET') {
    const hasPass = db.hasPassword();
    const authenticated = isAuthenticated(req);
    return sendJson(res, 200, {
      hasPassword: hasPass,
      authenticated,
      requiresSetup: !hasPass
    });
  }

  // POST /api/auth/change-password
  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    if (!isAuthenticated(req)) return sendError(res, 401, 'Not authenticated');

    const body = await readBody(req, 1024);
    const data = parseJsonBody(body);
    if (!data) return sendError(res, 400, 'Invalid JSON');

    if (db.hasPassword() && data.currentPassword) {
      if (!db.verifyPassword(data.currentPassword)) {
        return sendError(res, 401, 'Current password is incorrect');
      }
    }

    if (!data.newPassword || data.newPassword.length < 4) {
      return sendError(res, 400, 'New password must be at least 4 characters');
    }

    db.setPassword(data.newPassword);
    return sendJson(res, 200, { message: 'Password changed' });
  }

  // POST /api/auth/remove-password
  if (pathname === '/api/auth/remove-password' && req.method === 'POST') {
    if (!isAuthenticated(req)) return sendError(res, 401, 'Not authenticated');

    const body = await readBody(req, 1024);
    const data = parseJsonBody(body);

    if (db.hasPassword()) {
      if (!data || !data.password) return sendError(res, 400, 'Current password required');
      if (!db.verifyPassword(data.password)) return sendError(res, 401, 'Password is incorrect');
    }

    db.removePassword();
    return sendJson(res, 200, { message: 'Password removed — app is now open access' });
  }

  return null; // not handled
}

// ==================== API Route Handlers ====================

async function handleApiRequest(req, res, pathname) {
  // Auth routes (no auth required for these)
  if (pathname.startsWith('/api/auth/')) {
    const result = await handleAuthRequest(req, res, pathname);
    if (result !== null) return;
    return sendError(res, 404, 'Auth endpoint not found');
  }

  // All other API routes require authentication
  if (!isAuthenticated(req)) {
    return sendError(res, 401, 'Authentication required');
  }

  // GET /api/items
  if (pathname === '/api/items' && req.method === 'GET') {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const search = reqUrl.searchParams.get('search');
    const category = reqUrl.searchParams.get('category');
    const subcategory = reqUrl.searchParams.get('subcategory');
    const wishlist = reqUrl.searchParams.get('wishlist');

    let items;
    if (search) {
      items = db.searchItems(search);
    } else if (subcategory) {
      items = db.getItemsBySubcategory(subcategory);
    } else if (category) {
      items = db.getItemsByCategory(category);
    } else {
      items = db.getAllItems();
    }

    // Filter wishlist items if requested
    if (wishlist === 'true') {
      items = items.filter(item => item.wishlist);
    }

    return sendJson(res, 200, items);
  }

  // GET /api/items/:id
  const itemMatch = pathname.match(/^\/api\/items\/([^/]+)$/);
  if (itemMatch && req.method === 'GET') {
    const item = db.getItemById(itemMatch[1]);
    if (!item) return sendError(res, 404, 'Item not found');
    return sendJson(res, 200, item);
  }

  // POST /api/items
  if (pathname === '/api/items' && req.method === 'POST') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data) return sendError(res, 400, 'Invalid JSON');
    if (!data.name || !data.name.trim()) return sendError(res, 400, 'Name is required');
    if (!data.categoryId) return sendError(res, 400, 'Category is required');
    if (!data.subcategoryId) return sendError(res, 400, 'Subcategory is required');
    const item = db.createItem(data);
    return sendJson(res, 201, item);
  }

  // PUT /api/items/:id
  if (itemMatch && req.method === 'PUT') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data) return sendError(res, 400, 'Invalid JSON');
    const item = db.updateItem(itemMatch[1], data);
    if (!item) return sendError(res, 404, 'Item not found');
    return sendJson(res, 200, item);
  }

  // DELETE /api/items/:id
  if (itemMatch && req.method === 'DELETE') {
    const deleted = db.deleteItem(itemMatch[1]);
    if (!deleted) return sendError(res, 404, 'Item not found');

    // Clean up orphaned image files
    if (deleted.images && deleted.images.length > 0) {
      for (const imgPath of deleted.images) {
        if (imgPath.startsWith('/uploads/')) {
          const filePath = path.join(UPLOAD_DIR, path.basename(imgPath));
          fs.unlink(filePath, () => {}); // async, ignore errors
        }
      }
    }

    return sendJson(res, 200, { message: 'Item deleted' });
  }

  // POST /api/items/csv-import
  if (pathname === '/api/items/csv-import' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    let csvStr;

    if (contentType.includes('multipart')) {
      const boundaryMatch = contentType.match(/boundary=(.+)/);
      if (!boundaryMatch) return sendError(res, 400, 'Missing boundary');
      const body = await readBody(req);
      const parts = parseMultipart(body, boundaryMatch[1]);
      const filePart = parts.find(p => p.filename);
      if (!filePart) return sendError(res, 400, 'No file uploaded');
      csvStr = filePart.data.toString();
    } else {
      const body = await readBody(req);
      csvStr = body.toString();
    }

    try {
      const rows = parseCSV(csvStr);
      const imported = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // Map CSV columns to item fields (flexible column naming)
          const itemData = {
            name: row.name || row.model || row.item || '',
            manufacturer: row.manufacturer || row.make || '',
            livery: row.livery || row.colour || row.color || '',
            purchasePrice: parseFloat(row.purchase_price || row.price || row.cost || 0) || 0,
            currentValue: parseFloat(row.current_value || row.value || 0) || 0,
            placeOfPurchase: row.place_of_purchase || row.retailer || row.shop || row.bought_from || '',
            lastServiceDate: row.last_service_date || row.service_date || row.last_service || '',
            goesWellWith: row.goes_well_with || row.compatible || '',
            historicalBackground: row.historical_background || row.history || row.description || '',
            categoryId: row.category_id || row.category || '',
            subcategoryId: row.subcategory_id || row.subcategory || '',
            wishlist: row.wishlist === 'true' || row.wishlist === '1' || row.wishlist === 'yes',
            images: []
          };

          if (!itemData.name) {
            errors.push(`Row ${i + 1}: missing name`);
            continue;
          }

          // Try to match category/subcategory by name if IDs aren't valid
          if (itemData.categoryId && !db.getCategories().some(c => c.id === itemData.categoryId)) {
            const cat = db.getCategories().find(c => c.name.toLowerCase() === itemData.categoryId.toLowerCase());
            if (cat) itemData.categoryId = cat.id;
          }
          if (itemData.subcategoryId) {
            const allSubs = db.getCategories().flatMap(c => c.subcategories);
            if (!allSubs.some(s => s.id === itemData.subcategoryId)) {
              const sub = allSubs.find(s => s.name.toLowerCase() === itemData.subcategoryId.toLowerCase());
              if (sub) {
                itemData.subcategoryId = sub.id;
                itemData.categoryId = sub.parent;
              }
            }
          }

          // Default category if none matched
          if (!itemData.categoryId) itemData.categoryId = 'locomotives';
          if (!itemData.subcategoryId) {
            const cat = db.getCategories().find(c => c.id === itemData.categoryId);
            itemData.subcategoryId = cat && cat.subcategories.length > 0 ? cat.subcategories[0].id : '';
          }

          const item = db.createItem(itemData);
          imported.push(item);
        } catch (e) {
          errors.push(`Row ${i + 1}: ${e.message}`);
        }
      }

      return sendJson(res, 200, {
        message: `Imported ${imported.length} items${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        imported: imported.length,
        errors
      });
    } catch (e) {
      return sendError(res, 400, 'Invalid CSV: ' + e.message);
    }
  }

  // POST /api/upload
  if (pathname === '/api/upload' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return sendError(res, 400, 'Missing boundary');

    const body = await readBody(req);
    const parts = parseMultipart(body, boundaryMatch[1]);
    const savedFiles = [];

    for (const part of parts) {
      if (part.filename && part.data.length > 0) {
        if (part.data.length > MAX_FILE_SIZE) {
          continue; // skip files exceeding 10MB
        }
        const ext = path.extname(part.filename).toLowerCase() || '.jpg';
        const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        if (!allowed.includes(ext)) continue;

        const filename = `${crypto.randomUUID()}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, part.data);
        savedFiles.push(`/uploads/${filename}`);
      }
    }

    return sendJson(res, 200, { files: savedFiles });
  }

  // === Category Management ===

  // GET /api/categories
  if (pathname === '/api/categories' && req.method === 'GET') {
    return sendJson(res, 200, db.getCategories());
  }

  // POST /api/categories
  if (pathname === '/api/categories' && req.method === 'POST') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data || !data.name || !data.name.trim()) return sendError(res, 400, 'Category name is required');
    try {
      const cat = db.addCategory(data.name.trim());
      return sendJson(res, 201, cat);
    } catch (e) {
      return sendError(res, 400, e.message);
    }
  }

  // PUT /api/categories/:id
  const catMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
  if (catMatch && req.method === 'PUT') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data || !data.name || !data.name.trim()) return sendError(res, 400, 'Category name is required');
    const cat = db.updateCategory(catMatch[1], data.name.trim());
    if (!cat) return sendError(res, 404, 'Category not found');
    return sendJson(res, 200, cat);
  }

  // DELETE /api/categories/:id
  if (catMatch && req.method === 'DELETE') {
    try {
      const deleted = db.deleteCategory(catMatch[1]);
      if (!deleted) return sendError(res, 404, 'Category not found');
      return sendJson(res, 200, { message: 'Category deleted' });
    } catch (e) {
      return sendError(res, 400, e.message);
    }
  }

  // POST /api/categories/:id/subcategories
  const subAddMatch = pathname.match(/^\/api\/categories\/([^/]+)\/subcategories$/);
  if (subAddMatch && req.method === 'POST') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data || !data.name || !data.name.trim()) return sendError(res, 400, 'Subcategory name is required');
    try {
      const sub = db.addSubcategory(subAddMatch[1], data.name.trim());
      return sendJson(res, 201, sub);
    } catch (e) {
      return sendError(res, 400, e.message);
    }
  }

  // PUT /api/categories/:catId/subcategories/:subId
  const subMatch = pathname.match(/^\/api\/categories\/([^/]+)\/subcategories\/([^/]+)$/);
  if (subMatch && req.method === 'PUT') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data || !data.name || !data.name.trim()) return sendError(res, 400, 'Subcategory name is required');
    const sub = db.updateSubcategory(subMatch[1], subMatch[2], data.name.trim());
    if (!sub) return sendError(res, 404, 'Subcategory not found');
    return sendJson(res, 200, sub);
  }

  // DELETE /api/categories/:catId/subcategories/:subId
  if (subMatch && req.method === 'DELETE') {
    try {
      const deleted = db.deleteSubcategory(subMatch[1], subMatch[2]);
      if (!deleted) return sendError(res, 404, 'Subcategory not found');
      return sendJson(res, 200, { message: 'Subcategory deleted' });
    } catch (e) {
      return sendError(res, 400, e.message);
    }
  }

  // GET /api/settings
  if (pathname === '/api/settings' && req.method === 'GET') {
    return sendJson(res, 200, db.getSettings());
  }

  // PUT /api/settings
  if (pathname === '/api/settings' && req.method === 'PUT') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data) return sendError(res, 400, 'Invalid JSON');
    const settings = db.updateSettings(data);
    return sendJson(res, 200, settings);
  }

  // GET /api/stats
  if (pathname === '/api/stats' && req.method === 'GET') {
    return sendJson(res, 200, db.getStats());
  }

  // GET /api/export
  if (pathname === '/api/export' && req.method === 'GET') {
    const data = db.exportData();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${db.getSettings().appName.toLowerCase().replace(/\s+/g, '-')}-backup.json"`
    });
    return res.end(data);
  }

  // POST /api/import
  if (pathname === '/api/import' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    let jsonStr;

    if (contentType.includes('multipart')) {
      const boundaryMatch = contentType.match(/boundary=(.+)/);
      if (!boundaryMatch) return sendError(res, 400, 'Missing boundary');
      const body = await readBody(req);
      const parts = parseMultipart(body, boundaryMatch[1]);
      const filePart = parts.find(p => p.filename);
      if (!filePart) return sendError(res, 400, 'No file uploaded');
      jsonStr = filePart.data.toString();
    } else {
      const body = await readBody(req);
      jsonStr = body.toString();
    }

    try {
      db.importData(jsonStr);
      return sendJson(res, 200, { message: 'Data imported successfully' });
    } catch (e) {
      return sendError(res, 400, 'Invalid backup file: ' + e.message);
    }
  }

  return sendError(res, 404, 'API endpoint not found');
}

function serveStaticFile(res, filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const isAsset = ['.png','.jpg','.jpeg','.gif','.webp','.svg','.woff','.woff2','.ico'].includes(ext);
    const cacheHeader = isAsset
      ? 'public, max-age=86400'
      : 'public, max-age=300, must-revalidate';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheHeader
    });
    res.end(data);
  });
}

// ==================== Main Server ====================

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  // CORS headers (for development)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  try {
    // API routes
    if (pathname.startsWith('/api/')) {
      return await handleApiRequest(req, res, pathname);
    }

    // Auth check for non-API routes (static files, pages)
    // Always allow: login page, its assets, service worker, manifest
    const publicPaths = ['/login.html', '/css/', '/js/', '/manifest.json', '/sw.js', '/favicon'];
    const isPublic = publicPaths.some(p => pathname.startsWith(p) || pathname === p);

    if (!isPublic && !isAuthenticated(req)) {
      // Redirect to login page
      if (pathname === '/' || pathname === '/index.html') {
        res.writeHead(302, { 'Location': '/login.html' });
        return res.end();
      }
      // For other static files, return 401
      return sendError(res, 401, 'Authentication required');
    }

    // Serve uploaded images (requires auth)
    if (pathname.startsWith('/uploads/')) {
      if (!isAuthenticated(req)) return sendError(res, 401, 'Authentication required');
      const filePath = path.join(UPLOAD_DIR, path.basename(pathname));
      return serveStaticFile(res, filePath);
    }

    // Serve static files
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    const staticPath = path.join(__dirname, 'static', pathname);

    // Security: prevent directory traversal
    if (!staticPath.startsWith(path.join(__dirname, 'static'))) {
      return sendError(res, 403, 'Forbidden');
    }

    serveStaticFile(res, staticPath);
  } catch (err) {
    console.error('Server error:', err);
    sendError(res, 500, 'Internal server error');
  }
});

// Initialize database
db.ensureDbExists();

server.listen(PORT, () => {
  const settings = db.getSettings();
  console.log(`\n🚂 ${settings.appName}`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   Authentication: ${db.hasPassword() ? 'enabled' : 'open (no password set)'}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
