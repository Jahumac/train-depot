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
  serviceIntervalDays: 365,
  passwordHash: '',
  passwordSalt: '',
  shareToken: '',
  // eBay Valuation settings
  ebayAppId: '',
  ebayCertId: '',
  ebaySandbox: false,
  valuationAutoRefresh: true,
  valuationRefreshDays: 7
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
        version: '1.4.0'
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

// --- Password Hashing (PBKDF2 via Node built-in crypto) ---

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function setPassword(password) {
  const db = readDb();
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  const { hash, salt } = hashPassword(password);
  db.settings.passwordHash = hash;
  db.settings.passwordSalt = salt;
  writeDb(db);
  return true;
}

function verifyPassword(password) {
  const db = readDb();
  const settings = db.settings || {};
  if (!settings.passwordHash || !settings.passwordSalt) return false;
  const { hash } = hashPassword(password, settings.passwordSalt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(settings.passwordHash));
}

function hasPassword() {
  const db = readDb();
  return !!(db.settings && db.settings.passwordHash);
}

function removePassword() {
  const db = readDb();
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  db.settings.passwordHash = '';
  db.settings.passwordSalt = '';
  writeDb(db);
  return true;
}

// --- Item CRUD ---

function getAllItems(includeDeleted = false) {
  const db = readDb();
  if (includeDeleted) return db.items;
  return db.items.filter(item => !item.deleted);
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
    currentValue: parseFloat(itemData.currentValue) || 0,
    placeOfPurchase: itemData.placeOfPurchase || '',
    livery: itemData.livery || '',
    historicalBackground: itemData.historicalBackground || '',
    goesWellWith: itemData.goesWellWith || '',
    lastServiceDate: itemData.lastServiceDate || '',
    categoryId: itemData.categoryId || '',
    subcategoryId: itemData.subcategoryId || '',
    images: itemData.images || [],
    wishlist: itemData.wishlist || false,
    wishlistNotes: itemData.wishlistNotes || '',
    wishlistSpottedPrice: parseFloat(itemData.wishlistSpottedPrice) || 0,
    wishlistSpottedAt: itemData.wishlistSpottedAt || '',
    runningNumber: itemData.runningNumber || '',
    productCode: itemData.productCode || '',
    condition: itemData.condition || '',
    dccStatus: itemData.dccStatus || '',
    purchaseDate: itemData.purchaseDate || '',
    storageLocation: itemData.storageLocation || '',
    serviceLog: itemData.serviceLog || [],
    tags: itemData.tags || [],
    // Valuation data
    valuation: itemData.valuation || null,
    deleted: false,
    deletedAt: null,
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

  const allowed = ['name', 'manufacturer', 'purchasePrice', 'currentValue', 'placeOfPurchase',
    'livery', 'historicalBackground', 'goesWellWith', 'lastServiceDate',
    'categoryId', 'subcategoryId', 'images', 'wishlist',
    'wishlistNotes', 'wishlistSpottedPrice', 'wishlistSpottedAt',
    'runningNumber', 'productCode', 'condition', 'dccStatus', 'purchaseDate',
    'storageLocation', 'serviceLog', 'tags', 'valuation'];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      if (key === 'purchasePrice' || key === 'currentValue' || key === 'wishlistSpottedPrice') {
        db.items[idx][key] = parseFloat(updates[key]) || 0;
      } else if (key === 'wishlist') {
        db.items[idx][key] = !!updates[key];
      } else if (key === 'serviceLog' || key === 'tags') {
        db.items[idx][key] = Array.isArray(updates[key]) ? updates[key] : [];
      } else if (key === 'valuation') {
        db.items[idx][key] = updates[key] && typeof updates[key] === 'object' ? updates[key] : null;
      } else {
        db.items[idx][key] = updates[key];
      }
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
  // Soft delete: mark as deleted with timestamp
  db.items[idx].deleted = true;
  db.items[idx].deletedAt = new Date().toISOString();
  db.items[idx].updatedAt = new Date().toISOString();
  writeDb(db);
  return db.items[idx];
}

function restoreItem(id) {
  const db = readDb();
  const idx = db.items.findIndex(item => item.id === id);
  if (idx === -1) return null;
  db.items[idx].deleted = false;
  db.items[idx].deletedAt = null;
  db.items[idx].updatedAt = new Date().toISOString();
  writeDb(db);
  return db.items[idx];
}

function permanentlyDeleteItem(id) {
  const db = readDb();
  const idx = db.items.findIndex(item => item.id === id);
  if (idx === -1) return null;
  const removed = db.items.splice(idx, 1)[0];
  writeDb(db);
  return removed;
}

function getDeletedItems() {
  const db = readDb();
  return db.items.filter(item => item.deleted);
}

