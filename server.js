/**
 * Train Depot - Model Train Catalog Server
 * Zero external dependencies - uses only Node.js built-in modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');
const valuation = require('./valuation');

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

// ==================== Session Store (disk-backed) ====================

const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json');
const sessions = new Map();

// Load persisted sessions from disk on startup
(function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      const now = Date.now();
      for (const [token, session] of Object.entries(data)) {
        if (session.expires > now) sessions.set(token, session);
      }
    }
  } catch { /* corrupt file — start fresh */ }
})();

function saveSessions() {
  try {
    const obj = Object.fromEntries(sessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj), 'utf8');
  } catch { /* non-fatal — sessions still work in memory */ }
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setSessionCookie(res, token, maxAgeSec) {
  const parts = [
    `session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSec}`
  ];
  // Secure flag — always on in production (behind HTTPS reverse proxy)
  if (process.env.NODE_ENV !== 'development') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function createSession(res) {
  const token = generateSessionToken();
  const maxAgeSec = Math.floor(SESSION_MAX_AGE / 1000);
  sessions.set(token, {
    created: Date.now(),
    expires: Date.now() + SESSION_MAX_AGE
  });
  setSessionCookie(res, token, maxAgeSec);
  saveSessions();
  return token;
}

function destroySession(req, res) {
  const token = getSessionToken(req);
  if (token) sessions.delete(token);
  setSessionCookie(res, '', 0);
  saveSessions();
}

function destroyAllSessions() {
  sessions.clear();
  saveSessions();
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
    saveSessions();
    return false;
  }
  return true;
}

// ==================== Local-Network Trust ====================

// RFC 1918 / loopback ranges — requests from these IPs skip password.
// Behind NPM (reverse proxy), the real client IP arrives via X-Forwarded-For.
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.socket.remoteAddress || '';
}

function isPrivateIp(ip) {
  // Normalise IPv4-mapped-IPv6 (::ffff:192.168.1.1 → 192.168.1.1)
  const v4 = ip.replace(/^::ffff:/, '');
  if (v4 === '127.0.0.1' || ip === '::1') return true;
  const parts = v4.split('.').map(Number);
  if (parts.length !== 4) return false;
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
}

function isAuthenticated(req) {
  // If no password is set, everything is open
  if (!db.hasPassword()) return true;
  // Local network is always trusted (homelab convenience)
  if (isPrivateIp(getClientIp(req))) return true;
  return isValidSession(req);
}

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [token, session] of sessions) {
    if (session.expires < now) { sessions.delete(token); changed = true; }
  }
  if (changed) saveSessions();
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

// === Zero-dependency ZIP writer (STORED / no compression) ===
// Handles in-memory archives up to ~2 GB — fine for a photo library backup.
// Photos are already JPEG/PNG compressed so STORED keeps the implementation
// tiny with no meaningful size penalty.
const ZIP_CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  return table;
})();

function zipCrc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = ZIP_CRC32_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// Reads a PKZIP archive from a Buffer and returns [{name, data:Buffer}].
// Supports STORED (method 0) and DEFLATE (method 8 via zlib.inflateRaw).
// Sufficient for archives we produce ourselves and anything re-zipped with
// Finder / 7-Zip / the `zip` command.
function parseZipBuffer(buf) {
  // Locate EOCD record — scan back up to 64KB + 22 bytes for signature 0x06054b50
  let eocd = -1;
  const minEocd = Math.max(0, buf.length - 65558);
  for (let i = buf.length - 22; i >= minEocd; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a valid ZIP (no end-of-central-directory record)');

  const totalEntries = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);

  const files = [];
  let p = cdOffset;
  for (let e = 0; e < totalEntries; e++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('Corrupt central-directory entry #' + e);
    const method   = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen  = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commLen  = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nameLen).toString('utf8');
    p += 46 + nameLen + extraLen + commLen;

    // Skip directory entries (names ending in /)
    if (name.endsWith('/')) continue;

    // Read local file header to learn the actual file-data offset
    if (buf.readUInt32LE(localOff) !== 0x04034b50) throw new Error('Corrupt local header for ' + name);
    const lfhNameLen  = buf.readUInt16LE(localOff + 26);
    const lfhExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart   = localOff + 30 + lfhNameLen + lfhExtraLen;
    const compressed  = buf.slice(dataStart, dataStart + compSize);

    let data;
    if (method === 0)      data = compressed;
    else if (method === 8) data = require('zlib').inflateRawSync(compressed);
    else throw new Error('Unsupported compression method ' + method + ' in ' + name);

    files.push({ name, data });
  }
  return files;
}

