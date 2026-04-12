/**
 * JSON-file-based database for the Train Depot catalog
 * Zero external dependencies - uses only Node.js built-in fs module
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'catalog.json');

// Default category structure
const DEFAULT_CATEGORIES = [
  {
    id: 'locomotives',
    name: 'Locomotives',
    subcategories: [
      { id: 'steam-pre-grouping', name: 'Steam - Pre-Grouping', parent: 'locomotives' },
      { id: 'steam-lner', name: 'Steam - LNER', parent: 'locomotives' },
      { id: 'steam-lms', name: 'Steam - LMS', parent: 'locomotives' },
      { id: 'steam-southern', name: 'Steam - Southern', parent: 'locomotives' },
      { id: 'steam-gwr', name: 'Steam - GWR', parent: 'locomotives' },
      { id: 'steam-br', name: 'Steam - BR', parent: 'locomotives' },
      { id: 'diesel', name: 'Diesel Locomotives', parent: 'locomotives' },
      { id: 'multiple-units', name: 'Multiple Units', parent: 'locomotives' }
    ]
  },
  {
    id: 'rolling-stock',
    name: 'Rolling Stock',
    subcategories: [
      { id: 'rs-pre-grouping', name: 'Pre-Grouping', parent: 'rolling-stock' },
      { id: 'rs-lner', name: 'LNER', parent: 'rolling-stock' },
      { id: 'rs-lms', name: 'LMS', parent: 'rolling-stock' },
      { id: 'rs-southern', name: 'Southern', parent: 'rolling-stock' },
      { id: 'rs-gwr', name: 'GWR', parent: 'rolling-stock' },
      { id: 'rs-br', name: 'BR', parent: 'rolling-stock' },
      { id: 'rs-nationalisation', name: 'Nationalisation Onwards', parent: 'rolling-stock' }
    ]
  }
];

// Default app settings (editable by user)
const DEFAULT_SETTINGS = {
  appName: 'Train Depot',
  tagline: 'Your personal collection, beautifully organised',
  currency: '£',
  serviceIntervalDays: 365
};

// --- In-memory cache ---
let _cache = null;
let _writing = false;

function ensureDbExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb = {
      settings: { ...DEFAULT_SETTINGS },
      categories: DEFAULT_CATEGORIES,
      items: [],
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    _cache = defaultDb;
  }
}

function readDb() {
  if (_cache) return _cache;
  ensureDbExists();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  _cache = JSON.parse(raw);
  return _cache;
}

function writeDb(data) {
  ensureDbExists();
  if (_writing) {
    throw new Error('Database is busy, please try again');
  }
  _writing = true;
  try {
    data.metadata.lastModified = new Date().toISOString();
    // Write to temp file then rename for atomicity
    const tmpFile = DB_FILE + '.tmp';
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
    fs.renameSync(tmpFile, DB_FILE);
    _cache = data;
  } finally {
    _writing = false;
  }
}

function invalidateCache() {
  _cache = null;
}

function generateId() {
  return crypto.randomUUID();
}

// --- Item CRUD ---

function getAllItems() {
  const db = readDb();
  return db.items;
}

function getItemById(id) {
  const db = readDb();
  return db.items.find(item => item.id === id) || null;
}

function createItem(itemData) {
  const db = readDb();
  const now = new Date().toISOString();
  const item = {
    id: generateId(),
    name: itemData.name || '',
    manufacturer: itemData.manufacturer || '',
    purchasePrice: parseFloat(itemData.purchasePrice) || 0,
    placeOfPurchase: itemData.placeOfPurchase || '',
    livery: itemData.livery || '',
    historicalBackground: itemData.historicalBackground || '',
    goesWellWith: itemData.goesWellWith || '',
    lastServiceDate: itemData.lastServiceDate || '',
    categoryId: itemData.categoryId || '',
    subcategoryId: itemData.subcategoryId || '',
    images: itemData.images || [],
    createdAt: now,
    updatedAt: now
  };

  db.items.push(item);
  writeDb(db);
  return item;
}

function updateItem(id, updates) {
  const db = readDb();
  const idx = db.items.findIndex(item => item.id === id);
  if (idx === -1) return null;

  const allowed = ['name', 'manufacturer', 'purchasePrice', 'placeOfPurchase',
    'livery', 'historicalBackground', 'goesWellWith', 'lastServiceDate',
    'categoryId', 'subcategoryId', 'images'];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      db.items[idx][key] = key === 'purchasePrice' ? parseFloat(updates[key]) || 0 : updates[key];
    }
  }
  db.items[idx].updatedAt = new Date().toISOString();
  writeDb(db);
  return db.items[idx];
}

function deleteItem(id) {
  const db = readDb();
  const idx = db.items.findIndex(item => item.id === id);
  if (idx === -1) return null;
  const deleted = db.items.splice(idx, 1)[0];
  writeDb(db);
  return deleted;
}

function searchItems(query) {
  const db = readDb();
  const q = query.toLowerCase();
  return db.items.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.manufacturer.toLowerCase().includes(q) ||
    item.livery.toLowerCase().includes(q) ||
    item.historicalBackground.toLowerCase().includes(q) ||
    item.goesWellWith.toLowerCase().includes(q)
  );
}

function getItemsByCategory(categoryId) {
  const db = readDb();
  return db.items.filter(item => item.categoryId === categoryId);
}

function getItemsBySubcategory(subcategoryId) {
  const db = readDb();
  return db.items.filter(item => item.subcategoryId === subcategoryId);
}

// --- Category operations ---

function getCategories() {
  const db = readDb();
  return db.categories;
}

// --- Statistics ---

function getStats() {
  const db = readDb();
  const items = db.items;
  const totalSpent = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
  const locomotiveCount = items.filter(item => item.categoryId === 'locomotives').length;
  const rollingStockCount = items.filter(item => item.categoryId === 'rolling-stock').length;

  const bySubcategory = {};
  const allSubcats = [];
  for (const cat of db.categories) {
    for (const sub of cat.subcategories) {
      allSubcats.push(sub);
      bySubcategory[sub.id] = {
        name: sub.name,
        parent: sub.parent,
        count: items.filter(item => item.subcategoryId === sub.id).length
      };
    }
  }

  return {
    totalItems: items.length,
    totalSpent: Math.round(totalSpent * 100) / 100,
    locomotiveCount,
    rollingStockCount,
    bySubcategory
  };
}

// --- Settings ---

function getSettings() {
  const db = readDb();
  // Merge defaults with stored settings (handles upgrades from older DBs)
  return { ...DEFAULT_SETTINGS, ...(db.settings || {}) };
}

function updateSettings(updates) {
  const db = readDb();
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  const allowed = ['appName', 'tagline', 'currency', 'serviceIntervalDays'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      db.settings[key] = updates[key];
    }
  }
  writeDb(db);
  return db.settings;
}

// --- Backup/Export ---

function exportData() {
  const db = readDb();
  return JSON.stringify(db, null, 2);
}

function importData(jsonString) {
  const data = JSON.parse(jsonString);

  // Validate top-level structure
  if (!Array.isArray(data.categories) || !Array.isArray(data.items)) {
    throw new Error('Invalid backup format: must contain categories and items arrays');
  }

  // Validate categories have required fields
  for (const cat of data.categories) {
    if (!cat.id || !cat.name || !Array.isArray(cat.subcategories)) {
      throw new Error(`Invalid category: each category must have id, name, and subcategories`);
    }
    for (const sub of cat.subcategories) {
      if (!sub.id || !sub.name) {
        throw new Error(`Invalid subcategory in "${cat.name}": each must have id and name`);
      }
    }
  }

  // Validate items have required fields and sensible types
  const validCatIds = new Set(data.categories.map(c => c.id));
  const validSubIds = new Set(data.categories.flatMap(c => c.subcategories.map(s => s.id)));

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    if (!item.id || !item.name) {
      throw new Error(`Item at index ${i} is missing required id or name`);
    }
    if (item.categoryId && !validCatIds.has(item.categoryId)) {
      throw new Error(`Item "${item.name}" references unknown category "${item.categoryId}"`);
    }
    if (item.subcategoryId && !validSubIds.has(item.subcategoryId)) {
      throw new Error(`Item "${item.name}" references unknown subcategory "${item.subcategoryId}"`);
    }
    if (item.purchasePrice !== undefined && typeof item.purchasePrice !== 'number') {
      data.items[i].purchasePrice = parseFloat(item.purchasePrice) || 0;
    }
    if (item.images && !Array.isArray(item.images)) {
      data.items[i].images = [];
    }
  }

  // Ensure metadata exists
  if (!data.metadata) {
    data.metadata = {
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // Ensure settings exist (merge with defaults for older backups)
  data.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };

  writeDb(data);
  return true;
}

module.exports = {
  ensureDbExists,
  invalidateCache,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getItemsByCategory,
  getItemsBySubcategory,
  getCategories,
  getSettings,
  updateSettings,
  getStats,
  exportData,
  importData,
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS
};