function purgeExpiredItems(days = 30) {
  const db = readDb();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const toRemove = db.items.filter(item => item.deleted && item.deletedAt && item.deletedAt < cutoff);
  if (toRemove.length === 0) return [];
  db.items = db.items.filter(item => !(item.deleted && item.deletedAt && item.deletedAt < cutoff));
  writeDb(db);
  return toRemove;
}

function findDuplicatesByProductCode(productCode) {
  if (!productCode) return [];
  const db = readDb();
  return db.items.filter(item => !item.deleted && item.productCode && item.productCode.toLowerCase() === productCode.toLowerCase());
}

function searchItems(query) {
  const db = readDb();
  const q = query.toLowerCase();
  return db.items.filter(item => !item.deleted).filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.manufacturer.toLowerCase().includes(q) ||
    item.livery.toLowerCase().includes(q) ||
    item.historicalBackground.toLowerCase().includes(q) ||
    item.goesWellWith.toLowerCase().includes(q) ||
    item.runningNumber.toLowerCase().includes(q) ||
    item.productCode.toLowerCase().includes(q) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
  );
}

function getItemsByCategory(categoryId) {
  const db = readDb();
  return db.items.filter(item => !item.deleted && item.categoryId === categoryId);
}

function getItemsBySubcategory(subcategoryId) {
  const db = readDb();
  return db.items.filter(item => !item.deleted && item.subcategoryId === subcategoryId);
}

// --- Category CRUD ---

function getCategories() {
  const db = readDb();
  return db.categories;
}

function addCategory(name) {
  const db = readDb();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // Check for duplicate id
  if (db.categories.some(c => c.id === id)) {
    throw new Error(`Category "${name}" already exists`);
  }
  const cat = { id, name, subcategories: [] };
  db.categories.push(cat);
  writeDb(db);
  return cat;
}

function updateCategory(id, newName) {
  const db = readDb();
  const cat = db.categories.find(c => c.id === id);
  if (!cat) return null;
  cat.name = newName;
  writeDb(db);
  return cat;
}

function deleteCategory(id) {
  const db = readDb();
  const idx = db.categories.findIndex(c => c.id === id);
  if (idx === -1) return null;
  // Don't allow delete if items reference this category
  const itemCount = db.items.filter(item => item.categoryId === id).length;
  if (itemCount > 0) {
    throw new Error(`Cannot delete category: ${itemCount} items still reference it`);
  }
  const deleted = db.categories.splice(idx, 1)[0];
  writeDb(db);
  return deleted;
}

function addSubcategory(categoryId, name) {
  const db = readDb();
  const cat = db.categories.find(c => c.id === categoryId);
  if (!cat) throw new Error('Category not found');
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (cat.subcategories.some(s => s.id === id)) {
    throw new Error(`Subcategory "${name}" already exists in this category`);
  }
  const sub = { id, name, parent: categoryId };
  cat.subcategories.push(sub);
  writeDb(db);
  return sub;
}

function updateSubcategory(categoryId, subcategoryId, newName) {
  const db = readDb();
  const cat = db.categories.find(c => c.id === categoryId);
  if (!cat) return null;
  const sub = cat.subcategories.find(s => s.id === subcategoryId);
  if (!sub) return null;
  sub.name = newName;
  writeDb(db);
  return sub;
}

function deleteSubcategory(categoryId, subcategoryId) {
  const db = readDb();
  const cat = db.categories.find(c => c.id === categoryId);
  if (!cat) return null;
  const idx = cat.subcategories.findIndex(s => s.id === subcategoryId);
  if (idx === -1) return null;
  // Don't allow delete if items reference this subcategory
  const itemCount = db.items.filter(item => item.subcategoryId === subcategoryId).length;
  if (itemCount > 0) {
    throw new Error(`Cannot delete subcategory: ${itemCount} items still reference it`);
  }
  const deleted = cat.subcategories.splice(idx, 1)[0];
  writeDb(db);
  return deleted;
}