function createZipBuffer(files) {
  // files: [{ name: string, data: Buffer }]
  const chunks = [];
  const entries = [];
  let offset = 0;

  const now = new Date();
  const dosTime = ((now.getHours() & 0x1F) << 11) | ((now.getMinutes() & 0x3F) << 5) | ((now.getSeconds() >>> 1) & 0x1F);
  const dosDate = (((now.getFullYear() - 1980) & 0x7F) << 9) | (((now.getMonth() + 1) & 0x0F) << 5) | (now.getDate() & 0x1F);

  for (const f of files) {
    const nameBuf = Buffer.from(f.name, 'utf8');
    const size = f.data.length;
    const crc = zipCrc32(f.data);

    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(0x0800, 6);   // flag bit 11 = UTF-8 names
    lfh.writeUInt16LE(0, 8);        // STORED
    lfh.writeUInt16LE(dosTime, 10);
    lfh.writeUInt16LE(dosDate, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(size, 18);
    lfh.writeUInt32LE(size, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);

    chunks.push(lfh, nameBuf, f.data);
    entries.push({ nameBuf, crc, size, offset, dosTime, dosDate });
    offset += 30 + nameBuf.length + size;
  }

  const cdStart = offset;
  for (const e of entries) {
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(e.dosTime, 12);
    cd.writeUInt16LE(e.dosDate, 14);
    cd.writeUInt32LE(e.crc, 16);
    cd.writeUInt32LE(e.size, 20);
    cd.writeUInt32LE(e.size, 24);
    cd.writeUInt16LE(e.nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(e.offset, 42);
    chunks.push(cd, e.nameBuf);
    offset += 46 + e.nameBuf.length;
  }
  const cdSize = offset - cdStart;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdStart, 16);
  eocd.writeUInt16LE(0, 20);
  chunks.push(eocd);

  return Buffer.concat(chunks);
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
      if (data.password.length < 8) return sendError(res, 400, 'Password must be at least 8 characters');
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

    if (!data.newPassword || data.newPassword.length < 8) {
      return sendError(res, 400, 'New password must be at least 8 characters');
    }

    db.setPassword(data.newPassword);
    // Invalidate every other session, then re-issue for the current user
    destroyAllSessions();
    createSession(res);
    return sendJson(res, 200, { message: 'Password changed — all other sessions signed out' });
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
    const tag = reqUrl.searchParams.get('tag');
    const wishlist = reqUrl.searchParams.get('wishlist');
    const page = parseInt(reqUrl.searchParams.get('page')) || null;
    const limit = Math.min(parseInt(reqUrl.searchParams.get('limit')) || 48, 200);

    let items;
    if (search) {
      items = db.searchItems(search);
    } else if (subcategory) {
      items = db.getItemsBySubcategory(subcategory);
    } else if (category) {
      items = db.getItemsByCategory(category);
    } else if (tag) {
      items = db.getItemsByTag(decodeURIComponent(tag));
    } else {
      items = db.getAllItems();
    }

    // Filter wishlist items if requested
    if (wishlist === 'true') {
      items = items.filter(item => item.wishlist);
    }

    // Pagination — only when page param is explicitly provided
    if (page) {
      const total = items.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, pages);
      const start = (safePage - 1) * limit;
      return sendJson(res, 200, {
        items: items.slice(start, start + limit),
        total,
        page: safePage,
        limit,
        pages
      });
    }

    return sendJson(res, 200, items);
  }

  // GET /api/items/check-duplicate?productCode=XYZ — duplicate detection (must be before :id match)
  if (pathname === '/api/items/check-duplicate' && req.method === 'GET') {
    const reqUrl2 = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const productCode = reqUrl2.searchParams.get('productCode');
    if (!productCode) return sendJson(res, 200, { duplicates: [] });
    const duplicates = db.findDuplicatesByProductCode(productCode);
    return sendJson(res, 200, { duplicates: duplicates.map(d => ({ id: d.id, name: d.name, productCode: d.productCode })) });
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

  // DELETE /api/items/:id (soft delete)
  if (itemMatch && req.method === 'DELETE') {
    const deleted = db.deleteItem(itemMatch[1]);
    if (!deleted) return sendError(res, 404, 'Item not found');
    return sendJson(res, 200, { message: 'Item moved to bin', item: deleted });
  }

  // GET /api/trash — list soft-deleted items
  if (pathname === '/api/trash' && req.method === 'GET') {
    return sendJson(res, 200, db.getDeletedItems());
  }

  // POST /api/trash/:id/restore — restore a soft-deleted item
  const trashRestoreMatch = pathname.match(/^\/api\/trash\/([^/]+)\/restore$/);
  if (trashRestoreMatch && req.method === 'POST') {
    const restored = db.restoreItem(trashRestoreMatch[1]);
    if (!restored) return sendError(res, 404, 'Item not found');
    return sendJson(res, 200, { message: 'Item restored', item: restored });
  }

  // DELETE /api/trash/:id — permanently delete item
  const trashDeleteMatch = pathname.match(/^\/api\/trash\/([^/]+)$/);
  if (trashDeleteMatch && req.method === 'DELETE') {
    const removed = db.permanentlyDeleteItem(trashDeleteMatch[1]);
    if (!removed) return sendError(res, 404, 'Item not found');
    // Clean up orphaned image files
    if (removed.images && removed.images.length > 0) {
      for (const imgPath of removed.images) {
        if (imgPath.startsWith('/uploads/')) {
          const filePath = path.join(UPLOAD_DIR, path.basename(imgPath));
          fs.unlink(filePath, () => {});
        }
      }
    }
    return sendJson(res, 200, { message: 'Item permanently deleted' });
  }

  // POST /api/trash/purge — permanently delete all expired items
  if (pathname === '/api/trash/purge' && req.method === 'POST') {
    const purged = db.purgeExpiredItems(30);
    // Clean up image files
    for (const item of purged) {
      if (item.images && item.images.length > 0) {
        for (const imgPath of item.images) {
          if (imgPath.startsWith('/uploads/')) {
            const filePath = path.join(UPLOAD_DIR, path.basename(imgPath));
            fs.unlink(filePath, () => {});
          }
        }
      }
    }
    return sendJson(res, 200, { message: `Purged ${purged.length} expired items`, count: purged.length });
  }

  // POST /api/items/:id/service-log — add service log entry
  const serviceLogMatch = pathname.match(/^\/api\/items\/([^/]+)\/service-log$/);
  if (serviceLogMatch && req.method === 'POST') {
    const body = await readBody(req);
    const data = parseJsonBody(body);
    if (!data || !data.date || !data.note) {
      return sendError(res, 400, 'Service log entry must have date and note');
    }
    const item = db.getItemById(serviceLogMatch[1]);
    if (!item) return sendError(res, 404, 'Item not found');
    if (!item.serviceLog) item.serviceLog = [];
    item.serviceLog.push({ date: data.date, note: data.note });
    const updated = db.updateItem(serviceLogMatch[1], { serviceLog: item.serviceLog });
    return sendJson(res, 200, updated);
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
          const originalCategory = row.category_id || row.category || '';
          const originalSubcategory = row.subcategory_id || row.subcategory || '';
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
            categoryId: originalCategory,
            subcategoryId: originalSubcategory,
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
            else itemData.categoryId = ''; // couldn't match
          }
          if (itemData.subcategoryId) {
            const allSubs = db.getCategories().flatMap(c => c.subcategories);
            if (!allSubs.some(s => s.id === itemData.subcategoryId)) {
              const sub = allSubs.find(s => s.name.toLowerCase() === itemData.subcategoryId.toLowerCase());
              if (sub) {
                itemData.subcategoryId = sub.id;
                itemData.categoryId = sub.parent;
              } else {
                itemData.subcategoryId = ''; // couldn't match
              }
            }
          }

          // Default category if none matched — warn if the CSV had a value that didn't resolve
          if (!itemData.categoryId) {
            itemData.categoryId = 'locomotives';
            if (originalCategory) {
              errors.push(`Row ${i + 1}: warning — category "${originalCategory}" not recognised, defaulted to Locomotives`);
            }
          }
          if (!itemData.subcategoryId) {
            const cat = db.getCategories().find(c => c.id === itemData.categoryId);
            itemData.subcategoryId = cat && cat.subcategories.length > 0 ? cat.subcategories[0].id : '';
            if (originalSubcategory && !itemData.subcategoryId) {
              errors.push(`Row ${i + 1}: warning — subcategory "${originalSubcategory}" not recognised`);
            }
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

  // GET /api/tags
  if (pathname === '/api/tags' && req.method === 'GET') {
    return sendJson(res, 200, db.getAllTags());
  }

  // GET /api/tags/:tag/items
  const tagItemsMatch = pathname.match(/^\/api\/tags\/([^/]+)\/items$/);
  if (tagItemsMatch && req.method === 'GET') {
    const items = db.getItemsByTag(decodeURIComponent(tagItemsMatch[1]));
    return sendJson(res, 200, items);
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

  // GET /api/export/full — ZIP archive with data.json + every uploaded photo
  if (pathname === '/api/export/full' && req.method === 'GET') {
    try {
      const files = [
        { name: 'data.json', data: Buffer.from(db.exportData()) }
      ];
      if (fs.existsSync(UPLOAD_DIR)) {
        for (const filename of fs.readdirSync(UPLOAD_DIR)) {
          const filePath = path.join(UPLOAD_DIR, filename);
          try {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              files.push({ name: 'uploads/' + filename, data: fs.readFileSync(filePath) });
            }
          } catch { /* skip unreadable files */ }
        }
      }
      const zipBuf = createZipBuffer(files);
      const appName = db.getSettings().appName.toLowerCase().replace(/\s+/g, '-');
      const timestamp = new Date().toISOString().slice(0, 10);
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${appName}-full-backup-${timestamp}.zip"`,
        'Content-Length': zipBuf.length
      });
      return res.end(zipBuf);
    } catch (e) {
      return sendError(res, 500, 'Failed to build full backup: ' + e.message);
    }
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

  // POST /api/import/full — restore data.json + uploads/* from a full-backup ZIP
  if (pathname === '/api/import/full' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart')) {
      return sendError(res, 400, 'Expected multipart/form-data with a ZIP file');
    }
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) return sendError(res, 400, 'Missing multipart boundary');

    let zipBuf;
    try {
      const body = await readBody(req);
      const parts = parseMultipart(body, boundaryMatch[1]);
      const filePart = parts.find(p => p.filename);
      if (!filePart) return sendError(res, 400, 'No file uploaded');
      zipBuf = filePart.data;
    } catch (e) {
      return sendError(res, 400, 'Could not read upload: ' + e.message);
    }

    let entries;
    try {
      entries = parseZipBuffer(zipBuf);
    } catch (e) {
      return sendError(res, 400, 'Invalid ZIP archive: ' + e.message);
    }

    const dataEntry = entries.find(e => e.name === 'data.json');
    if (!dataEntry) return sendError(res, 400, 'ZIP is missing data.json — not a Train Depot full backup');

    try {
      db.importData(dataEntry.data.toString('utf8'));
    } catch (e) {
      return sendError(res, 400, 'Invalid data.json inside ZIP: ' + e.message);
    }

    // Restore photos. Use basename only — guard against path-traversal.
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    let photoCount = 0;
    for (const entry of entries) {
      if (entry.name === 'data.json') continue;
      if (entry.name.endsWith('/')) continue;
      if (!entry.name.startsWith('uploads/')) continue;
      const safeName = path.basename(entry.name);
      if (!safeName || safeName === '.' || safeName === '..') continue;
      try {
        fs.writeFileSync(path.join(UPLOAD_DIR, safeName), entry.data);
        photoCount++;
      } catch { /* skip unwriteable files */ }
    }

    return sendJson(res, 200, {
      message: 'Full backup restored successfully',
      photos: photoCount
    });
  }

  // === Share Link Management ===

  // POST /api/share/enable — generate a share token
  if (pathname === '/api/share/enable' && req.method === 'POST') {
    const token = db.generateShareToken();
    return sendJson(res, 200, { token, message: 'Share link enabled' });
  }

  // POST /api/share/disable — revoke share token
  if (pathname === '/api/share/disable' && req.method === 'POST') {
    db.revokeShareToken();
    return sendJson(res, 200, { message: 'Share link disabled' });
  }

  // GET /api/share/status — check share status
  if (pathname === '/api/share/status' && req.method === 'GET') {
    const token = db.getShareToken();
    return sendJson(res, 200, { enabled: !!token, token: token || null });
  }

  // === Valuation Routes ===

  // POST /api/items/:id/valuate — check current market value for a single item
  const valuateMatch = pathname.match(/^\/api\/items\/([^/]+)\/valuate$/);
  if (valuateMatch && req.method === 'POST') {
    const item = db.getItemById(valuateMatch[1]);
    if (!item) return sendError(res, 404, 'Item not found');

    const settings = db.getSettingsInternal();
    if (!settings.ebayAppId || !settings.ebayCertId) {
      return sendError(res, 400, 'eBay API not configured. Go to Settings → eBay Valuation to add your credentials.');
    }

    try {
      const result = await valuation.searchEbay(item, {
        appId: settings.ebayAppId,
        certId: settings.ebayCertId,
        sandbox: settings.ebaySandbox || false,
        gauge: settings.ebayGauge || 'OO'
      });

      // Save valuation data to the item
      const valuationData = {
        ...result,
        // Remove full listing URLs for storage (keep them lean)
        listings: result.listings.map(l => ({
          title: l.title,
          price: l.price,
          condition: l.condition,
          url: l.url
        }))
      };

      // Update the item with valuation data and auto-set currentValue if found
      const updates = { valuation: valuationData };
      if (result.found && result.marketValue) {
        updates.currentValue = result.marketValue;
      }
      const updated = db.updateItem(valuateMatch[1], updates);

      return sendJson(res, 200, { item: updated, valuation: valuationData });
    } catch (err) {
      console.error('Valuation error:', err.message);
      return sendError(res, 500, 'Valuation failed: ' + err.message);
    }
  }

  // POST /api/valuations/refresh — batch refresh valuations for all items (or stale items)
  if (pathname === '/api/valuations/refresh' && req.method === 'POST') {
    const settings = db.getSettingsInternal();
    if (!settings.ebayAppId || !settings.ebayCertId) {
      return sendError(res, 400, 'eBay API not configured');
    }

    const body = await readBody(req, 1024);
    const data = parseJsonBody(body) || {};
    const staleOnly = data.staleOnly !== false; // default: only refresh stale items
    const staleDays = settings.valuationRefreshDays || 7;

    let items = db.getAllItems().filter(i => !i.wishlist); // skip wishlist items

    if (staleOnly) {
      const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000).toISOString();
      items = items.filter(i =>
        !i.valuation || !i.valuation.valuationDate || i.valuation.valuationDate < cutoff
      );
    }

    if (items.length === 0) {
      return sendJson(res, 200, { message: 'All valuations are up to date', refreshed: 0, total: db.getAllItems().length });
    }

    // Cap at 50 items per batch to avoid timeout
    const batch = items.slice(0, 50);

    try {
      const results = await valuation.batchValuate(batch, {
        appId: settings.ebayAppId,
        certId: settings.ebayCertId,
        sandbox: settings.ebaySandbox || false,
        gauge: settings.ebayGauge || 'OO'
      });

      let updated = 0;
      for (const result of results) {
        if (result.valuation) {
          const updates = { valuation: result.valuation };
          if (result.valuation.found && result.valuation.marketValue) {
            updates.currentValue = result.valuation.marketValue;
          }
          db.updateItem(result.itemId, updates);
          updated++;
        }
      }

      return sendJson(res, 200, {
        message: `Refreshed ${updated} of ${batch.length} items`,
        refreshed: updated,
        total: items.length,
        remaining: Math.max(0, items.length - batch.length)
      });
    } catch (err) {
      return sendError(res, 500, 'Batch valuation failed: ' + err.message);
    }
  }

  // GET /api/valuations/summary — collection valuation summary
  if (pathname === '/api/valuations/summary' && req.method === 'GET') {
    const items = db.getAllItems().filter(i => !i.wishlist);
    const valued = items.filter(i => i.valuation && i.valuation.found);
    const totalPurchase = items.reduce((sum, i) => sum + (i.purchasePrice || 0), 0);
    const totalMarket = valued.reduce((sum, i) => sum + (i.valuation.marketValue || 0), 0);
    const totalCurrentValue = items.reduce((sum, i) => sum + (i.currentValue || 0), 0);

    // Best and worst deals
    const withGains = valued
      .filter(i => i.purchasePrice > 0)
      .map(i => ({
        id: i.id,
        name: i.name,
        purchasePrice: i.purchasePrice,
        marketValue: i.valuation.marketValue,
        gain: i.valuation.marketValue - i.purchasePrice,
        gainPercent: ((i.valuation.marketValue - i.purchasePrice) / i.purchasePrice * 100)
      }))
      .sort((a, b) => b.gainPercent - a.gainPercent);

    const staleCount = items.filter(i => {
      if (!i.valuation || !i.valuation.valuationDate) return true;
      const age = Date.now() - new Date(i.valuation.valuationDate).getTime();
      return age > 7 * 24 * 60 * 60 * 1000;
    }).length;

    return sendJson(res, 200, {
      totalItems: items.length,
      valuedItems: valued.length,
      unvalued: items.length - valued.length,
      staleCount,
      totalPurchasePrice: Math.round(totalPurchase * 100) / 100,
      totalMarketValue: Math.round(totalMarket * 100) / 100,
      totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
      overallGain: Math.round((totalMarket - totalPurchase) * 100) / 100,
      overallGainPercent: totalPurchase > 0 ? Math.round((totalMarket - totalPurchase) / totalPurchase * 10000) / 100 : 0,
      bestDeals: withGains.slice(0, 5),
      worstDeals: withGains.slice(-5).reverse()
    });
  }

  // PUT /api/settings/ebay — save eBay API credentials (separate from general settings for security)
  if (pathname === '/api/settings/ebay' && req.method === 'PUT') {
    const body = await readBody(req, 2048);
    const data = parseJsonBody(body);
    if (!data) return sendError(res, 400, 'Invalid JSON');

    const updates = {};
    if (data.ebayAppId !== undefined) updates.ebayAppId = data.ebayAppId.trim();
    if (data.ebayCertId !== undefined) updates.ebayCertId = data.ebayCertId.trim();
    if (data.ebaySandbox !== undefined) updates.ebaySandbox = !!data.ebaySandbox;
    if (data.ebayGauge !== undefined) updates.ebayGauge = data.ebayGauge.trim();
    if (data.valuationAutoRefresh !== undefined) updates.valuationAutoRefresh = !!data.valuationAutoRefresh;
    if (data.valuationRefreshDays !== undefined) updates.valuationRefreshDays = parseInt(data.valuationRefreshDays) || 7;

    // Clear token cache when credentials change
    if (data.ebayAppId !== undefined || data.ebayCertId !== undefined) {
      valuation.clearTokenCache();
    }

    const settings = db.updateSettings(updates);
    return sendJson(res, 200, { message: 'eBay settings saved', settings });
  }

  // POST /api/settings/ebay/test — test eBay API connection
  if (pathname === '/api/settings/ebay/test' && req.method === 'POST') {
    const settings = db.getSettingsInternal();
    if (!settings.ebayAppId || !settings.ebayCertId) {
      return sendError(res, 400, 'eBay credentials not configured');
    }

    try {
      // Try to search for a well-known model to test the connection
      const testItem = { name: 'Hornby Flying Scotsman', manufacturer: 'Hornby', productCode: 'R3834' };
      const result = await valuation.searchEbay(testItem, {
        appId: settings.ebayAppId,
        certId: settings.ebayCertId,
        sandbox: settings.ebaySandbox || false,
        gauge: settings.ebayGauge || 'OO'
      });

      return sendJson(res, 200, {
        success: true,
        message: `Connection successful! Found ${result.listingsAnalysed} listings for test search.`,
        testResult: {
          found: result.found,
          listingsAnalysed: result.listingsAnalysed,
          samplePrice: result.marketValue
        }
      });
    } catch (err) {
      return sendJson(res, 200, {
        success: false,
        message: 'Connection failed: ' + err.message
      });
    }
  }

  // GET /api/health-check — data health check
  if (pathname === '/api/health-check' && req.method === 'GET') {
    const items = db.getAllItems();
    const issues = [];
    const interval = db.getSettings().serviceIntervalDays || 365;
    const now = Date.now();

    for (const item of items) {
      const missing = [];
      if (!item.images || item.images.length === 0) missing.push('photos');
      if (!item.manufacturer) missing.push('manufacturer');
      if (!item.livery) missing.push('livery');
      if (!item.purchasePrice) missing.push('purchase price');
      if (!item.condition) missing.push('condition');
      if (!item.dccStatus) missing.push('DCC status');
      if (!item.productCode) missing.push('product code');
      if (!item.runningNumber) missing.push('running number');
      if (!item.purchaseDate) missing.push('purchase date');
      if (!item.storageLocation) missing.push('storage location');
      if (!item.historicalBackground) missing.push('historical background');

      const serviceOverdue = item.lastServiceDate &&
        (now - new Date(item.lastServiceDate).getTime()) > interval * 24 * 60 * 60 * 1000;

      if (missing.length > 0 || serviceOverdue) {
        issues.push({
          id: item.id,
          name: item.name,
          missingFields: missing,
          serviceOverdue: !!serviceOverdue,
          completeness: Math.round(((11 - missing.length) / 11) * 100)
        });
      }
    }

    // Sort by completeness (least complete first)
    issues.sort((a, b) => a.completeness - b.completeness);

    const avgCompleteness = items.length > 0
      ? Math.round(issues.reduce((sum, i) => sum + i.completeness, 0) / Math.max(issues.length, 1))
      : 100;

    return sendJson(res, 200, {
      totalItems: items.length,
      itemsWithIssues: issues.length,
      avgCompleteness,
      issues: issues.slice(0, 50)
    });
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
    // Public share API (no auth required)
    if (pathname === '/api/shared' && req.method === 'GET') {
      const reqUrl2 = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const token = reqUrl2.searchParams.get('token');
      if (!token || !db.verifyShareToken(token)) {
        return sendError(res, 403, 'Invalid or expired share link');
      }
      const items = db.getAllItems();
      const categories = db.getCategories();
      const stats = db.getStats();
      const settings = db.getSettings();
      return sendJson(res, 200, { items, categories, stats, settings });
    }

    // Serve shared view page (no auth required)
    if (pathname === '/shared' || pathname === '/shared.html') {
      const staticPath = path.join(__dirname, 'static', 'shared.html');
      return serveStaticFile(res, staticPath);
    }

    // API routes
    if (pathname.startsWith('/api/')) {
      return await handleApiRequest(req, res, pathname);
    }

    // Auth check for non-API routes (static files, pages)
    // Always allow: login page, its assets, service worker, manifest
    const publicPaths = ['/login.html', '/shared', '/css/', '/js/', '/manifest.json', '/sw.js', '/favicon', '/icons/'];
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

// Auto-purge expired soft-deleted items on startup and daily
const purgeExpired = () => {
  const purged = db.purgeExpiredItems(30);
  if (purged.length > 0) {
    console.log(`  Purged ${purged.length} expired items from trash`);
    for (const item of purged) {
      if (item.images && item.images.length > 0) {
        for (const imgPath of item.images) {
          if (imgPath.startsWith('/uploads/')) {
            const filePath = path.join(UPLOAD_DIR, path.basename(imgPath));
            fs.unlink(filePath, () => {});
          }
        }
      }
    }
  }
};
purgeExpired();
setInterval(purgeExpired, 24 * 60 * 60 * 1000); // daily

// ==================== Auto Valuation Refresh ====================

async function autoRefreshValuations() {
  const settings = db.getSettingsInternal();
  if (!settings.valuationAutoRefresh || !settings.ebayAppId || !settings.ebayCertId) return;

  const staleDays = settings.valuationRefreshDays || 7;
  const cutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000).toISOString();
  const staleItems = db.getAllItems()
    .filter(i => !i.wishlist)
    .filter(i => !i.valuation || !i.valuation.valuationDate || i.valuation.valuationDate < cutoff);

  if (staleItems.length === 0) return;

  // Process up to 20 items per auto-refresh cycle to avoid hammering the API
  const batch = staleItems.slice(0, 20);
  console.log(`  📊 Auto-refreshing valuations for ${batch.length} stale items...`);

  try {
    const results = await valuation.batchValuate(batch, {
      appId: settings.ebayAppId,
      certId: settings.ebayCertId,
      sandbox: settings.ebaySandbox || false,
      gauge: settings.ebayGauge || 'OO'
    });

    let updated = 0;
    for (const result of results) {
      if (result.valuation) {
        const updates = { valuation: result.valuation };
        if (result.valuation.found && result.valuation.marketValue) {
          updates.currentValue = result.valuation.marketValue;
        }
        db.updateItem(result.itemId, updates);
        updated++;
      }
    }
    console.log(`  📊 Auto-refresh complete: ${updated} items updated`);
  } catch (err) {
    console.error('  Auto-refresh valuation error:', err.message);
  }
}

// Run auto-refresh every 6 hours
setInterval(autoRefreshValuations, 6 * 60 * 60 * 1000);
// Also run 30 seconds after startup (give server time to settle)
setTimeout(autoRefreshValuations, 30000);

server.listen(PORT, () => {
  const settings = db.getSettings();
  console.log(`\n🚂 ${settings.appName}`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   Authentication: ${db.hasPassword() ? 'enabled' : 'open (no password set)'}`);
  console.log(`   Valuation: ${settings.ebayConfigured ? 'eBay API configured' : 'not configured (add eBay API keys in Settings)'}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
