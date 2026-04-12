/**
 * OO Gauge Model Train Catalog - Node.js Server
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
  '.woff2': 'font/woff2'
};

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

// --- Route Handlers ---

async function handleApiRequest(req, res, pathname) {
  // GET /api/items
  if (pathname === '/api/items' && req.method === 'GET') {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const search = reqUrl.searchParams.get('search');
    const category = reqUrl.searchParams.get('category');
    const subcategory = reqUrl.searchParams.get('subcategory');

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
        // Only delete local uploads (not external reference URLs)
        if (imgPath.startsWith('/uploads/')) {
          const filePath = path.join(UPLOAD_DIR, path.basename(imgPath));
          fs.unlink(filePath, () => {}); // async, ignore errors
        }
      }
    }

    return sendJson(res, 200, { message: 'Item deleted' });
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

  // GET /api/categories
  if (pathname === '/api/categories' && req.method === 'GET') {
    return sendJson(res, 200, db.getCategories());
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
    // Cache images and fonts for 1 day; HTML/CSS/JS use versioned query strings
    const isAsset = ['.png','.jpg','.jpeg','.gif','.webp','.svg','.woff','.woff2','.ico'].includes(ext);
    const cacheHeader = isAsset
      ? 'public, max-age=86400'            // 1 day for images/fonts
      : 'public, max-age=300, must-revalidate'; // 5 min for HTML/CSS/JS (versioned via ?v=)
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': cacheHeader
    });
    res.end(data);
  });
}

// --- Main Server ---

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

    // Serve uploaded images
    if (pathname.startsWith('/uploads/')) {
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
  console.log(`   Press Ctrl+C to stop\n`);
});