function getAllTags() {
  const db = readDb();
  const tagCounts = {};
  for (const item of db.items.filter(i => !i.deleted)) {
    if (item.tags && Array.isArray(item.tags)) {
      for (const tag of item.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  return Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function getItemsByTag(tag) {
  const db = readDb();
  return db.items.filter(item =>
    !item.deleted && item.tags && Array.isArray(item.tags) && item.tags.includes(tag)
  );
}

// --- Statistics ---

function getStats() {
  const db = readDb();
  const items = db.items.filter(i => !i.deleted);
  const totalSpent = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
  const totalCurrentValue = items.reduce((sum, item) => sum + (item.currentValue || 0), 0);
  const locomotiveCount = items.filter(item => item.categoryId === 'locomotives').length;
  const rollingStockCount = items.filter(item => item.categoryId === 'rolling-stock').length;
  const wishlistCount = items.filter(item => item.wishlist).length;

  const bySubcategory = {};
  for (const cat of db.categories) {
    for (const sub of cat.subcategories) {
      bySubcategory[sub.id] = {
        name: sub.name,
        parent: sub.parent,
        count: items.filter(item => item.subcategoryId === sub.id).length
      };
    }
  }

  // Count items per category (including custom categories)
  const byCategory = {};
  for (const cat of db.categories) {
    byCategory[cat.id] = {
      name: cat.name,
      count: items.filter(item => item.categoryId === cat.id).length
    };
  }

  return {
    totalItems: items.length,
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    locomotiveCount,
    rollingStockCount,
    wishlistCount,
    bySubcategory,
    byCategory
  };
}

// --- Settings ---

function getSettings() {
  const db = readDb();
  const settings = { ...DEFAULT_SETTINGS, ...(db.settings || {}) };
  // Never expose password hash/salt or full eBay credentials to the client
  const { passwordHash, passwordSalt, ...safeSettings } = settings;
  // Mask eBay credentials (show only last 4 chars for confirmation)
  if (safeSettings.ebayAppId) {
    safeSettings.ebayAppIdMasked = '••••' + safeSettings.ebayAppId.slice(-4);
  }
  if (safeSettings.ebayCertId) {
    safeSettings.ebayCertIdMasked = '••••' + safeSettings.ebayCertId.slice(-4);
  }
  safeSettings.ebayConfigured = !!(safeSettings.ebayAppId && safeSettings.ebayCertId);
  return safeSettings;
}

function generateShareToken() {
  const db = readDb();
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  const token = crypto.randomBytes(16).toString('hex');
  db.settings.shareToken = token;
  writeDb(db);
  return token;
}

function revokeShareToken() {
  const db = readDb();
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  db.settings.shareToken = '';
  writeDb(db);
}

function getShareToken() {
  const db = readDb();
  return db.settings?.shareToken || '';
}

function verifyShareToken(token) {
  if (!token) return false;
  const db = readDb();
  return db.settings?.shareToken === token && token.length > 0;
}

function getSettingsInternal() {
  const db = readDb();
  return { ...DEFAULT_SETTINGS, ...(db.settings || {}) };
}

function updateSettings(updates) {
  const db = readDb();
  if (!db.settings) db.settings = { ...DEFAULT_SETTINGS };
  const allowed = ['appName', 'tagline', 'currency', 'serviceIntervalDays', 'shareToken',
    'ebayAppId', 'ebayCertId', 'ebaySandbox', 'valuationAutoRefresh', 'valuationRefreshDays'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      db.settings[key] = updates[key];
    }
  }
  writeDb(db);
  // Return safe settings (no password fields)
  const { passwordHash, passwordSalt, ...safe } = db.settings;
  return safe;
}

// --- Backup/Export ---

function exportData() {
  const db = readDb();
  // Exclude password from exports
  const exportDb = JSON.parse(JSON.stringify(db));
  if (exportDb.settings) {
    delete exportDb.settings.passwordHash;
    delete exportDb.settings.passwordSalt;
  }
  return JSON.stringify(exportDb, null, 2);
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
    if (item.currentValue !== undefined && typeof item.currentValue !== 'number') {
      data.items[i].currentValue = parseFloat(item.currentValue) || 0;
    }
    if (item.images && !Array.isArray(item.images)) {
      data.items[i].images = [];
    }
    // Ensure new fields have defaults
    if (data.items[i].currentValue === undefined) data.items[i].currentValue = 0;
    if (data.items[i].wishlist === undefined) data.items[i].wishlist = false;
  }

  // Ensure metadata exists
  if (!data.metadata) {
    data.metadata = {
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // Preserve existing password when importing (don't overwrite auth)
  const currentDb = readDb();
  const currentPassword = currentDb.settings?.passwordHash || '';
  const currentSalt = currentDb.settings?.passwordSalt || '';

  // Ensure settings exist (merge with defaults for older backups)
  data.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  // Restore password from current DB
  data.settings.passwordHash = currentPassword;
  data.settings.passwordSalt = currentSalt;

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
  restoreItem,
  permanentlyDeleteItem,
  getDeletedItems,
  purgeExpiredItems,
  findDuplicatesByProductCode,
  searchItems,
  getItemsByCategory,
  getItemsBySubcategory,
  getAllTags,
  getItemsByTag,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSettings,
  getSettingsInternal,
  updateSettings,
  generateShareToken,
  revokeShareToken,
  getShareToken,
  verifyShareToken,
  setPassword,
  verifyPassword,
  hasPassword,
  removePassword,
  getStats,
  exportData,
  importData,
  DEFAULT_CATEGORIES,
  DEFAULT_SETTINGS
};
