/**
 * Train Depot - Model Train Catalog Application
 * With dark mode, auto-suggest, and green & gold theme
 */

const app = {
  categories: [],
  items: [],
  stats: null,
  settings: { appName: 'Train Depot', tagline: 'Your personal collection, beautifully organised', currency: '£', serviceIntervalDays: 365 },
  currentView: 'landing',
  currentFilter: null,
  currentSort: 'name-asc',   // default sort
  editingItem: null,
  pendingImages: [],
  existingImages: [],
  selectedRefModel: null,    // reference model selected from the DB
  showWishlistOnly: false,   // wishlist filter toggle
  advancedFilters: {},       // advanced search filters
  filterPanelOpen: false,    // advanced filter panel state
  dragSrcIndex: null,        // drag-and-drop image reorder

  // ==================== Auto-Suggest Database ====================

  suggest: {
    // Comprehensive database of known values for auto-population
    data: {
      manufacturers: [
        // Major OO gauge manufacturers
        { value: 'Hornby', category: 'Major' },
        { value: 'Bachmann', category: 'Major' },
        { value: 'Dapol', category: 'Major' },
        { value: 'Heljan', category: 'Major' },
        { value: 'Oxford Rail', category: 'Major' },
        { value: 'Accurascale', category: 'Major' },
        { value: 'Cavalex Models', category: 'Specialist' },
        { value: 'Revolution Trains', category: 'Specialist' },
        { value: 'Rapido Trains UK', category: 'Specialist' },
        { value: 'Sonic Models', category: 'Specialist' },
        { value: 'DJ Models', category: 'Specialist' },
        { value: 'Kernow Model Rail Centre', category: 'Exclusive' },
        { value: 'Rails of Sheffield (Exclusive)', category: 'Exclusive' },
        { value: 'Hattons (Exclusive)', category: 'Exclusive' },
        { value: 'EFE Rail', category: 'Major' },
        { value: 'Graham Farish', category: 'Major' },
        { value: 'Lima', category: 'Heritage' },
        { value: 'Mainline', category: 'Heritage' },
        { value: 'Airfix', category: 'Heritage' },
        { value: 'Wrenn', category: 'Heritage' },
        { value: 'Tri-ang', category: 'Heritage' },
        { value: 'Hornby Dublo', category: 'Heritage' },
        { value: 'Peco', category: 'Track & Kits' },
        { value: 'Ratio', category: 'Kits' },
        { value: 'Parkside Dundas', category: 'Kits' },
        { value: 'Slaters', category: 'Kits' },
        { value: 'Craftsman (Kirk)', category: 'Kits' },
        { value: 'Judith Edge Kits', category: 'Kits' },
        { value: 'Comet Models', category: 'Kits' },
        { value: 'Branchlines', category: 'Kits' }
      ],
      retailers: [
        // Online retailers
        { value: 'Hattons of Liverpool', category: 'Online' },
        { value: 'Rails of Sheffield', category: 'Online' },
        { value: 'Kernow Model Rail Centre', category: 'Online' },
        { value: 'TMC - The Model Centre', category: 'Online' },
        { value: 'Gaugemaster', category: 'Online' },
        { value: 'Olivias Trains', category: 'Online' },
        { value: 'DCC Supplies', category: 'Online' },
        { value: 'Bromley Cross Models', category: 'Online' },
        { value: 'Peters Spares', category: 'Online' },
        { value: 'Howes Models', category: 'Online' },
        { value: 'Cheltenham Model Centre', category: 'Online' },
        { value: 'Truro Model Railway Centre', category: 'Online' },
        // Show & swap meet
        { value: 'Model Railway Exhibition', category: 'Show' },
        { value: 'Warley National Model Railway Exhibition', category: 'Show' },
        { value: 'York Model Railway Show', category: 'Show' },
        { value: 'Great Electric Train Show', category: 'Show' },
        { value: 'Alexandra Palace Show', category: 'Show' },
        { value: 'Swap Meet / Swapmeet', category: 'Show' },
        { value: 'Private Sale', category: 'Private' },
        // Auction
        { value: 'eBay', category: 'Auction' },
        { value: 'Vectis Auctions', category: 'Auction' },
        { value: 'Wallis & Wallis', category: 'Auction' },
        { value: 'Special Auction Services', category: 'Auction' },
        // Shops
        { value: 'Pendon Museum Shop', category: 'Shop' },
        { value: 'NRM York Shop', category: 'Shop' },
        { value: 'Local Model Shop', category: 'Shop' }
      ],
      liveries: [
        // Pre-grouping
        { value: 'LSWR Sage Green', category: 'Pre-Group' },
        { value: 'Midland Railway Crimson', category: 'Pre-Group' },
        { value: 'LNWR Blackberry Black', category: 'Pre-Group' },
        { value: 'GNR Stirling Green', category: 'Pre-Group' },
        { value: 'Caledonian Railway Blue', category: 'Pre-Group' },
        { value: 'North Eastern Railway Green', category: 'Pre-Group' },
        { value: 'Lancashire & Yorkshire Railway Black', category: 'Pre-Group' },
        // GWR
        { value: 'GWR Lined Green', category: 'GWR' },
        { value: 'GWR Brunswick Green', category: 'GWR' },
        { value: 'GWR Chocolate & Cream', category: 'GWR' },
        { value: 'GWR Brown (Goods)', category: 'GWR' },
        { value: 'GWR Shirt Button', category: 'GWR' },
        // LNER
        { value: 'LNER Apple Green', category: 'LNER' },
        { value: 'LNER Garter Blue', category: 'LNER' },
        { value: 'LNER Lined Black', category: 'LNER' },
        { value: 'LNER Teak', category: 'LNER' },
        { value: 'LNER Thompson Green', category: 'LNER' },
        { value: 'LNER Wartime Black', category: 'LNER' },
        // LMS
        { value: 'LMS Crimson Lake', category: 'LMS' },
        { value: 'LMS Lined Black', category: 'LMS' },
        { value: 'LMS Maroon', category: 'LMS' },
        { value: 'LMS Unlined Black', category: 'LMS' },
        { value: 'LMS Coronation Blue', category: 'LMS' },
        // SR
        { value: 'SR Malachite Green', category: 'SR' },
        { value: 'SR Olive Green', category: 'SR' },
        { value: 'SR Bulleid Green', category: 'SR' },
        { value: 'SR Wartime Black', category: 'SR' },
        // BR
        { value: 'BR Lined Green', category: 'BR' },
        { value: 'BR Brunswick Green', category: 'BR' },
        { value: 'BR Black (Early Crest)', category: 'BR' },
        { value: 'BR Black (Late Crest)', category: 'BR' },
        { value: 'BR Lined Black', category: 'BR' },
        { value: 'BR Maroon', category: 'BR' },
        { value: 'BR Blue', category: 'BR' },
        { value: 'BR Large Logo Blue', category: 'BR' },
        { value: 'BR Two-Tone Green', category: 'BR' },
        { value: 'BR Blue/Grey', category: 'BR' },
        { value: 'BR Railfreight Grey', category: 'BR' },
        { value: 'BR InterCity Executive', category: 'BR' },
        { value: 'BR InterCity Swallow', category: 'BR' },
        { value: 'BR Trainload Coal', category: 'BR Sector' },
        { value: 'BR Trainload Metals', category: 'BR Sector' },
        { value: 'BR Trainload Petroleum', category: 'BR Sector' },
        { value: 'BR Trainload Construction', category: 'BR Sector' },
        { value: 'BR Network SouthEast', category: 'BR Sector' },
        { value: 'BR Provincial', category: 'BR Sector' },
        { value: 'BR Parcels Red', category: 'BR Sector' },
        // Modern
        { value: 'Virgin Trains Red', category: 'Modern' },
        { value: 'First Great Western Green', category: 'Modern' },
        { value: 'GNER Dark Blue', category: 'Modern' },
        { value: 'EWS Maroon & Gold', category: 'Modern' },
        { value: 'Freightliner Green', category: 'Modern' },
        { value: 'DRS Compass Blue', category: 'Modern' },
        { value: 'GBRf Orange & Blue', category: 'Modern' },
        { value: 'Colas Rail Orange & Yellow', category: 'Modern' },
        // Wagons
        { value: 'BR Bauxite', category: 'Freight' },
        { value: 'BR Grey (Freight)', category: 'Freight' },
        { value: 'Red Oxide', category: 'Freight' },
        { value: 'Private Owner', category: 'Freight' }
      ]
    },

    // Fuzzy search: matches anywhere in string, scores by position and quality
    fuzzyMatch(query, text) {
      const q = query.toLowerCase();
      const t = text.toLowerCase();
      if (t.includes(q)) {
        const idx = t.indexOf(q);
        // Better score for matches at start of words
        const atWordBoundary = idx === 0 || t[idx-1] === ' ' || t[idx-1] === '(' || t[idx-1] === '-';
        return { match: true, score: atWordBoundary ? 100 - idx : 50 - idx, index: idx };
      }
      // Check initials match (e.g., "GWR" matches each word)
      if (q.length >= 2) {
        const words = text.split(/[\s\-&()]+/).filter(w => w.length > 0);
        const initials = words.map(w => w[0].toLowerCase()).join('');
        if (initials.includes(q)) return { match: true, score: 30, index: 0 };
      }
      // Levenshtein-lite: allow one character off for queries of 4+
      if (q.length >= 4) {
        for (let i = 0; i <= t.length - q.length; i++) {
          let diff = 0;
          for (let j = 0; j < q.length; j++) {
            if (t[i+j] !== q[j]) diff++;
            if (diff > 1) break;
          }
          if (diff <= 1) return { match: true, score: 10, index: i };
        }
      }
      return { match: false, score: 0 };
    },

    search(query, dataKey) {
      if (!query || query.length < 1) return [];
      const items = this.data[dataKey] || [];
      const results = [];
      for (const item of items) {
        const result = this.fuzzyMatch(query, item.value);
        if (result.match) {
          results.push({ ...item, score: result.score, matchIndex: result.index });
        }
      }
      // Also search in existing catalog data for user-entered values
      const catalogValues = app.getUniqueFieldValues(dataKey);
      for (const val of catalogValues) {
        if (results.some(r => r.value.toLowerCase() === val.toLowerCase())) continue;
        const result = this.fuzzyMatch(query, val);
        if (result.match) {
          results.push({ value: val, category: 'Your Collection', score: result.score + 5, matchIndex: result.index });
        }
      }
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, 8);
    },

    show(inputId, dataKey) {
      const input = document.getElementById(inputId);
      const list = document.getElementById(`suggest-${inputId}`);
      if (!input || !list) return;

      const query = input.value.trim();
      const results = this.search(query, dataKey);

      if (results.length === 0) {
        list.style.display = 'none';
        return;
      }

      list.innerHTML = results.map((item, i) => {
        const highlighted = this.highlightMatch(item.value, query);
        return `<li class="autosuggest-item${i===0?' highlighted':''}"
                    data-input="${app.esc(inputId)}" data-value="${app.esc(item.value)}">
          <span>${highlighted}</span>
          <span class="autosuggest-category">${app.esc(item.category || '')}</span>
        </li>`;
      }).join('');
      // Attach click handlers safely
      list.querySelectorAll('.autosuggest-item').forEach(li => {
        li.onmousedown = () => {
          this.select(li.dataset.input, li.dataset.value);
        };
      });

      list.style.display = 'block';

      // Keyboard navigation
      input.onkeydown = (e) => {
        const items = list.querySelectorAll('.autosuggest-item');
        let idx = Array.from(items).findIndex(el => el.classList.contains('highlighted'));

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[idx]?.classList.remove('highlighted');
          idx = Math.min(idx + 1, items.length - 1);
          items[idx]?.classList.add('highlighted');
          items[idx]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[idx]?.classList.remove('highlighted');
          idx = Math.max(idx - 1, 0);
          items[idx]?.classList.add('highlighted');
          items[idx]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter' && idx >= 0) {
          e.preventDefault();
          const val = items[idx]?.textContent?.trim().split('\n')[0].trim();
          if (val) this.select(inputId, results[idx]?.value || val);
        } else if (e.key === 'Escape') {
          this.hide(inputId);
        }
      };
    },

    hide(inputId) {
      const list = document.getElementById(`suggest-${inputId}`);
      if (list) list.style.display = 'none';
      const input = document.getElementById(inputId);
      if (input) input.onkeydown = null;
    },

    select(inputId, value) {
      const input = document.getElementById(inputId);
      if (input) input.value = value;
      this.hide(inputId);
    },

    highlightMatch(text, query) {
      if (!query) return app.esc(text);
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return app.esc(text);
      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + query.length);
      const after = text.slice(idx + query.length);
      return `${app.esc(before)}<span class="match-highlight">${app.esc(match)}</span>${app.esc(after)}`;
    }
  },

  // Get unique values from existing catalog items for a given field
  getUniqueFieldValues(dataKey) {
    const fieldMap = { manufacturers: 'manufacturer', retailers: 'placeOfPurchase', liveries: 'livery' };
    const field = fieldMap[dataKey];
    if (!field) return [];
    const values = new Set();
    for (const item of this.items) {
      if (item[field] && item[field].trim()) values.add(item[field].trim());
    }
    return Array.from(values);
  },

  // ==================== Reference DB: Name Auto-Fill ====================

  suggestModelName() {
    const input = document.getElementById('formName');
    const list = document.getElementById('suggest-modelName');
    if (!input || !list) return;

    const query = input.value.trim();
    if (query.length < 2) { list.style.display = 'none'; return; }

    // Search the reference DB
    const results = referenceDB.searchModels(query);
    if (results.length === 0) { list.style.display = 'none'; return; }

    list.innerHTML = results.map((model, i) => {
      const highlighted = this.suggest.highlightMatch(model.name, query);
      return `<li class="autosuggest-item${i===0?' highlighted':''}"
                  data-index="${i}" data-query="${this.esc(query)}">
        <span>${highlighted}</span>
        <span class="ref-badge">Auto-fill</span>
      </li>`;
    }).join('');
    // Attach click handlers safely via event delegation
    list.querySelectorAll('.autosuggest-item').forEach(li => {
      li.onmousedown = () => {
        this.selectRefModel(parseInt(li.dataset.index), query);
      };
    });
    list.style.display = 'block';

    // Store results for selection
    this._lastRefResults = results;

    // Keyboard nav
    input.onkeydown = (e) => {
      const items = list.querySelectorAll('.autosuggest-item');
      let idx = Array.from(items).findIndex(el => el.classList.contains('highlighted'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[idx]?.classList.remove('highlighted');
        idx = Math.min(idx + 1, items.length - 1);
        items[idx]?.classList.add('highlighted');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[idx]?.classList.remove('highlighted');
        idx = Math.max(idx - 1, 0);
        items[idx]?.classList.add('highlighted');
      } else if (e.key === 'Enter' && idx >= 0) {
        e.preventDefault();
        this.selectRefModel(idx, query);
      } else if (e.key === 'Escape') {
        list.style.display = 'none';
      }
    };
  },

  hideModelSuggestions() {
    const list = document.getElementById('suggest-modelName');
    if (list) list.style.display = 'none';
  },

  selectRefModel(index, query) {
    const results = this._lastRefResults || [];
    const model = results[index];
    if (!model) return;

    this.selectedRefModel = model;

    // Auto-fill all fields
    document.getElementById('formName').value = model.name;
    document.getElementById('formManufacturer').value = model.manufacturer || '';
    document.getElementById('formLivery').value = model.livery || '';
    document.getElementById('formHistory').value = model.historicalBackground || '';
    document.getElementById('formGoesWellWith').value = model.goesWellWith || '';

    // Set category and subcategory
    if (model.categoryId) {
      document.getElementById('formCategory').value = model.categoryId;
      this.updateSubcategories();
      if (model.subcategoryId) {
        document.getElementById('formSubcategory').value = model.subcategoryId;
      }
    }

    // Show reference image notice
    const notice = document.getElementById('refImageNotice');
    const noticeText = document.getElementById('refImageNoticeText');
    if (model.refImage) {
      noticeText.textContent = `Reference image available for ${model.name}. It will be shown alongside your own photos.`;
      notice.style.display = 'flex';
      // Store reference image URL
      if (!this.existingImages.includes(model.refImage)) {
        this.existingImages.unshift(model.refImage);
        this.renderUploadPreviews();
      }
    } else {
      noticeText.textContent = `Fields auto-filled from reference database. You can edit any field.`;
      notice.style.display = 'flex';
    }

    // Show goes-well-with suggestion chips
    this.showGoesWellWithChips(model.subcategoryId);

    // Hide the dropdown
    this.hideModelSuggestions();
    document.getElementById('formName').onkeydown = null;
  },

  showGoesWellWithChips(subcategoryId) {
    const container = document.getElementById('goesWellSuggestions');
    if (!container) return;

    const suggestions = referenceDB.getCompatible(subcategoryId);
    if (suggestions.length === 0) { container.style.display = 'none'; return; }

    container.className = 'suggest-chips';
    container.style.display = 'flex';
    container.innerHTML = suggestions.map((s, i) =>
      `<span class="suggest-chip" data-value="${this.esc(s)}">${this.esc(s)}</span>`
    ).join('');
    // Attach click handlers safely
    container.querySelectorAll('.suggest-chip').forEach(chip => {
      chip.onclick = () => this.addGoesWellWith(chip.dataset.value);
    });
  },

  addGoesWellWith(value) {
    const input = document.getElementById('formGoesWellWith');
    if (!input) return;
    const current = input.value.trim();
    // Check if already contains this value (split by comma and compare trimmed)
    if (current) {
      const existing = current.split(',').map(s => s.trim().toLowerCase());
      if (existing.includes(value.toLowerCase())) return;
      // Always append with comma separator
      input.value = current.replace(/,\s*$/, '') + ', ' + value;
    } else {
      input.value = value;
    }
  },

  // ==================== Initialization ====================

  async init() {
    // Check auth status; redirect to login if needed
    try {
      const authRes = await fetch('/api/auth/status');
      const auth = await authRes.json();
      if (!auth.authenticated && auth.hasPassword) {
        window.location.href = '/login.html';
        return;
      }
      // Show logout buttons (desktop header + mobile drawer) if password is set
      if (auth.hasPassword) {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.style.display = '';
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = '';
      }
    } catch(e) { /* continue anyway */ }

    await this.loadSettings();
    await this.loadCategories();
    await this.loadAllItems();
    await this.loadStats();
    this.initTheme();
    this.applyAppName();
    this.initKeyboardShortcuts();
    window.addEventListener('popstate', (e) => this.handlePopState(e));
    // Seed the initial history entry so the first back doesn't exit the app
    history.replaceState({ view: 'landing' }, '', null);
    this.showLanding();
  },

  // logout() lives in auth.js

  async loadSettings() {
    try {
      this.settings = await this.api('/api/settings');
    } catch(e) { /* use defaults */ }
  },

  applyAppName() {
    // Update page title
    document.title = this.settings.appName;
    // Update logo text
    const logoEl = document.querySelector('.logo span:last-child');
    if (logoEl) logoEl.innerHTML = `${this.esc(this.settings.appName)}`;
    // Update footer
    const footer = document.querySelector('.site-footer');
    if (footer) footer.innerHTML = `${this.esc(this.settings.appName)} &copy; ${new Date().getFullYear()} &middot; Built with care for collectors`;
  },

  async loadAllItems() {
    // Load all items once for the suggest system to reference
    try {
      this.items = await this.api('/api/items');
    } catch(e) { this.items = []; }
  },

  // ==================== Dark Mode ====================

  initTheme() {
    const saved = localStorage.getItem('trainCatalogTheme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    this.updateThemeIcon();
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('trainCatalogTheme', next);
    this.updateThemeIcon();
  },

  updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const glyph = isDark ? '☀️' : '🌙';
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = glyph;
    const mobileIcon = document.getElementById('mobileThemeIcon');
    if (mobileIcon) mobileIcon.textContent = glyph;
  },

  // ==================== API Helpers ====================

  async api(endpoint, options = {}) {
    try {
      const res = await fetch(endpoint, options);
      if (res.status === 401) {
        window.location.href = '/login.html';
        throw new Error('Session expired');
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return res.json();
    } catch (e) {
      this.toast(e.message, 'error');
      throw e;
    }
  },

  async loadCategories() {
    this.categories = await this.api('/api/categories');
  },

  async loadItems(params = '') {
    this.items = await this.api(`/api/items${params}`);
  },

  async loadStats() {
    this.stats = await this.api('/api/stats');
    this.renderStats();
  },

  // ==================== Navigation ====================

  setNav(active) {
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const el = document.getElementById(`nav-${active}`);
    if (el) el.classList.add('active');
    document.getElementById('navLinks').classList.remove('open');
  },

  // ==================== SPA History (back gesture / browser back) ====================

  _pushingState: false,

  /** Push a history entry so the browser back button / gesture stays in-app */
  pushHistory(view, data) {
    if (this._pushingState) return; // prevent re-entrance from popstate
    const state = { view, ...data };
    history.pushState(state, '', null);
  },

  /** Restore a view from a popstate event (browser back/forward) */
  handlePopState(event) {
    const state = event.state;
    this._pushingState = true;
    if (!state || state.view === 'landing') {
      this.showLanding();
    } else if (state.view === 'catalog') {
      this.showCatalog(state.filter || null);
    } else if (state.view === 'detail' && state.id) {
      this.showDetail(state.id);
    } else if (state.view === 'backup') {
      this.showBackup();
    } else {
      this.showLanding();
    }
    this._pushingState = false;
  },

  showLanding() {
    this.currentView = 'landing';
    this.setNav('home');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
    this.pushHistory('landing', {});
  },

  async showCatalog(filter = null) {
    this.currentView = 'catalog';
    this.currentFilter = filter;
    this.showWishlistOnly = false;
    this.setNav('catalog');

    let params = '';
    if (filter) {
      if (filter.type === 'search') params = `?search=${encodeURIComponent(filter.value)}`;
      else if (filter.type === 'category') params = `?category=${filter.value}`;
      else if (filter.type === 'subcategory') params = `?subcategory=${filter.value}`;
      // Tag filtering is done client-side after loading all items
    }

    await this.loadItems(params);

    // Filter by tag if specified
    if (filter && filter.type === 'tag') {
      this.items = this.items.filter(item =>
        item.tags && Array.isArray(item.tags) && item.tags.includes(filter.value)
      );
    }

    await this.loadStats();
    document.getElementById('statsBar').style.display = '';
    this.render();
    this.pushHistory('catalog', { filter });

    // Auto-close the mobile sidebar drawer when a filter is picked
    document.body.classList.remove('drawer-open');
    const sidebarDrawerBackdrop = document.getElementById('sidebarDrawerBackdrop');
    if (sidebarDrawerBackdrop) sidebarDrawerBackdrop.classList.remove('open');

    // Restore scroll position if returning from a detail view
    if (this.catalogScrollY != null) {
      window.scrollTo({ top: this.catalogScrollY, behavior: 'instant' });
      this.catalogScrollY = null;
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  },

  async showDetail(id) {
    // Remember where the user was in the catalog so we can restore it on return
    if (this.currentView === 'catalog') {
      this.catalogScrollY = window.scrollY;
    }
    this.currentView = 'detail';
    try {
      this.detailItem = await this.api(`/api/items/${id}`);
      this.render();
      window.scrollTo({ top: 0, behavior: 'instant' });
      this.pushHistory('detail', { id });
    } catch (e) { /* toast already shown */ }
  },

  showBackup() {
    this.currentView = 'backup';
    this.setNav('backup');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
    this.pushHistory('backup', {});
    // Load share section async
    this.renderShareSection().then(html => {
      const el = document.getElementById('shareSection');
      if (el) el.innerHTML = html;
    });
  },

  // ==================== Rendering ====================

  render() {
    const main = document.getElementById('mainContent');
    switch (this.currentView) {
      case 'landing': main.innerHTML = this.renderLanding(); break;
      case 'catalog': main.innerHTML = this.renderCatalog(); break;
      case 'detail':  main.innerHTML = this.renderDetail();  break;
      case 'dashboard': this.showDashboard(); break;
      case 'backup':  main.innerHTML = this.renderBackupView(); break;
      case 'trash':   main.innerHTML = this.renderTrashView(); break;
      case 'timeline': main.innerHTML = this.renderTimelineView(); break;
      case 'health':  main.innerHTML = this.renderHealthView(); this.loadHealthData(); break;
      case 'print':   main.innerHTML = this.renderPrintView(); break;
    }
  },

  updateNav() {
    // Update nav active state based on currentView
    const viewNavMap = { landing: 'home', catalog: 'catalog', dashboard: 'dashboard', backup: 'backup' };
    const navId = viewNavMap[this.currentView];
    if (navId) this.setNav(navId);
  },

  renderStats() {
    const s = this.stats;
    if (!s) return;
    const c = this.settings.currency;
    const fmt = (n) => n.toLocaleString('en-GB', { minimumFractionDigits: 2 });
    const bar = document.getElementById('statsContent');
    bar.innerHTML = `
      <div class="stats-summary-line" onclick="app.toggleStatsExpand()">
        📦 <span class="stat-value">${s.totalItems}</span> items
        <span class="stat-sep">·</span>
        💷 <span class="stat-value">${c}${fmt(s.totalSpent)}</span>
        ${s.totalCurrentValue > 0 ? `<span class="stat-sep">·</span> 📈 <span class="stat-value">${c}${fmt(s.totalCurrentValue)}</span>` : ''}
      </div>
      <button class="stats-expand-toggle" onclick="app.toggleStatsExpand()" aria-label="Expand stats">▾</button>
      <span class="stat-tag accent">
        <span class="stat-icon">💷</span>
        Spent: <span class="stat-value">${c}${fmt(s.totalSpent)}</span>
      </span>
      ${s.totalCurrentValue > 0 ? `
      <span class="stat-tag accent">
        <span class="stat-icon">📈</span>
        Value: <span class="stat-value">${c}${fmt(s.totalCurrentValue)}</span>
      </span>
      ` : ''}
      <span class="stat-tag">
        <span class="stat-icon">🚂</span>
        Locomotives: <span class="stat-value">${s.locomotiveCount}</span>
      </span>
      <span class="stat-tag">
        <span class="stat-icon">🚃</span>
        Rolling Stock: <span class="stat-value">${s.rollingStockCount}</span>
      </span>
      <span class="stat-tag">
        <span class="stat-icon">📦</span>
        Total: <span class="stat-value">${s.totalItems}</span>
      </span>
      ${s.wishlistCount > 0 ? `
      <span class="stat-tag clickable ${this.showWishlistOnly ? 'active' : ''}" onclick="app.toggleWishlist()">
        <span class="stat-icon">⭐</span>
        Wishlist: <span class="stat-value">${s.wishlistCount}</span>
      </span>
      ` : ''}
      ${this.renderSubcategoryStats(s)}
    `;
  },

  toggleStatsExpand() {
    const bar = document.getElementById('statsBar');
    if (bar) bar.classList.toggle('expanded');
  },

  renderSubcategoryStats(s) {
    const nonZero = Object.entries(s.bySubcategory).filter(([, v]) => v.count > 0);
    if (nonZero.length === 0) return '';
    const pills = nonZero.map(([, v]) =>
      `<span class="stat-tag"><span class="stat-value">${v.count}</span> ${v.name}</span>`
    ).join('');
    return `
      <button class="stats-breakdown-toggle" onclick="app.toggleStatsBreakdown()" aria-label="Show category breakdown">
        <span class="stat-icon">▾</span>
        <span>Categories</span>
        <span class="stats-breakdown-count">${nonZero.length}</span>
      </button>
      <div class="stats-breakdown" id="statsBreakdown">${pills}</div>
    `;
  },

  toggleStatsBreakdown() {
    const el = document.getElementById('statsBreakdown');
    const btn = document.querySelector('.stats-breakdown-toggle');
    if (!el) return;
    const open = el.classList.toggle('open');
    if (btn) btn.classList.toggle('open', open);
  },

  // Landing + Catalog + Sidebar + Item Card + Empty → moved to catalog.js


  // Detail View (renderDetail) → moved to detail.js

  // Backup & Settings View + saveSettings → moved to settings.js

  // eBay Valuation actions → moved to valuation.js

  // Valuation Badge / Detail renderers → moved to valuation.js

  timeAgo(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd ago';
    const weeks = Math.floor(days / 7);
    return weeks + 'w ago';
  },

  // Password management (changePassword / removePasswordUI) lives in auth.js

  // Modal / Forms (open/close, category selects) → moved to form.js

  // Image Upload → moved to form.js

  // Save Item / Delete → moved to form.js

  // ==================== Search ====================

  handleSearch(event) {
    if (event.key === 'Enter') {
      const q = event.target.value.trim();
      if (q) {
        this.showCatalog({ type: 'search', value: q });
      } else {
        this.showCatalog();
      }
    }
  },

  // Live search — fires on every input event, debounced to 250ms so we
  // don't thrash the server on each keystroke. Preserves focus because the
  // nav search input lives outside the re-rendered #mainContent area.
  handleSearchLive(event) {
    const q = event.target.value.trim();
    this._liveSearchQuery = q;
    clearTimeout(this._liveSearchTimer);
    this._liveSearchTimer = setTimeout(() => {
      // Ignore if user already typed further while waiting
      if (q !== this._liveSearchQuery) return;
      const currentSearch = this.currentFilter && this.currentFilter.type === 'search'
        ? this.currentFilter.value : '';
      if (q === currentSearch) return;
      if (q.length === 0) {
        // Empty query only clears if we were actively searching
        if (currentSearch) this.showCatalog();
      } else {
        this.showCatalog({ type: 'search', value: q });
      }
    }, 250);
  },

  // ==================== Mobile Drawer ====================
  toggleMobileMenu() {
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (!drawer) return;
    const open = drawer.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('drawer-open', open);
  },

  closeMobileMenu() {
    const drawer = document.getElementById('mobileDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('drawer-open');
  },

  handleMobileSearch(event) {
    if (event.key === 'Enter') {
      const q = event.target.value.trim();
      this.closeMobileMenu();
      if (q) this.showCatalog({ type: 'search', value: q });
      else this.showCatalog();
    }
  },

  // ==================== Sidebar Drawer (mobile) ====================
  openSidebarDrawer() {
    const sidebar = document.querySelector('.catalog-layout .sidebar');
    const backdrop = document.getElementById('sidebarDrawerBackdrop');
    if (!sidebar) return;
    sidebar.classList.add('drawer-open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('drawer-open');
  },

  closeSidebarDrawer() {
    const sidebar = document.querySelector('.catalog-layout .sidebar');
    const backdrop = document.getElementById('sidebarDrawerBackdrop');
    if (sidebar) sidebar.classList.remove('drawer-open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('drawer-open');
  },

  // Image Viewer / Lightbox → moved to detail.js

  // Tags Management → moved to form.js

  // Wishlist fields + Product Code auto-detect → moved to form.js

  // Service Log → moved to detail.js

  // Dashboard + Charts → moved to valuation.js

  // Export / Import / CSV → moved to settings.js

  // ==================== Category Management ====================

  async addCategory() {
    const name = await this.showInputModal({
      title: 'New Category',
      label: 'Category Name',
      placeholder: 'e.g., Scenery, Track & Accessories...',
      icon: '📁',
      hint: 'Right then, let\u2019s get things organised!'
    });
    if (!name) return;
    try {
      await this.api('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      this.toast('New siding opened! Category added.');
      await this.loadCategories();
      await this.loadStats();
      this.render();
    } catch(e) { /* toast shown */ }
  },

  async renameCategory(id) {
    const cat = this.categories.find(c => c.id === id);
    const name = await this.showInputModal({
      title: 'Rename Category',
      label: 'New Name',
      value: cat ? cat.name : '',
      icon: '✏️',
      hint: 'A fresh name for this part of the shed.'
    });
    if (!name) return;
    try {
      await this.api(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      this.toast('Category renamed \u2014 looking smart!');
      await this.loadCategories();
      this.render();
    } catch(e) { /* toast shown */ }
  },

  async removeCategoryConfirm(id) {
    const cat = this.categories.find(c => c.id === id);
    const ok = await this.showConfirmModal({
      title: 'Delete Category?',
      message: `Are you sure you want to remove <strong>${this.esc(cat?.name || 'this category')}</strong>? This can\u2019t be undone. Make sure no items are parked here first!`,
      confirmText: 'Remove',
      icon: '🗑️'
    });
    if (!ok) return;
    try {
      await this.api(`/api/categories/${id}`, { method: 'DELETE' });
      this.toast('Category removed from the timetable.');
      await this.loadCategories();
      await this.loadStats();
      this.showCatalog();
    } catch(e) { /* toast shown */ }
  },

  async addSubcategory(categoryId) {
    const cat = this.categories.find(c => c.id === categoryId);
    const name = await this.showInputModal({
      title: 'New Subcategory',
      label: 'Subcategory Name',
      placeholder: 'e.g., Tank Engines, Pullman Coaches...',
      icon: '📂',
      hint: cat ? `Adding to ${cat.name} \u2014 lovely stuff!` : 'A new berth awaits.'
    });
    if (!name) return;
    try {
      await this.api(`/api/categories/${categoryId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      this.toast('Subcategory coupled up nicely!');
      await this.loadCategories();
      await this.loadStats();
      this.render();
    } catch(e) { /* toast shown */ }
  },

  async renameSubcategory(categoryId, subcategoryId) {
    const cat = this.categories.find(c => c.id === categoryId);
    const sub = cat ? cat.subcategories.find(s => s.id === subcategoryId) : null;
    const name = await this.showInputModal({
      title: 'Rename Subcategory',
      label: 'New Name',
      value: sub ? sub.name : '',
      icon: '✏️',
      hint: 'A little touch-up for the nameplate.'
    });
    if (!name) return;
    try {
      await this.api(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      this.toast('Subcategory renamed \u2014 that\u2019s the ticket!');
      await this.loadCategories();
      this.render();
    } catch(e) { /* toast shown */ }
  },

  async removeSubcategoryConfirm(categoryId, subcategoryId) {
    const cat = this.categories.find(c => c.id === categoryId);
    const sub = cat ? cat.subcategories.find(s => s.id === subcategoryId) : null;
    const ok = await this.showConfirmModal({
      title: 'Delete Subcategory?',
      message: `Remove <strong>${this.esc(sub?.name || 'this subcategory')}</strong> from ${this.esc(cat?.name || 'the roster')}? Make sure no items are using it first!`,
      confirmText: 'Remove',
      icon: '🗑️'
    });
    if (!ok) return;
    try {
      await this.api(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, { method: 'DELETE' });
      this.toast('Subcategory uncoupled and removed.');
      await this.loadCategories();
      await this.loadStats();
      this.showCatalog();
    } catch(e) { /* toast shown */ }
  },

  // ==================== Sorting ====================

  sortItems(items) {
    const sorted = [...items];
    const [field, dir] = this.currentSort.split('-');
    const asc = dir === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let va, vb;
      switch (field) {
        case 'name':
          va = (a.name || '').toLowerCase();
          vb = (b.name || '').toLowerCase();
          return va < vb ? -1 * asc : va > vb ? 1 * asc : 0;
        case 'price':
          return ((a.purchasePrice || 0) - (b.purchasePrice || 0)) * asc;
        case 'manufacturer':
          va = (a.manufacturer || '').toLowerCase();
          vb = (b.manufacturer || '').toLowerCase();
          return va < vb ? -1 * asc : va > vb ? 1 * asc : 0;
        case 'date':
          va = a.createdAt || '';
          vb = b.createdAt || '';
          return va < vb ? -1 * asc : va > vb ? 1 * asc : 0;
        case 'service':
          va = a.lastServiceDate || '9999';
          vb = b.lastServiceDate || '9999';
          return va < vb ? -1 * asc : va > vb ? 1 * asc : 0;
        default:
          return 0;
      }
    });
    return sorted;
  },

  setSort(value) {
    this.currentSort = value;
    this.render();
  },

  // ==================== Helpers ====================

  getCategoryName(id) {
    for (const cat of this.categories) {
      if (cat.id === id) return cat.name;
    }
    return '';
  },

  getSubcategoryName(id) {
    for (const cat of this.categories) {
      for (const sub of cat.subcategories) {
        if (sub.id === id) return sub.name;
      }
    }
    return '';
  },

  // Mobile tag bar + sidebar tag helpers → moved to catalog.js

  // Returns number of days since last service, or null if no date
  daysSinceService(dateStr) {
    if (!dateStr) return null;
    try {
      const serviceDate = new Date(dateStr);
      const now = new Date();
      const diff = Math.floor((now - serviceDate) / (1000 * 60 * 60 * 24));
      return diff;
    } catch { return null; }
  },

  // Returns a service status badge based on configurable service interval
  serviceStatusBadge(dateStr) {
    const days = this.daysSinceService(dateStr);
    const interval = this.settings.serviceIntervalDays || 365;
    const warnAt = Math.round(interval * 0.75);
    if (days === null) return '<span class="service-badge service-unknown" title="No service date recorded">⚙️ No service date</span>';
    if (days > interval) return `<span class="service-badge service-overdue" title="Last serviced ${days} days ago">🔧 Service overdue</span>`;
    if (days > warnAt) return `<span class="service-badge service-due-soon" title="Last serviced ${days} days ago">⚙️ Service due soon</span>`;
    return `<span class="service-badge service-ok" title="Last serviced ${days} days ago">✅ Serviced</span>`;
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  },

  esc(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'error' ? this.mascotTiny('worried') : this.mascotTiny('happy');
    toast.innerHTML = `<span class="toast-mascot">${icon}</span> ${this.esc(message)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },

  // ==================== Greetings & Personality ====================

  getGreeting() {
    const hour = new Date().getHours();
    const count = this.stats?.totalItems || 0;
    if (hour < 6) return 'Burning the midnight oil? The depot never sleeps!';
    if (hour < 12) {
      const m = ['Good morning! The shed doors are open.', 'Morning! Time for a cuppa and some cataloguing.', 'Rise and shine \u2014 your collection awaits!'];
      return m[Math.floor(Math.random() * m.length)];
    }
    if (hour < 18) {
      if (count === 0) return 'The shed\u2019s quiet \u2014 why not add your first model?';
      const a = ['Good afternoon! Fancy adding to the collection?', `${count} items in the shed and counting!`, 'Afternoon! Everything shipshape on the layout?'];
      return a[Math.floor(Math.random() * a.length)];
    }
    const e = ['Evening! Perfect time to browse the collection.', 'Good evening \u2014 the depot lights are on.', 'Evening! Time to wind down with some trains.'];
    return e[Math.floor(Math.random() * e.length)];
  },

  // Mascot SVGs (mascotTiny / mascotSmall) live in modals.js

  // Duplicate Detection + Wishlist Notes → moved to form.js

  // Advanced Search / Filter → moved to catalog.js

  // Timeline + Spotlight → moved to catalog.js


  // Trash / Bin (soft delete) → moved to settings.js

  // Drag & Drop Image Reorder → moved to detail.js

  // ==================== Keyboard Shortcuts ====================

  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      // Don't trigger when modal is open
      if (document.querySelector('.modal-overlay.active') || document.querySelector('.confirm-overlay') || document.querySelector('.lightbox-overlay')) return;

      switch (e.key) {
        case 'n': case 'N': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); this.openAddModal(); } break;
        case 'e': case 'E': if (this.currentView === 'detail' && this.detailItem) { e.preventDefault(); this.openEditModal(this.detailItem.id); } break;
        case 'j': case 'J': e.preventDefault(); this.navigateItems(1); break;
        case 'k': case 'K': e.preventDefault(); this.navigateItems(-1); break;
        case '/': e.preventDefault(); document.getElementById('globalSearch')?.focus(); break;
        case '?': e.preventDefault(); this.showKeyboardShortcuts(); break;
        case 'Escape': this.closeModal(); break;
      }
    });
  },

  navigateItems(direction) {
    if (this.currentView !== 'catalog' || this.items.length === 0) return;
    const cards = document.querySelectorAll('.item-card');
    if (cards.length === 0) return;
    // Simple: navigate to first or last item detail
    const sorted = this.getFilteredItems();
    const idx = direction > 0 ? 0 : sorted.length - 1;
    if (sorted[idx]) this.showDetail(sorted[idx].id);
  },

  showKeyboardShortcuts() {
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-overlay';
    overlay.id = 'shortcutsOverlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="shortcuts-panel">
        <h3>⌨️ Keyboard Shortcuts</h3>
        <div class="shortcut-row"><span class="shortcut-desc">Add new item</span><span class="shortcut-key">N</span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Edit current item</span><span class="shortcut-key">E</span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Next item</span><span class="shortcut-key">J</span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Previous item</span><span class="shortcut-key">K</span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Focus search</span><span class="shortcut-key">/</span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Show shortcuts</span><span class="shortcut-key">?</span></div>
        <div class="shortcut-row"><span class="shortcut-desc">Close modal / lightbox</span><span class="shortcut-key">Esc</span></div>
        <div style="margin-top:16px;text-align:center;"><button class="btn btn-outline btn-sm" onclick="document.getElementById('shortcutsOverlay').remove()">Got it!</button></div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  // Data Health Check + Maintenance Reminders → moved to settings.js

  // Public Share Link → moved to settings.js

  // Print-Friendly Catalogue → moved to settings.js

  // QR Code Generator → moved to settings.js

  // Insurance / Valuation Report → moved to settings.js

  // mascotMedium lives in modals.js
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => app.init());
