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
    const results = (typeof referenceDB !== 'undefined') ? referenceDB.searchModels(query) : [];
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
    if (!container || typeof referenceDB === 'undefined') return;

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
      // Show logout button if password is set
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn && auth.hasPassword) logoutBtn.style.display = '';
    } catch(e) { /* continue anyway */ }

    await this.loadSettings();
    await this.loadCategories();
    await this.loadAllItems();
    await this.loadStats();
    this.initTheme();
    this.applyAppName();
    this.initKeyboardShortcuts();
    this.showLanding();
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    window.location.href = '/login.html';
  },

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
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    icon.textContent = isDark ? '☀️' : '🌙';
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

  showLanding() {
    this.currentView = 'landing';
    this.setNav('home');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
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
    } catch (e) { /* toast already shown */ }
  },

  showBackup() {
    this.currentView = 'backup';
    this.setNav('backup');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
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
    const bar = document.getElementById('statsContent');
    bar.innerHTML = `
      <span class="stat-tag accent">
        <span class="stat-icon">💷</span>
        Spent: <span class="stat-value">${this.settings.currency}${s.totalSpent.toLocaleString('en-GB', {minimumFractionDigits:2})}</span>
      </span>
      ${s.totalCurrentValue > 0 ? `
      <span class="stat-tag accent">
        <span class="stat-icon">📈</span>
        Value: <span class="stat-value">${this.settings.currency}${s.totalCurrentValue.toLocaleString('en-GB', {minimumFractionDigits:2})}</span>
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

  renderSubcategoryStats(s) {
    const nonZero = Object.entries(s.bySubcategory).filter(([, v]) => v.count > 0);
    if (nonZero.length === 0) return '';
    return nonZero.map(([, v]) =>
      `<span class="stat-tag"><span class="stat-value">${v.count}</span> ${v.name}</span>`
    ).join('');
  },

  // --- Landing Page ---
  renderLanding() {
    return `
      <div class="hero">
        <div class="hero-content">
          <div class="hero-image">
            <svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" class="hero-train-svg">
              <!-- Track -->
              <rect x="20" y="170" width="440" height="4" rx="2" fill="#8B7355"/>
              <g fill="#6B5B3F">
                ${Array.from({length:22}, (_, i) => `<rect x="${25 + i*20}" y="174" width="12" height="6" rx="1"/>`).join('')}
              </g>
              <!-- Steam cloud -->
              <g opacity="0.25" fill="white">
                <circle cx="160" cy="55" r="20"><animate attributeName="cx" values="160;140;160" dur="4s" repeatCount="indefinite"/></circle>
                <circle cx="140" cy="45" r="15"><animate attributeName="cx" values="140;115;140" dur="5s" repeatCount="indefinite"/></circle>
                <circle cx="120" cy="50" r="12"><animate attributeName="cx" values="120;95;120" dur="6s" repeatCount="indefinite"/></circle>
              </g>
              <!-- Locomotive body -->
              <rect x="150" y="100" width="160" height="65" rx="4" fill="#1b4332"/>
              <rect x="150" y="95" width="160" height="12" rx="3" fill="#c9a227"/>
              <!-- Boiler -->
              <rect x="180" y="75" width="110" height="30" rx="15" fill="#1b4332"/>
              <circle cx="180" cy="90" r="15" fill="#0f2b1f"/>
              <circle cx="180" cy="90" r="10" fill="#333"/>
              <!-- Chimney -->
              <rect x="195" y="55" width="16" height="25" rx="3" fill="#1b4332"/>
              <rect x="191" y="50" width="24" height="8" rx="4" fill="#0f2b1f"/>
              <!-- Dome -->
              <ellipse cx="245" cy="75" rx="12" ry="10" fill="#c9a227"/>
              <!-- Cab -->
              <rect x="290" y="75" width="40" height="50" rx="3" fill="#2d6a4f"/>
              <rect x="296" y="82" width="12" height="16" rx="2" fill="#87CEEB" opacity="0.6"/>
              <rect x="312" y="82" width="12" height="16" rx="2" fill="#87CEEB" opacity="0.6"/>
              <!-- Wheels -->
              <circle cx="185" cy="165" r="18" fill="#333" stroke="#555" stroke-width="2"/>
              <circle cx="185" cy="165" r="5" fill="#c9a227"/>
              <circle cx="230" cy="165" r="18" fill="#333" stroke="#555" stroke-width="2"/>
              <circle cx="230" cy="165" r="5" fill="#c9a227"/>
              <circle cx="275" cy="165" r="18" fill="#333" stroke="#555" stroke-width="2"/>
              <circle cx="275" cy="165" r="5" fill="#c9a227"/>
              <circle cx="315" cy="165" r="12" fill="#333" stroke="#555" stroke-width="2"/>
              <circle cx="315" cy="165" r="4" fill="#c9a227"/>
              <!-- Connecting rod -->
              <line x1="185" y1="165" x2="275" y2="165" stroke="#888" stroke-width="3"/>
              <!-- Tender -->
              <rect x="335" y="110" width="80" height="55" rx="3" fill="#1b4332"/>
              <rect x="335" y="105" width="80" height="12" rx="3" fill="#0f2b1f"/>
              <rect x="340" y="115" width="70" height="30" rx="2" fill="#0a1510"/>
              <circle cx="360" cy="165" r="12" fill="#333" stroke="#555" stroke-width="2"/>
              <circle cx="360" cy="165" r="4" fill="#c9a227"/>
              <circle cx="395" cy="165" r="12" fill="#333" stroke="#555" stroke-width="2"/>
              <circle cx="395" cy="165" r="4" fill="#c9a227"/>
              <!-- Headlamp -->
              <circle cx="155" cy="108" r="6" fill="#FFD700" opacity="0.9"/>
              <circle cx="155" cy="108" r="3" fill="#FFF8DC"/>
              <!-- Buffer beam -->
              <rect x="145" y="130" width="8" height="35" rx="2" fill="#8B0000"/>
            </svg>
          </div>
          <h1 class="hero-title">${this.esc(this.settings.appName)}</h1>
          <p class="hero-subtitle">${this.esc(this.settings.tagline)}</p>
          <p class="hero-greeting">${this.getGreeting()}</p>
          <div class="hero-actions">
            <button class="btn btn-primary" onclick="app.showCatalog()">📖 Browse Collection</button>
            <button class="btn btn-secondary" onclick="app.openAddModal()">➕ Add New Item</button>
          </div>
          ${this.stats ? `
          <div class="hero-stats">
            <div class="hero-stat">
              <div class="hero-stat-value">${this.stats.totalItems}</div>
              <div class="hero-stat-label">Items in Collection</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value">${this.settings.currency}${this.stats.totalSpent.toLocaleString('en-GB',{minimumFractionDigits:2})}</div>
              <div class="hero-stat-label">Total Invested</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value">${this.stats.locomotiveCount}</div>
              <div class="hero-stat-label">Locomotives</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-value">${this.stats.rollingStockCount}</div>
              <div class="hero-stat-label">Rolling Stock</div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // --- Catalog View ---
  renderCatalog() {
    const filterTitle = this.getFilterTitle();
    return `
      <div class="main-content">
        <div class="catalog-layout">
          ${this.renderSidebar()}
          <div class="catalog-main">
            ${this.renderFilterPanel()}
            <div class="items-header">
              <div>
                <h2 class="items-title">${filterTitle}</h2>
                <span class="items-count">${this.getFilteredItems().length} item${this.getFilteredItems().length !== 1 ? 's' : ''}</span>
              </div>
              <div class="items-header-actions">
                <select class="sort-select" onchange="app.setSort(this.value)" title="Sort items">
                  <option value="name-asc" ${this.currentSort==='name-asc'?'selected':''}>Name A→Z</option>
                  <option value="name-desc" ${this.currentSort==='name-desc'?'selected':''}>Name Z→A</option>
                  <option value="price-desc" ${this.currentSort==='price-desc'?'selected':''}>Price High→Low</option>
                  <option value="price-asc" ${this.currentSort==='price-asc'?'selected':''}>Price Low→High</option>
                  <option value="manufacturer-asc" ${this.currentSort==='manufacturer-asc'?'selected':''}>Manufacturer A→Z</option>
                  <option value="date-desc" ${this.currentSort==='date-desc'?'selected':''}>Newest First</option>
                  <option value="date-asc" ${this.currentSort==='date-asc'?'selected':''}>Oldest First</option>
                  <option value="service-asc" ${this.currentSort==='service-asc'?'selected':''}>Service Due</option>
                </select>
                <button class="btn btn-primary" onclick="app.openAddModal()">➕ Add Item</button>
              </div>
            </div>
            ${this.getFilteredItems().length === 0 ? this.renderEmpty() : `
              <div class="items-grid">
                ${this.getFilteredItems().map(item => this.renderItemCard(item)).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  renderSidebar() {
    const s = this.stats;
    const catIcon = (id) => id === 'locomotives' ? '🚂' : id === 'rolling-stock' ? '🚃' : '📦';
    const allTags = this.getAllTagsForSidebar();
    return `
      <aside class="sidebar">
        <div class="sidebar-title">Categories</div>
        <ul class="category-list">
          <li class="subcategory-item ${!this.currentFilter && !this.showWishlistOnly ? 'active' : ''}"
              onclick="app.showCatalog()">
            All Items
            <span class="subcategory-count">${s ? s.totalItems : ''}</span>
          </li>
          ${s && s.wishlistCount > 0 ? `
          <li class="subcategory-item ${this.showWishlistOnly ? 'active' : ''}"
              onclick="app.toggleWishlist()">
            ⭐ Wishlist
            <span class="subcategory-count">${s.wishlistCount}</span>
          </li>
          ` : ''}
          ${this.categories.map(cat => `
            <li class="category-group-label">
              <span onclick="app.showCatalog({type:'category',value:'${cat.id}'})">${catIcon(cat.id)} ${cat.name}</span>
              <span class="cat-actions">
                <button class="cat-action-btn" onclick="event.stopPropagation();app.addSubcategory('${cat.id}')" title="Add subcategory">+</button>
                <button class="cat-action-btn" onclick="event.stopPropagation();app.renameCategory('${cat.id}')" title="Rename">✎</button>
                <button class="cat-action-btn danger" onclick="event.stopPropagation();app.removeCategoryConfirm('${cat.id}')" title="Delete">×</button>
              </span>
            </li>
            <ul class="subcategory-list">
              ${cat.subcategories.map(sub => `
                <li class="subcategory-item ${this.currentFilter?.value === sub.id ? 'active' : ''}"
                    onclick="app.showCatalog({type:'subcategory',value:'${sub.id}'})">
                  ${sub.name}
                  <span class="subcat-actions">
                    <button class="cat-action-btn" onclick="event.stopPropagation();app.renameSubcategory('${cat.id}','${sub.id}')" title="Rename">✎</button>
                    <button class="cat-action-btn danger" onclick="event.stopPropagation();app.removeSubcategoryConfirm('${cat.id}','${sub.id}')" title="Delete">×</button>
                  </span>
                  <span class="subcategory-count">${s?.bySubcategory?.[sub.id]?.count ?? 0}</span>
                </li>
              `).join('')}
            </ul>
          `).join('')}
        </ul>

        <div class="catalog-tags-section">
          <div class="catalog-tags-title">🏷️ Filter by Tag</div>
          ${allTags.length > 0 ? `
            <ul class="catalog-tags-list">
              ${allTags.map(tag => `
                <li class="catalog-tags-item ${this.currentFilter?.type === 'tag' && this.currentFilter?.value === tag.name ? 'active' : ''}"
                    onclick="app.showCatalog({type:'tag',value:'${this.esc(tag.name)}'})">
                  <span class="catalog-tags-item-name">#${this.esc(tag.name)}</span>
                  <span class="catalog-tags-item-count">${tag.count}</span>
                </li>
              `).join('')}
            </ul>
            ${this.currentFilter?.type === 'tag' ? `
              <button class="btn btn-outline btn-sm" style="width:100%;margin-top:8px;" onclick="app.showCatalog()">✕ Clear tag filter</button>
            ` : ''}
          ` : `
            <p class="catalog-tags-empty">
              No tags yet. Open any item's edit screen, type a tag in the <strong>Tags</strong> field and press Enter. Good examples: "layout-ready", "needs-service", "display".
            </p>
            <button class="btn btn-outline btn-sm" style="width:100%;margin-top:8px;" onclick="app.openAddModal()">➕ Add an item with tags</button>
          `}
        </div>

        <div class="sidebar-actions">
          <button class="btn btn-outline btn-sm" onclick="app.addCategory()" style="width:100%;margin-bottom:8px;">📁 Add Category</button>
          <button class="btn btn-outline btn-sm" onclick="app.openAddModal()" style="width:100%">➕ Add New Item</button>
        </div>
      </aside>
    `;
  },

  renderItemCard(item) {
    const img = item.images && item.images.length > 0
      ? `<img src="${item.images[0]}" alt="${this.esc(item.name)}" loading="lazy">`
      : `<span class="item-card-placeholder">${item.categoryId === 'locomotives' ? '🚂' : '🚃'}</span>`;
    const subcatName = this.getSubcategoryName(item.subcategoryId);
    return `
      <div class="item-card" onclick="app.showDetail('${item.id}')">
        <div class="item-card-image">
          ${img}
          ${subcatName ? `<span class="item-card-badge">${subcatName}</span>` : ''}
          ${item.wishlist ? '<span class="item-card-wishlist-badge">⭐</span>' : ''}
          ${item.runningNumber ? `<span class="item-card-number">${this.esc(item.runningNumber)}</span>` : ''}
        </div>
        <div class="item-card-body">
          <div class="item-card-name">${this.esc(item.name)}</div>
          <div class="item-card-manufacturer">
            <span>${this.esc(item.manufacturer || 'Unknown manufacturer')}</span>
            ${item.runningNumber ? `<span class="item-card-number-chip">№ ${this.esc(item.runningNumber)}</span>` : ''}
          </div>
          <div class="item-card-meta">
            <span class="item-card-price">${item.purchasePrice ? this.settings.currency + item.purchasePrice.toFixed(2) : '—'}</span>
            ${this.renderValuationBadge(item)}
            ${!item.valuation && item.currentValue ? `<span class="item-card-value">Val: ${this.settings.currency}${item.currentValue.toFixed(2)}</span>` : ''}
          </div>
          ${item.tags && item.tags.length > 0 ? `
            <div class="item-card-tags">
              ${item.tags.slice(0, 4).map(t => `
                <span class="item-card-tag" onclick="event.stopPropagation();app.showCatalog({type:'tag',value:'${this.esc(t)}'})">#${this.esc(t)}</span>
              `).join('')}
              ${item.tags.length > 4 ? `<span class="item-card-tag-more">+${item.tags.length - 4}</span>` : ''}
            </div>
          ` : ''}
          ${this.daysSinceService(item.lastServiceDate) > (this.settings.serviceIntervalDays || 365) ? '<div class="item-card-service-warn">🔧 Service overdue</div>' : ''}
        </div>
      </div>
    `;
  },

  renderEmpty() {
    const searchTips = [
      'Hmm, nothing on this line \u2014 try adjusting your search terms!',
      'No trains at this platform. Try a different search?',
      'The signal\u2019s at red \u2014 no results found. Try different words!'
    ];
    const emptyTips = [
      'The engine shed\u2019s looking a bit empty! Time to bring in some stock.',
      'No locos on shed yet \u2014 every great collection starts with one.',
      'A quiet day at the depot. Why not add your first model?'
    ];
    const tips = this.currentFilter?.type === 'search' ? searchTips : emptyTips;
    const tip = tips[Math.floor(Math.random() * tips.length)];

    return `
      <div class="empty-state">
        <div class="empty-mascot">${this.mascotMedium()}</div>
        <div class="empty-title">${this.currentFilter?.type === 'search' ? 'End of the line!' : 'All quiet on shed'}</div>
        <div class="empty-text">${tip}</div>
        ${this.currentFilter?.type !== 'search' ? '<button class="btn btn-primary" onclick="app.openAddModal()">➕ Add First Item</button>' : ''}
      </div>
    `;
  },

  // --- Detail View ---
  renderDetail() {
    const item = this.detailItem;
    if (!item) return '<div class="main-content"><p>Item not found</p></div>';

    this.currentLightboxIndex = 0;
    const mainImg = item.images && item.images.length > 0
      ? `<img src="${item.images[0]}" id="detailMainImg" alt="${this.esc(item.name)}" onclick="app.openLightbox(0)" style="cursor:pointer;">`
      : `<span class="placeholder-icon">${item.categoryId === 'locomotives' ? '🚂' : '🚃'}</span>`;

    const catName = this.getCategoryName(item.categoryId);
    const subcatName = this.getSubcategoryName(item.subcategoryId);

    return `
      <div class="main-content">
        <div class="item-detail">
          <div class="detail-header">
            <a class="detail-back" onclick="app.showCatalog(app.currentFilter)">← Back to catalog</a>
            <div class="detail-actions">
              <button class="btn btn-outline btn-sm" onclick="app.showQRForItem('${item.id}')">📱 QR</button>
              <button class="btn btn-outline btn-sm" onclick="app.openEditModal('${item.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="app.confirmDelete('${item.id}')">🗑️ Delete</button>
            </div>
          </div>
          <div class="detail-body">
            <div class="detail-images">
              <div class="detail-main-image">${mainImg}</div>
              ${item.images && item.images.length > 1 ? `
                <div class="detail-thumbnails">
                  ${item.images.map((img, i) => `
                    <div class="detail-thumb ${i === 0 ? 'active' : ''}" onclick="app.switchImage('${img}', this)" ondblclick="app.openLightbox(${i})">
                      <img src="${img}" alt="Photo ${i+1}" style="cursor:pointer;">
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div class="detail-info">
              <h1 class="detail-name">${this.esc(item.name)}</h1>
              ${subcatName ? `<span class="detail-category-badge">${catName} &mdash; ${subcatName}</span>` : ''}

              ${item.wishlist ? '<div class="detail-wishlist-badge">⭐ Wishlist Item</div>' : ''}
              ${this.renderWishlistSpotted(item)}

              ${item.runningNumber || item.productCode ? `
                <div style="margin: 12px 0;">
                  ${item.runningNumber ? `<div><span style="color: var(--color-text-muted); font-size: 0.85rem;">Running Number:</span> <strong>${this.esc(item.runningNumber)}</strong></div>` : ''}
                  ${item.productCode ? `<div><span style="color: var(--color-text-muted); font-size: 0.85rem;">Product Code:</span> <strong>${this.esc(item.productCode)}</strong></div>` : ''}
                </div>
              ` : ''}

              ${item.condition || item.dccStatus ? `
                <div style="margin: 12px 0;">
                  ${item.condition ? `<span class="condition-badge condition-${item.condition}">${item.condition.replace('-', ' / ')}</span>` : ''}
                  ${item.dccStatus ? `<span class="dcc-badge dcc-${item.dccStatus}">${item.dccStatus.replace('-', ' ')}</span>` : ''}
                </div>
              ` : ''}

              <div class="detail-fields">
                <div class="detail-field">
                  <span class="detail-field-label">Purchase Price</span>
                  <span class="detail-field-value price">${item.purchasePrice ? this.settings.currency + item.purchasePrice.toFixed(2) : '—'}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Current Value</span>
                  <span class="detail-field-value ${item.currentValue && item.purchasePrice ? (item.currentValue > item.purchasePrice ? 'value-up' : item.currentValue < item.purchasePrice ? 'value-down' : '') : ''}">${item.currentValue ? this.settings.currency + item.currentValue.toFixed(2) : '—'}</span>
                </div>
              </div>

              ${this.renderValuationDetail(item)}

              <div class="detail-fields">
                <div class="detail-field">
                  <span class="detail-field-label">Manufacturer</span>
                  <span class="detail-field-value">${this.esc(item.manufacturer || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Livery</span>
                  <span class="detail-field-value">${this.esc(item.livery || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Place of Purchase</span>
                  <span class="detail-field-value">${this.esc(item.placeOfPurchase || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Purchase Date</span>
                  <span class="detail-field-value">${item.purchaseDate ? this.formatDate(item.purchaseDate) : '—'}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Storage Location</span>
                  <span class="detail-field-value">${this.esc(item.storageLocation || '—')}</span>
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Last Service Date</span>
                  <span class="detail-field-value">${item.lastServiceDate ? this.formatDate(item.lastServiceDate) : '—'}</span>
                  ${this.serviceStatusBadge(item.lastServiceDate)}
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Added to Catalog</span>
                  <span class="detail-field-value">${this.formatDate(item.createdAt)}</span>
                </div>
              </div>

              ${item.tags && item.tags.length > 0 ? `
                <div class="detail-section">
                  <div class="detail-section-title">Tags</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${item.tags.map(tag => `
                      <span class="tag-chip tag-chip-readonly" onclick="app.showCatalog({ type: 'tag', value: '${this.esc(tag)}' })">
                        ${this.esc(tag)}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${item.goesWellWith ? `
                <div class="detail-section">
                  <div class="detail-section-title">Goes Well With</div>
                  <div class="detail-section-text">${this.esc(item.goesWellWith)}</div>
                </div>
              ` : ''}

              ${item.historicalBackground ? `
                <div class="detail-section">
                  <div class="detail-section-title">Historical Background</div>
                  <div class="detail-section-text">${this.esc(item.historicalBackground)}</div>
                </div>
              ` : ''}

              ${this.renderServiceLog(item)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // --- Backup & Settings View ---
  renderBackupView() {
    const s = this.settings;
    return `
      <div class="main-content" style="max-width:700px; margin:0 auto;">
        <div class="backup-container">
          <h2>Settings</h2>
          <p>Customise your catalogue app — change the name, tagline, and preferences.</p>

          <div style="display:grid; gap:24px; margin-bottom:40px;">
            <div class="backup-panel">
              <h3>⚙️ App Settings</h3>
              <div class="settings-form">
                <div class="form-group">
                  <label class="form-label">App Name</label>
                  <input type="text" class="form-input" id="settingsAppName" value="${this.esc(s.appName)}" placeholder="Train Depot">
                </div>
                <div class="form-group">
                  <label class="form-label">Tagline</label>
                  <input type="text" class="form-input" id="settingsTagline" value="${this.esc(s.tagline)}" placeholder="Your personal collection, beautifully organised">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Currency Symbol</label>
                    <input type="text" class="form-input" id="settingsCurrency" value="${this.esc(s.currency)}" placeholder="£" maxlength="3" style="width:80px">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Service Interval (days)</label>
                    <input type="number" class="form-input" id="settingsServiceDays" value="${s.serviceIntervalDays || 365}" min="1" style="width:120px">
                  </div>
                </div>
                <button class="btn btn-primary" onclick="app.saveSettings()">💾 Save Settings</button>
              </div>
            </div>

            <div class="backup-panel">
              <h3>🔒 Password Protection</h3>
              <p>Protect your catalogue with a password. Leave empty to remove password protection.</p>
              <div class="settings-form" id="passwordSection">
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <input type="password" class="form-input" id="settingsNewPassword" placeholder="Enter new password (4+ chars)">
                </div>
                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <input type="password" class="form-input" id="settingsConfirmPassword" placeholder="Confirm new password">
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-primary" onclick="app.changePassword()">🔐 Set Password</button>
                  <button class="btn btn-outline" onclick="app.removePasswordUI()">🔓 Remove Password</button>
                </div>
              </div>
            </div>
          </div>

          <div id="shareSection"></div>

          <div style="display:grid; gap:24px; margin-bottom:40px;">
            <div class="backup-panel">
              <h3>📊 eBay Valuation</h3>
              <p>Connect your eBay developer account to automatically look up market values for your trains based on real sold prices.</p>
              <div class="settings-form">
                <div class="form-group">
                  <label class="form-label">eBay App ID (Client ID)</label>
                  <input type="password" class="form-input" id="settingsEbayAppId" placeholder="${s.ebayAppIdMasked || 'Enter your eBay App ID...'}" autocomplete="off">
                  ${s.ebayConfigured ? '<span style="color:var(--color-success);font-size:0.8rem;">✓ Configured</span>' : '<span style="color:var(--color-text-muted);font-size:0.8rem;">Not configured</span>'}
                </div>
                <div class="form-group">
                  <label class="form-label">eBay Cert ID (Client Secret)</label>
                  <input type="password" class="form-input" id="settingsEbayCertId" placeholder="${s.ebayCertIdMasked || 'Enter your eBay Cert ID...'}" autocomplete="off">
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" style="display:flex;align-items:center;gap:8px;">
                      <input type="checkbox" id="settingsValuationAuto" ${s.valuationAutoRefresh ? 'checked' : ''}>
                      Auto-refresh valuations
                    </label>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Refresh every (days)</label>
                    <input type="number" class="form-input" id="settingsValuationDays" value="${s.valuationRefreshDays || 7}" min="1" max="90" style="width:80px">
                  </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button class="btn btn-primary" onclick="app.saveEbaySettings()">💾 Save eBay Settings</button>
                  <button class="btn btn-outline" onclick="app.testEbayConnection()">🔌 Test Connection</button>
                  ${s.ebayConfigured ? '<button class="btn btn-outline" onclick="app.refreshAllValuations()">🔄 Refresh All Values</button>' : ''}
                </div>
                <div id="ebayTestResult" style="margin-top:8px;"></div>
                <p style="font-size:0.8rem;color:var(--color-text-muted);margin-top:12px;">
                  Get free eBay API credentials at <a href="https://developer.ebay.com/" target="_blank" rel="noopener" style="color:var(--color-accent);">developer.ebay.com</a> —
                  create an application and copy your Production App ID and Cert ID.
                </p>
              </div>
            </div>
          </div>

          <h2>Collection Tools</h2>
          <div style="display:grid; gap:16px; margin-bottom:40px;">
            <div class="backup-panel">
              <h3>📊 Collection Timeline</h3>
              <p>See when you added each item and watch your collection grow over time.</p>
              <button class="btn btn-outline" onclick="app.showTimeline()">View Timeline</button>
            </div>

            <div class="backup-panel">
              <h3>🏥 Data Health Check</h3>
              <p>Scan your collection for missing fields, incomplete records, and items needing attention.</p>
              <button class="btn btn-outline" onclick="app.showHealthCheck()">Run Health Check</button>
            </div>

            <div class="backup-panel">
              <h3>🖨️ Print Catalogue</h3>
              <p>Generate a print-friendly view of your entire collection — perfect for exhibitions or reference.</p>
              <button class="btn btn-outline" onclick="app.showPrintView()">Print-Friendly View</button>
            </div>

            <div class="backup-panel">
              <h3>📋 Insurance / Valuation Report</h3>
              <p>Generate a detailed report of your collection with values — useful for insurance claims.</p>
              <button class="btn btn-outline" onclick="app.generateInsuranceReport()">Generate Report</button>
            </div>

            <div class="backup-panel">
              <h3>🗑️ Recycle Bin</h3>
              <p>Deleted items stay here for 30 days before being permanently removed. You can restore them any time.</p>
              <button class="btn btn-outline" onclick="app.showTrash();setTimeout(()=>app.loadTrashItems(),100);">View Bin</button>
            </div>
          </div>

          <h2>Backup & Export</h2>
          <p>Protect your collection data with regular backups. Export your entire catalogue or restore from a previous backup.</p>

          <div style="display:grid; gap:24px;">
            <div class="backup-panel">
              <h3>📤 Export Catalogue</h3>
              <p>Download your entire collection as a JSON file. This includes all item data (images are stored separately on the server).</p>
              <button class="btn btn-primary" onclick="app.exportData()">Download Backup</button>
            </div>

            <div class="backup-panel">
              <h3>📥 Import / Restore</h3>
              <p>Restore from a previously exported backup file. <strong>Warning:</strong> this will replace all current data.</p>
              <input type="file" id="importFile" accept=".json" style="display:none" onchange="app.importData(event)">
              <button class="btn btn-outline" onclick="document.getElementById('importFile').click()">Choose Backup File</button>
            </div>

            <div class="backup-panel">
              <h3>📊 Collection Summary</h3>
              <p>Export a summary of your collection as a CSV spreadsheet.</p>
              <button class="btn btn-outline" onclick="app.exportCSV()">Download CSV</button>
            </div>

            <div class="backup-panel">
              <h3>📥 Bulk CSV Import</h3>
              <p>Import multiple items from a CSV file. Expected columns: Name, Manufacturer, Livery, Purchase Price, Current Value, Place of Purchase, Category, Subcategory, etc.</p>
              <input type="file" id="csvImportFile" accept=".csv" style="display:none" onchange="app.importCSV(event)">
              <button class="btn btn-outline" onclick="document.getElementById('csvImportFile').click()">Choose CSV File</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async saveSettings() {
    const appName = document.getElementById('settingsAppName').value.trim();
    const tagline = document.getElementById('settingsTagline').value.trim();
    const currency = document.getElementById('settingsCurrency').value.trim();
    const serviceIntervalDays = parseInt(document.getElementById('settingsServiceDays').value) || 365;

    if (!appName) { this.toast('App name cannot be empty', 'error'); return; }

    try {
      this.settings = await this.api('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, tagline, currency, serviceIntervalDays })
      });
      this.applyAppName();
      this.toast('Settings saved \u2014 running like clockwork!');
    } catch(e) { /* toast shown */ }
  },

  // ==================== eBay Valuation ====================

  async saveEbaySettings() {
    const appId = document.getElementById('settingsEbayAppId').value.trim();
    const certId = document.getElementById('settingsEbayCertId').value.trim();
    const autoRefresh = document.getElementById('settingsValuationAuto').checked;
    const refreshDays = parseInt(document.getElementById('settingsValuationDays').value) || 7;

    const payload = { valuationAutoRefresh: autoRefresh, valuationRefreshDays: refreshDays };
    // Only send credentials if user actually typed new ones (not just the placeholder)
    if (appId) payload.ebayAppId = appId;
    if (certId) payload.ebayCertId = certId;

    try {
      await this.api('/api/settings/ebay', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Refresh settings
      this.settings = await this.api('/api/settings');
      this.toast('eBay settings saved!');
      this.showBackup(); // re-render to show updated state
    } catch(e) { /* toast shown by api() */ }
  },

  async testEbayConnection() {
    const resultEl = document.getElementById('ebayTestResult');
    resultEl.innerHTML = '<span style="color:var(--color-text-muted);">Testing connection...</span>';

    try {
      const result = await this.api('/api/settings/ebay/test', { method: 'POST' });
      if (result.success) {
        resultEl.innerHTML = `<span style="color:var(--color-success);">✓ ${this.esc(result.message)}</span>`;
      } else {
        resultEl.innerHTML = `<span style="color:var(--color-danger);">✗ ${this.esc(result.message)}</span>`;
      }
    } catch(e) {
      resultEl.innerHTML = `<span style="color:var(--color-danger);">✗ Connection test failed</span>`;
    }
  },

  async valuateItem(itemId) {
    this.toast('Checking eBay prices...', 'info');
    try {
      const result = await this.api(`/api/items/${itemId}/valuate`, { method: 'POST' });
      if (result.valuation && result.valuation.found) {
        this.toast(`Found ${result.valuation.listingsAnalysed} listings — market value: ${this.settings.currency}${result.valuation.marketValue.toFixed(2)}`);
      } else {
        this.toast('No matching listings found on eBay. Try adding a product code for better results.', 'warning');
      }
      // Refresh the detail view if we're on it
      if (this.currentView === 'detail' && this.detailItem && this.detailItem.id === itemId) {
        this.detailItem = result.item;
        document.getElementById('mainContent').innerHTML = this.renderDetail();
      }
      // Refresh items list
      await this.loadItems();
    } catch(e) { /* toast shown by api() */ }
  },

  async refreshAllValuations() {
    this.toast('Refreshing all valuations — this may take a minute...', 'info');
    try {
      const result = await this.api('/api/valuations/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staleOnly: false })
      });
      this.toast(`${result.message}${result.remaining > 0 ? ` (${result.remaining} remaining — run again to continue)` : ''}`);
      await this.loadItems();
    } catch(e) { /* toast shown */ }
  },

  renderValuationBadge(item) {
    if (!item.valuation || !item.valuation.found || !item.valuation.marketValue) return '';
    const market = item.valuation.marketValue;
    const paid = item.purchasePrice || 0;
    if (!paid) return `<span class="valuation-badge valuation-neutral" title="Market value">≈ ${this.settings.currency}${market.toFixed(0)}</span>`;
    const diff = market - paid;
    const pct = Math.round((diff / paid) * 100);
    if (Math.abs(diff) < 1) return `<span class="valuation-badge valuation-neutral" title="Market value matches purchase price">≈ Fair price</span>`;
    if (diff > 0) {
      return `<span class="valuation-badge valuation-up" title="Worth ${this.settings.currency}${diff.toFixed(2)} more than you paid (${pct}%)">↑ +${this.settings.currency}${diff.toFixed(0)} (${pct}%)</span>`;
    } else {
      return `<span class="valuation-badge valuation-down" title="Worth ${this.settings.currency}${Math.abs(diff).toFixed(2)} less than you paid (${pct}%)">↓ -${this.settings.currency}${Math.abs(diff).toFixed(0)} (${pct}%)</span>`;
    }
  },

  renderValuationDetail(item) {
    if (!item.valuation) {
      return `
        <div class="valuation-panel">
          <div class="valuation-panel-header">
            <span>📊 Market Valuation</span>
            <button class="btn btn-outline btn-sm" onclick="app.valuateItem('${item.id}')">Check eBay Value</button>
          </div>
          <p style="color:var(--color-text-muted);font-size:0.9rem;">No valuation data yet. Click "Check eBay Value" to look up current market prices.</p>
        </div>
      `;
    }

    const v = item.valuation;
    const age = v.valuationDate ? this.timeAgo(v.valuationDate) : 'unknown';

    if (!v.found) {
      return `
        <div class="valuation-panel">
          <div class="valuation-panel-header">
            <span>📊 Market Valuation</span>
            <button class="btn btn-outline btn-sm" onclick="app.valuateItem('${item.id}')">🔄 Retry</button>
          </div>
          <p style="color:var(--color-text-muted);font-size:0.9rem;">${this.esc(v.message || v.error || 'No listings found')} — checked ${age}</p>
        </div>
      `;
    }

    const paid = item.purchasePrice || 0;
    const market = v.marketValue || 0;
    const diff = market - paid;
    const diffClass = diff > 0 ? 'valuation-up' : diff < 0 ? 'valuation-down' : 'valuation-neutral';

    return `
      <div class="valuation-panel">
        <div class="valuation-panel-header">
          <span>📊 Market Valuation</span>
          <button class="btn btn-outline btn-sm" onclick="app.valuateItem('${item.id}')">🔄 Refresh</button>
        </div>
        <div class="valuation-stats">
          <div class="valuation-stat">
            <span class="valuation-stat-label">Market Value</span>
            <span class="valuation-stat-value">${this.settings.currency}${market.toFixed(2)}</span>
          </div>
          ${paid > 0 ? `
          <div class="valuation-stat">
            <span class="valuation-stat-label">You Paid</span>
            <span class="valuation-stat-value">${this.settings.currency}${paid.toFixed(2)}</span>
          </div>
          <div class="valuation-stat">
            <span class="valuation-stat-label">${diff >= 0 ? 'Gain' : 'Loss'}</span>
            <span class="valuation-stat-value ${diffClass}">${diff >= 0 ? '+' : ''}${this.settings.currency}${diff.toFixed(2)}</span>
          </div>
          ` : ''}
        </div>
        ${v.priceRange ? `
        <div style="font-size:0.85rem;color:var(--color-text-muted);margin-top:8px;">
          Range: ${this.settings.currency}${v.priceRange.low.toFixed(2)} – ${this.settings.currency}${v.priceRange.high.toFixed(2)}
          &nbsp;|&nbsp; ${v.listingsAnalysed} listing${v.listingsAnalysed !== 1 ? 's' : ''} analysed
          &nbsp;|&nbsp; Confidence: <strong>${v.confidence}</strong>
        </div>
        ` : ''}
        ${v.conditionAdjustment ? `<div style="font-size:0.8rem;color:var(--color-text-muted);margin-top:4px;">${this.esc(v.conditionAdjustment)}</div>` : ''}
        <div style="font-size:0.75rem;color:var(--color-text-muted);margin-top:8px;">Last checked: ${age}</div>
        ${v.listings && v.listings.length > 0 ? `
        <details style="margin-top:12px;">
          <summary style="cursor:pointer;font-size:0.85rem;color:var(--color-accent);font-weight:600;">View eBay Listings</summary>
          <div class="valuation-listings">
            ${v.listings.map(l => `
              <div class="valuation-listing">
                <div class="valuation-listing-title">${this.esc(l.title)}</div>
                <div class="valuation-listing-price">${this.settings.currency}${l.price.toFixed(2)}</div>
                ${l.url ? `<a href="${l.url}" target="_blank" rel="noopener" class="valuation-listing-link">View on eBay →</a>` : ''}
              </div>
            `).join('')}
          </div>
        </details>
        ` : ''}
      </div>
    `;
  },

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

  async changePassword() {
    const newPass = document.getElementById('settingsNewPassword').value;
    const confirm = document.getElementById('settingsConfirmPassword').value;
    if (!newPass || newPass.length < 4) { this.toast('Password must be at least 4 characters', 'error'); return; }
    if (newPass !== confirm) { this.toast('Passwords do not match', 'error'); return; }
    try {
      await this.api('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPass })
      });
      this.toast('Password updated!');
      document.getElementById('settingsNewPassword').value = '';
      document.getElementById('settingsConfirmPassword').value = '';
      // Show logout button
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.style.display = '';
    } catch(e) { /* toast shown */ }
  },

  async removePasswordUI() {
    const currentPass = await this.showInputModal({
      title: 'Remove Password',
      label: 'Current Password',
      placeholder: 'Enter your current password to confirm',
      icon: '🔓',
      hint: 'This will make the app open to everyone on your network.'
    });
    if (!currentPass) return;
    try {
      await this.api('/api/auth/remove-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPass })
      });
      this.toast('Password removed — app is now open access');
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.style.display = 'none';
    } catch(e) { /* toast shown */ }
  },

  // ==================== Modal / Forms ====================

  async openAddModal() {
    this.editingItem = null;
    this.selectedRefModel = null;
    this.pendingImages = [];
    this.existingImages = [];
    document.getElementById('modalTitle').textContent = 'Add New Item';
    this.populateCategorySelects();
    this.clearForm();
    // Set smart defaults
    document.getElementById('formCondition').value = 'excellent-boxed';
    document.getElementById('formDccStatus').value = 'analogue';
    // Initialize empty tags
    this.renderFormTags([]);
    // Reset wishlist fields
    const wfg = document.getElementById('wishlistFieldsGroup');
    if (wfg) wfg.style.display = 'none';
    // Reset reference notices
    const notice = document.getElementById('refImageNotice');
    if (notice) notice.style.display = 'none';
    const chips = document.getElementById('goesWellSuggestions');
    if (chips) { chips.style.display = 'none'; chips.innerHTML = ''; }
    document.getElementById('itemModal').classList.add('active');
  },

  async openEditModal(id) {
    const item = await this.api(`/api/items/${id}`);
    this.editingItem = item;
    this.pendingImages = [];
    this.existingImages = [...(item.images || [])];

    document.getElementById('modalTitle').textContent = 'Edit Item';
    this.populateCategorySelects(item.categoryId);

    document.getElementById('formName').value = item.name || '';
    document.getElementById('formCategory').value = item.categoryId || '';
    this.updateSubcategories();
    document.getElementById('formSubcategory').value = item.subcategoryId || '';
    document.getElementById('formRunningNumber').value = item.runningNumber || '';
    document.getElementById('formProductCode').value = item.productCode || '';
    document.getElementById('formCondition').value = item.condition || '';
    document.getElementById('formDccStatus').value = item.dccStatus || '';
    document.getElementById('formManufacturer').value = item.manufacturer || '';
    document.getElementById('formLivery').value = item.livery || '';
    document.getElementById('formPrice').value = item.purchasePrice || '';
    document.getElementById('formCurrentValue').value = item.currentValue || '';
    document.getElementById('formPlace').value = item.placeOfPurchase || '';
    document.getElementById('formPurchaseDate').value = item.purchaseDate || '';
    document.getElementById('formStorageLocation').value = item.storageLocation || '';
    document.getElementById('formServiceDate').value = item.lastServiceDate || '';
    document.getElementById('formGoesWellWith').value = item.goesWellWith || '';
    document.getElementById('formHistory').value = item.historicalBackground || '';
    document.getElementById('formWishlist').checked = item.wishlist || false;
    // Populate wishlist spotted fields
    const wnEl = document.getElementById('formWishlistNotes');
    const wsaEl = document.getElementById('formWishlistSpottedAt');
    const wspEl = document.getElementById('formWishlistSpottedPrice');
    if (wnEl) wnEl.value = item.wishlistNotes || '';
    if (wsaEl) wsaEl.value = item.wishlistSpottedAt || '';
    if (wspEl) wspEl.value = item.wishlistSpottedPrice || '';
    this.toggleWishlistFields();

    // Render tags
    this.renderFormTags(item.tags || []);

    this.renderUploadPreviews();
    document.getElementById('itemModal').classList.add('active');
  },

  closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    this.editingItem = null;
    this.pendingImages = [];
    this.existingImages = [];
  },

  clearForm() {
    document.getElementById('itemForm').reset();
    document.getElementById('uploadPreviews').innerHTML = '';
  },

  populateCategorySelects(selectedCat = '') {
    const catSelect = document.getElementById('formCategory');
    catSelect.innerHTML = '<option value="">Select category...</option>';
    this.categories.forEach(cat => {
      catSelect.innerHTML += `<option value="${cat.id}" ${cat.id === selectedCat ? 'selected' : ''}>${cat.name}</option>`;
    });
    if (selectedCat) this.updateSubcategories();
  },

  updateSubcategories() {
    const catId = document.getElementById('formCategory').value;
    const subSelect = document.getElementById('formSubcategory');
    subSelect.innerHTML = '<option value="">Select subcategory...</option>';
    const cat = this.categories.find(c => c.id === catId);
    if (!cat) return;
    cat.subcategories.forEach(sub => {
      subSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
    });
    // Only attach the listener once using a flag
    if (!subSelect._chipsListenerAttached) {
      subSelect.addEventListener('change', () => {
        const subId = subSelect.value;
        if (subId) this.showGoesWellWithChips(subId);
      });
      subSelect._chipsListenerAttached = true;
    }
  },

  // ==================== Image Upload ====================

  handleFileSelect(event) {
    const files = Array.from(event.target.files);
    this.addFiles(files);
    event.target.value = '';
  },

  handleDrop(event) {
    event.preventDefault();
    event.target.closest('.upload-area').classList.remove('dragover');
    const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    this.addFiles(files);
  },

  addFiles(files) {
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        this.toast(`${file.name} is too large (max 10MB)`, 'error');
        continue;
      }
      this.pendingImages.push(file);
    }
    this.renderUploadPreviews();
  },

  renderUploadPreviews() {
    const container = document.getElementById('uploadPreviews');
    container.innerHTML = '';

    this.existingImages.forEach((url, i) => {
      const div = document.createElement('div');
      div.className = 'upload-preview';
      div.innerHTML = `
        <img src="${url}" alt="Photo">
        <button class="upload-preview-remove" onclick="app.removeExistingImage(${i})">&times;</button>
      `;
      container.appendChild(div);
    });

    this.pendingImages.forEach((file, i) => {
      const div = document.createElement('div');
      div.className = 'upload-preview';
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(file);
      div.appendChild(img);

      const btn = document.createElement('button');
      btn.className = 'upload-preview-remove';
      btn.innerHTML = '&times;';
      btn.onclick = () => this.removePendingImage(i);
      div.appendChild(btn);

      container.appendChild(div);
    });

    // Initialize drag-drop reordering
    setTimeout(() => this.initDragDrop(), 50);
  },

  removePendingImage(index) {
    this.pendingImages.splice(index, 1);
    this.renderUploadPreviews();
  },

  removeExistingImage(index) {
    this.existingImages.splice(index, 1);
    this.renderUploadPreviews();
  },

  async uploadImages() {
    if (this.pendingImages.length === 0) return [];
    const formData = new FormData();
    this.pendingImages.forEach(file => formData.append('photos', file));
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.files || [];
  },

  // ==================== Save Item ====================

  async saveItem(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const categoryId = document.getElementById('formCategory').value;
    const subcategoryId = document.getElementById('formSubcategory').value;

    if (!name) { this.toast('Name is required', 'error'); return; }
    if (!categoryId) { this.toast('Please select a category', 'error'); return; }
    if (!subcategoryId) { this.toast('Please select a subcategory', 'error'); return; }

    try {
      const newImageUrls = await this.uploadImages();
      const allImages = [...this.existingImages, ...newImageUrls];

      // Get tags from the form
      const tags = this.getFormTags();

      const itemData = {
        name,
        categoryId,
        subcategoryId,
        runningNumber: document.getElementById('formRunningNumber').value.trim(),
        productCode: document.getElementById('formProductCode').value.trim(),
        condition: document.getElementById('formCondition').value,
        dccStatus: document.getElementById('formDccStatus').value,
        manufacturer: document.getElementById('formManufacturer').value.trim(),
        livery: document.getElementById('formLivery').value.trim(),
        purchasePrice: document.getElementById('formPrice').value || 0,
        currentValue: document.getElementById('formCurrentValue').value || 0,
        placeOfPurchase: document.getElementById('formPlace').value.trim(),
        purchaseDate: document.getElementById('formPurchaseDate').value,
        storageLocation: document.getElementById('formStorageLocation').value.trim(),
        lastServiceDate: document.getElementById('formServiceDate').value,
        goesWellWith: document.getElementById('formGoesWellWith').value.trim(),
        historicalBackground: document.getElementById('formHistory').value.trim(),
        wishlist: document.getElementById('formWishlist').checked,
        wishlistNotes: document.getElementById('formWishlistNotes')?.value.trim() || '',
        wishlistSpottedPrice: document.getElementById('formWishlistSpottedPrice')?.value || 0,
        wishlistSpottedAt: document.getElementById('formWishlistSpottedAt')?.value.trim() || '',
        tags: tags,
        images: allImages
      };

      if (this.editingItem) {
        await this.api(`/api/items/${this.editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        this.toast('All polished up \u2014 item updated!');
      } else {
        await this.api('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        this.toast('Welcome to the shed \u2014 new item added!');
      }

      this.closeModal();
      await this.loadAllItems(); // refresh for suggest
      await this.loadStats();

      if (this.currentView === 'detail' && this.editingItem) {
        this.showDetail(this.editingItem.id);
      } else {
        this.showCatalog(this.currentFilter);
      }
    } catch (e) { /* toast already shown */ }
  },

  // ==================== Delete ====================

  async confirmDelete(id) {
    const item = this.detailItem || this.items.find(i => i.id === id);
    const name = item ? item.name : 'this item';
    const ok = await this.showConfirmModal({
      title: 'Send to the bin?',
      message: `<strong>${this.esc(name)}</strong> will be moved to the recycle bin. You can restore it within 30 days.`,
      confirmText: 'Move to bin',
      confirmClass: 'btn-outline',
      icon: '🗑️'
    });
    if (ok) this.deleteItem(id);
  },

  async deleteItem(id) {
    try {
      await this.api(`/api/items/${id}`, { method: 'DELETE' });
      this.toast('Moved to the bin \u2014 you can restore it from Settings for 30 days.');
      await this.loadAllItems();
      await this.loadStats();
      this.showCatalog(this.currentFilter);
    } catch (e) { /* toast shown */ }
  },

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

  // ==================== Image Viewer ====================

  switchImage(src, thumbEl) {
    const mainImg = document.getElementById('detailMainImg');
    if (mainImg) mainImg.src = src;
    document.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
    if (thumbEl) thumbEl.classList.add('active');
  },

  openLightbox(imageIndex) {
    const item = this.detailItem;
    if (!item || !item.images || item.images.length === 0) return;
    this.currentLightboxIndex = imageIndex;
    this.renderLightbox();
  },

  renderLightbox() {
    const item = this.detailItem;
    if (!item || !item.images || item.images.length === 0) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay show';
    overlay.id = 'lightboxOverlay';
    overlay.onclick = (e) => {
      if (e.target === overlay) this.closeLightbox();
    };

    const img = item.images[this.currentLightboxIndex];
    const showPrev = item.images.length > 1 && this.currentLightboxIndex > 0;
    const showNext = item.images.length > 1 && this.currentLightboxIndex < item.images.length - 1;

    overlay.innerHTML = `
      <div class="lightbox-container">
        <img src="${img}" alt="Photo" class="lightbox-image">
        <button class="lightbox-close" onclick="app.closeLightbox()">&times;</button>
        ${showPrev ? '<button class="lightbox-nav lightbox-prev" onclick="app.prevLightboxImage()">&#10094;</button>' : ''}
        ${showNext ? '<button class="lightbox-nav lightbox-next" onclick="app.nextLightboxImage()">&#10095;</button>' : ''}
        <div class="lightbox-counter">${this.currentLightboxIndex + 1} / ${item.images.length}</div>
      </div>
    `;

    const existing = document.getElementById('lightboxOverlay');
    if (existing) existing.remove();
    document.body.appendChild(overlay);

    // Add keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft' && showPrev) this.prevLightboxImage();
      if (e.key === 'ArrowRight' && showNext) this.nextLightboxImage();
    };
    overlay._keyHandler = handleKeydown;
    document.addEventListener('keydown', handleKeydown);
  },

  closeLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    if (overlay) {
      if (overlay._keyHandler) {
        document.removeEventListener('keydown', overlay._keyHandler);
      }
      overlay.remove();
    }
  },

  prevLightboxImage() {
    if (this.currentLightboxIndex > 0) {
      this.currentLightboxIndex--;
      this.renderLightbox();
    }
  },

  nextLightboxImage() {
    const item = this.detailItem;
    if (item && item.images && this.currentLightboxIndex < item.images.length - 1) {
      this.currentLightboxIndex++;
      this.renderLightbox();
    }
  },

  // ==================== Tags Management ====================

  renderFormTags(tags) {
    const container = document.getElementById('formTagsContainer');
    if (!container) return;
    container.innerHTML = tags.map(tag => `
      <span class="tag-chip">
        ${this.esc(tag)}
        <span class="tag-chip-remove" onclick="app.removeFormTag('${this.esc(tag)}')">×</span>
      </span>
    `).join('');
  },

  getFormTags() {
    const container = document.getElementById('formTagsContainer');
    if (!container) return [];
    const chips = container.querySelectorAll('.tag-chip');
    return Array.from(chips).map(chip => {
      const text = chip.textContent.trim();
      return text.replace(/×$/, '').trim();
    });
  },

  removeFormTag(tag) {
    const tags = this.getFormTags();
    const idx = tags.indexOf(tag);
    if (idx !== -1) {
      tags.splice(idx, 1);
      this.renderFormTags(tags);
    }
  },

  handleTagInput(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = document.getElementById('formTags');
      const tag = input.value.trim();
      if (!tag) return;

      const tags = this.getFormTags();
      if (!tags.includes(tag)) {
        tags.push(tag);
        this.renderFormTags(tags);
      }
      input.value = '';
    }
  },

  // ==================== Product Code Auto-Detect Manufacturer ====================

  toggleWishlistFields() {
    const isWishlist = document.getElementById('formWishlist').checked;
    const group = document.getElementById('wishlistFieldsGroup');
    if (group) group.style.display = isWishlist ? '' : 'none';
  },

  autoDetectManufacturer() {
    const productCode = document.getElementById('formProductCode').value.trim().toUpperCase();
    if (!productCode) return;

    let detected = '';
    if (productCode.startsWith('R')) detected = 'Hornby';
    else if (productCode.match(/^3[1238]-/)) detected = 'Bachmann';
    else if (productCode.startsWith('4S-')) detected = 'Dapol';
    else if (productCode.startsWith('OR76-')) detected = 'Oxford Rail';
    else if (productCode.startsWith('ACC')) detected = 'Accurascale';

    if (detected) {
      document.getElementById('formManufacturer').value = detected;
    }
  },

  // ==================== Service Log ====================

  renderServiceLog(item) {
    const formHtml = `
      <div class="service-log-form" id="serviceLogForm">
        <div style="margin-bottom: 8px;">
          <label style="display: block; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px;">Service Date</label>
          <input type="date" id="serviceLogDate" class="form-input" style="width: 100%; padding: 8px;">
        </div>
        <div style="margin-bottom: 8px;">
          <label style="display: block; font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 4px;">Notes</label>
          <textarea id="serviceLogNote" class="form-input" placeholder="What was serviced?" style="width: 100%; padding: 8px; resize: vertical; min-height: 60px;"></textarea>
        </div>
        <div class="service-log-buttons">
          <button class="btn btn-outline btn-sm" onclick="app.toggleServiceLogForm()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="app.addServiceLogEntry()">Save Entry</button>
        </div>
      </div>
    `;

    if (!item.serviceLog || item.serviceLog.length === 0) {
      return `
        <div class="service-log-section">
          <div class="service-log-title">Service Log</div>
          <p style="color: var(--color-text-muted); font-size: 0.95rem;">No service entries yet.</p>
          <button class="btn btn-outline btn-sm" onclick="app.toggleServiceLogForm()">+ Add Service Entry</button>
          ${formHtml}
        </div>
      `;
    }

    const sorted = [...item.serviceLog].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    return `
      <div class="service-log-section">
        <div class="service-log-title">Service Log</div>
        <div class="service-log-timeline">
          ${sorted.map(entry => `
            <div class="service-log-entry">
              <div class="service-log-date">${this.formatDate(entry.date)}</div>
              <div class="service-log-note">${this.esc(entry.note)}</div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-outline btn-sm" onclick="app.toggleServiceLogForm()" style="margin-top: 12px;">+ Add Service Entry</button>
        ${formHtml}
      </div>
    `;
  },

  toggleServiceLogForm() {
    const form = document.getElementById('serviceLogForm');
    if (form) {
      form.classList.toggle('show');
    }
  },

  async addServiceLogEntry() {
    const dateInput = document.getElementById('serviceLogDate');
    const noteInput = document.getElementById('serviceLogNote');
    const date = dateInput.value;
    const note = noteInput.value.trim();

    if (!date || !note) {
      this.toast('Please enter both date and note', 'error');
      return;
    }

    try {
      const item = await this.api(`/api/items/${this.detailItem.id}/service-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, note })
      });
      this.detailItem = item;
      this.showDetail(this.detailItem.id);
      this.toast('Service entry logged \u2014 keeping her running smoothly!');
    } catch (e) { /* toast shown */ }
  },

  // ==================== Dashboard ====================

  async showDashboard() {
    this.currentView = 'dashboard';
    this.updateNav();
    const main = document.getElementById('mainContent');
    main.innerHTML = '<div class="main-content" style="text-align: center; padding: 40px;"><p>Loading dashboard...</p></div>';

    try {
      const html = this.renderDashboard();
      main.innerHTML = html;
      this.drawDashboardCharts();
    } catch (e) {
      this.toast('Failed to load dashboard', 'error');
    }
  },

  renderDashboard() {
    const items = this.items;
    const stats = this.stats;

    const totalSpent = stats.totalSpent;
    const totalValue = stats.totalCurrentValue;
    const gain = totalValue - totalSpent;
    const gainPercent = totalSpent > 0 ? ((gain / totalSpent) * 100).toFixed(1) : 0;

    // Group by manufacturer
    const byManufacturer = {};
    items.forEach(item => {
      const mfg = item.manufacturer || 'Unknown';
      byManufacturer[mfg] = (byManufacturer[mfg] || 0) + 1;
    });

    // Group by condition
    const byCondition = {};
    items.forEach(item => {
      const cond = item.condition || 'Not specified';
      byCondition[cond] = (byCondition[cond] || 0) + 1;
    });

    // Group by DCC status
    const byDccStatus = {};
    items.forEach(item => {
      const dcc = item.dccStatus || 'Not specified';
      byDccStatus[dcc] = (byDccStatus[dcc] || 0) + 1;
    });

    // Items by month added
    const byMonth = {};
    items.forEach(item => {
      const date = new Date(item.createdAt);
      const month = date.toLocaleString('default', { year: 'numeric', month: 'short' });
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    // Top 5 valuable items
    const topItems = items
      .filter(i => i.currentValue > 0)
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);

    // eBay valuation stats
    const valuedItems = items.filter(i => i.valuation && i.valuation.found);
    const totalMarketValue = valuedItems.reduce((sum, i) => sum + (i.valuation.marketValue || 0), 0);
    const marketGain = totalMarketValue - totalSpent;
    const marketGainPct = totalSpent > 0 ? ((marketGain / totalSpent) * 100).toFixed(1) : 0;

    // Best deals (items where market value exceeds purchase price most)
    const bestDeals = items
      .filter(i => i.valuation && i.valuation.found && i.purchasePrice > 0)
      .map(i => ({ ...i, dealGain: i.valuation.marketValue - i.purchasePrice, dealPct: ((i.valuation.marketValue - i.purchasePrice) / i.purchasePrice * 100) }))
      .sort((a, b) => b.dealPct - a.dealPct)
      .slice(0, 5);

    return `
      <div class="dashboard-container">
        <h1 style="margin-bottom: 30px;">Collection Dashboard</h1>

        ${this.renderSpotlight()}

        <div class="dashboard-grid">
          <div class="dashboard-card">
            <div class="dashboard-card-title">Total Items</div>
            <div class="dashboard-card-value">${items.length}</div>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-title">Total Spent</div>
            <div class="dashboard-card-value">${this.settings.currency}${totalSpent.toFixed(2)}</div>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-title">Current Value</div>
            <div class="dashboard-card-value">${this.settings.currency}${totalValue.toFixed(2)}</div>
            <div class="dashboard-card-change ${gain >= 0 ? 'positive' : 'negative'}">
              ${gain >= 0 ? '↑' : '↓'} ${this.settings.currency}${Math.abs(gain).toFixed(2)} (${gainPercent}%)
            </div>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-title">Locomotives</div>
            <div class="dashboard-card-value">${stats.locomotiveCount}</div>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-title">Rolling Stock</div>
            <div class="dashboard-card-value">${stats.rollingStockCount}</div>
          </div>

          <div class="dashboard-card">
            <div class="dashboard-card-title">Wishlist Items</div>
            <div class="dashboard-card-value">${stats.wishlistCount}</div>
          </div>
        </div>

        ${valuedItems.length > 0 ? `
        <div style="margin-top:24px;margin-bottom:24px;">
          <div class="dashboard-chart-container">
            <div class="dashboard-chart-title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>📊 eBay Market Valuation</span>
              ${this.settings.ebayConfigured ? `<button class="btn btn-outline btn-sm" onclick="app.refreshAllValuations()">🔄 Refresh All</button>` : ''}
            </div>
            <div class="dashboard-grid" style="margin-top:12px;">
              <div class="dashboard-card">
                <div class="dashboard-card-title">Market Value</div>
                <div class="dashboard-card-value">${this.settings.currency}${totalMarketValue.toFixed(2)}</div>
                <div class="dashboard-card-change ${marketGain >= 0 ? 'positive' : 'negative'}">
                  ${marketGain >= 0 ? '↑' : '↓'} ${this.settings.currency}${Math.abs(marketGain).toFixed(2)} (${marketGainPct}%)
                </div>
              </div>
              <div class="dashboard-card">
                <div class="dashboard-card-title">Items Valued</div>
                <div class="dashboard-card-value">${valuedItems.length} / ${items.length}</div>
              </div>
            </div>
            ${bestDeals.length > 0 ? `
            <div style="margin-top:16px;">
              <div class="dashboard-list-title" style="font-size:0.95rem;">Best Deals</div>
              ${bestDeals.map(d => `
                <div class="dashboard-list-item" onclick="app.showDetail('${d.id}')" style="cursor:pointer;">
                  <div class="dashboard-list-name">${this.esc(d.name)}</div>
                  <div style="display:flex;gap:8px;align-items:center;">
                    <span class="valuation-badge ${d.dealGain >= 0 ? 'valuation-up' : 'valuation-down'}">${d.dealGain >= 0 ? '+' : ''}${this.settings.currency}${d.dealGain.toFixed(0)} (${d.dealPct.toFixed(0)}%)</span>
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
        ` : (this.settings.ebayConfigured ? `
        <div style="margin:24px 0;padding:16px;background:var(--color-surface);border-radius:var(--radius-md,8px);border:1px solid var(--color-border);text-align:center;">
          <p style="margin-bottom:12px;">📊 eBay API is connected but no items have been valued yet.</p>
          <button class="btn btn-primary" onclick="app.refreshAllValuations()">🔄 Value Entire Collection</button>
        </div>
        ` : '')}

        <div class="dashboard-chart-container">
          <div class="dashboard-chart-title">Items Added Over Time</div>
          <canvas id="chartTimeline" width="800" height="250"></canvas>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;">
          <div class="dashboard-chart-container">
            <div class="dashboard-chart-title">By Manufacturer</div>
            <canvas id="chartManufacturer" width="400" height="300"></canvas>
          </div>

          <div class="dashboard-chart-container">
            <div class="dashboard-chart-title">By Condition</div>
            <canvas id="chartCondition" width="400" height="300"></canvas>
          </div>

          <div class="dashboard-chart-container">
            <div class="dashboard-chart-title">By DCC Status</div>
            <canvas id="chartDccStatus" width="400" height="300"></canvas>
          </div>

          <div class="dashboard-list">
            <div class="dashboard-list-title">Top 5 Valuable Items</div>
            <div>
              ${topItems.length > 0 ? topItems.map(item => `
                <div class="dashboard-list-item" onclick="app.showDetail('${item.id}')" style="cursor:pointer;">
                  <div class="dashboard-list-name">${this.esc(item.name)}</div>
                  <div class="dashboard-list-value">${this.settings.currency}${item.currentValue.toFixed(2)}</div>
                </div>
              `).join('') : '<p style="color: var(--color-text-muted); padding: 12px 0;">No items with current value recorded.</p>'}
            </div>
          </div>
        </div>

        ${this.renderMaintenanceSection()}
      </div>
    `;
  },

  // ==================== Chart Theme Helpers ====================

  chartTheme() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      dark,
      text: dark ? '#d4d4d4' : '#444',
      textMuted: dark ? '#888' : '#888',
      grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      axis: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
      surface: dark ? '#1a2e26' : '#ffffff',
      tooltipBg: dark ? 'rgba(15, 25, 20, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      tooltipText: dark ? '#f0f0f0' : '#222',
      tooltipBorder: dark ? 'rgba(201, 162, 39, 0.5)' : 'rgba(64, 145, 108, 0.4)'
    };
  },

  // Shared tooltip element (singleton)
  _tooltipEl: null,
  getTooltip() {
    if (!this._tooltipEl) {
      const el = document.createElement('div');
      el.className = 'chart-tooltip';
      el.style.cssText = 'position:fixed;pointer-events:none;padding:8px 12px;border-radius:6px;font-size:0.85rem;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.2);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.15s ease;z-index:9999;border:1px solid transparent;';
      document.body.appendChild(el);
      this._tooltipEl = el;
    }
    return this._tooltipEl;
  },

  showTooltip(x, y, html) {
    const t = this.getTooltip();
    const theme = this.chartTheme();
    t.style.background = theme.tooltipBg;
    t.style.color = theme.tooltipText;
    t.style.borderColor = theme.tooltipBorder;
    t.innerHTML = html;
    t.style.opacity = '1';
    // Position - keep on screen
    const tr = t.getBoundingClientRect();
    const px = Math.min(x + 14, window.innerWidth - tr.width - 10);
    const py = Math.max(10, y - tr.height - 10);
    t.style.left = px + 'px';
    t.style.top = py + 'px';
  },

  hideTooltip() {
    if (this._tooltipEl) this._tooltipEl.style.opacity = '0';
  },

  // Chart data registry - keyed by canvas id so hover handlers can find hitboxes
  _chartData: {},

  // Setup HiDPI canvas and resize to container
  setupCanvas(canvas) {
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Use CSS size from parent, scale canvas for HiDPI
    const cssWidth = Math.max(260, rect.width - 32);
    const cssHeight = canvas.dataset.height ? parseInt(canvas.dataset.height) : 280;
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: cssWidth, height: cssHeight };
  },

  drawDashboardCharts() {
    const items = this.items;

    // ===== Timeline (area chart) =====
    const byMonth = {};
    items.forEach(item => {
      const date = new Date(item.createdAt);
      const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      const label = date.toLocaleString('default', { year: '2-digit', month: 'short' });
      byMonth[key] = byMonth[key] || { label, count: 0 };
      byMonth[key].count++;
    });
    const sortedKeys = Object.keys(byMonth).sort();
    const monthLabels = sortedKeys.map(k => byMonth[k].label);
    const monthCounts = sortedKeys.map(k => byMonth[k].count);
    this.drawAreaChart('chartTimeline', monthLabels, monthCounts);

    // ===== By manufacturer (horizontal bar) =====
    const byMfg = {};
    items.forEach(item => {
      const mfg = item.manufacturer || 'Unknown';
      byMfg[mfg] = (byMfg[mfg] || 0) + 1;
    });
    const topMfg = Object.entries(byMfg).sort((a, b) => b[1] - a[1]).slice(0, 10);
    this.drawHorizontalBarChart('chartManufacturer',
      topMfg.map(x => x[0]),
      topMfg.map(x => x[1]),
      '#40916c');

    // ===== By condition (donut) =====
    const byCondition = {};
    items.forEach(item => {
      const cond = item.condition || 'Not specified';
      byCondition[cond] = (byCondition[cond] || 0) + 1;
    });
    const condOrder = ['mint-boxed', 'mint', 'excellent-boxed', 'excellent', 'good', 'fair', 'poor', 'Not specified'];
    const condColors = {
      'mint-boxed': '#2e7d32', 'mint': '#66bb6a',
      'excellent-boxed': '#1976d2', 'excellent': '#64b5f6',
      'good': '#ffa726', 'fair': '#fb8c00', 'poor': '#e53935',
      'Not specified': '#9e9e9e'
    };
    const condEntries = condOrder
      .filter(k => byCondition[k])
      .map(k => ({ label: this.formatConditionLabel(k), value: byCondition[k], color: condColors[k] }));
    // Also add any unexpected conditions not in the order
    Object.keys(byCondition).forEach(k => {
      if (!condOrder.includes(k)) {
        condEntries.push({ label: k, value: byCondition[k], color: '#9e9e9e' });
      }
    });
    this.drawDonutChart('chartCondition', condEntries);

    // ===== By DCC status (donut) =====
    const byDcc = {};
    items.forEach(item => {
      const dcc = item.dccStatus || 'Not specified';
      byDcc[dcc] = (byDcc[dcc] || 0) + 1;
    });
    const dccOrder = ['analogue', 'dcc-ready', 'dcc-fitted', 'dcc-sound', 'Not specified'];
    const dccColors = {
      'analogue': '#78909c', 'dcc-ready': '#66bb6a',
      'dcc-fitted': '#1976d2', 'dcc-sound': '#c9a227',
      'Not specified': '#9e9e9e'
    };
    const dccEntries = dccOrder
      .filter(k => byDcc[k])
      .map(k => ({ label: this.formatDccLabel(k), value: byDcc[k], color: dccColors[k] }));
    Object.keys(byDcc).forEach(k => {
      if (!dccOrder.includes(k)) {
        dccEntries.push({ label: k, value: byDcc[k], color: '#9e9e9e' });
      }
    });
    this.drawDonutChart('chartDccStatus', dccEntries);
  },

  formatConditionLabel(k) {
    const map = {
      'mint-boxed': 'Mint (Boxed)', 'mint': 'Mint',
      'excellent-boxed': 'Excellent (Boxed)', 'excellent': 'Excellent',
      'good': 'Good', 'fair': 'Fair', 'poor': 'Poor'
    };
    return map[k] || k;
  },

  formatDccLabel(k) {
    const map = {
      'analogue': 'Analogue', 'dcc-ready': 'DCC Ready',
      'dcc-fitted': 'DCC Fitted', 'dcc-sound': 'DCC Sound'
    };
    return map[k] || k;
  },

  // ==================== Horizontal Bar Chart (better for long labels) ====================

  drawHorizontalBarChart(canvasId, labels, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.dataset.height = Math.max(260, labels.length * 34 + 40);
    const { ctx, width, height } = this.setupCanvas(canvas);
    const theme = this.chartTheme();
    const maxVal = Math.max(...data, 1);

    // Measure longest label to determine left padding
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    let maxLabelW = 0;
    labels.forEach(l => { maxLabelW = Math.max(maxLabelW, ctx.measureText(l).width); });
    const leftPad = Math.min(Math.max(maxLabelW + 16, 80), 160);
    const rightPad = 40;
    const topPad = 10;
    const botPad = 10;
    const chartW = width - leftPad - rightPad;
    const chartH = height - topPad - botPad;
    const rowH = chartH / labels.length;
    const barH = Math.min(rowH * 0.65, 28);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gridlines (vertical)
    const gridSteps = 4;
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = theme.textMuted;
    ctx.textAlign = 'center';
    for (let i = 0; i <= gridSteps; i++) {
      const x = leftPad + (chartW * i / gridSteps);
      ctx.beginPath();
      ctx.moveTo(x, topPad);
      ctx.lineTo(x, topPad + chartH);
      ctx.stroke();
      // value label
      const val = Math.round((maxVal * i / gridSteps));
      ctx.fillText(val, x, topPad + chartH + 14);
    }

    // Bars + labels
    const hitboxes = [];
    labels.forEach((label, i) => {
      const y = topPad + i * rowH + (rowH - barH) / 2;
      const barW = (data[i] / maxVal) * chartW;

      // Gradient fill
      const grad = ctx.createLinearGradient(leftPad, 0, leftPad + chartW, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(1, this.lightenColor(color, 0.25));
      ctx.fillStyle = grad;

      // Rounded rect
      this.roundRect(ctx, leftPad, y, barW, barH, 4);
      ctx.fill();

      // Label (left)
      ctx.fillStyle = theme.text;
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      // Truncate if too long
      let displayLabel = label;
      if (ctx.measureText(label).width > leftPad - 12) {
        while (ctx.measureText(displayLabel + '…').width > leftPad - 12 && displayLabel.length > 3) {
          displayLabel = displayLabel.slice(0, -1);
        }
        displayLabel += '…';
      }
      ctx.fillText(displayLabel, leftPad - 10, y + barH / 2);

      // Value (right of bar)
      ctx.fillStyle = theme.text;
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(data[i], leftPad + barW + 8, y + barH / 2);

      hitboxes.push({
        type: 'hbar', x: leftPad, y, w: chartW, h: barH,
        barEndX: leftPad + barW,
        label, value: data[i]
      });
    });

    this._chartData[canvasId] = { hitboxes, type: 'hbar', total: data.reduce((a, b) => a + b, 0) };
    this.attachChartHover(canvas, canvasId);
  },

  // ==================== Donut Chart (replaces pie) ====================

  drawDonutChart(canvasId, entries) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.dataset.height = 300;
    const { ctx, width, height } = this.setupCanvas(canvas);
    const theme = this.chartTheme();

    const total = entries.reduce((a, b) => a + b.value, 0);
    if (total === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme.textMuted;
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data yet', width / 2, height / 2);
      this._chartData[canvasId] = { hitboxes: [], type: 'donut' };
      return;
    }

    // Layout: donut on left, legend on right
    const legendW = 140;
    const chartArea = width - legendW - 20;
    const cx = 20 + chartArea / 2;
    const cy = height / 2;
    const outerR = Math.min(chartArea, height) / 2 - 10;
    const innerR = outerR * 0.62;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentAngle = -Math.PI / 2;
    const hitboxes = [];

    entries.forEach((entry) => {
      const sliceAngle = (entry.value / total) * 2 * Math.PI;
      ctx.fillStyle = entry.color;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, currentAngle, currentAngle + sliceAngle);
      ctx.arc(cx, cy, innerR, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      // Subtle separator between slices
      ctx.strokeStyle = theme.surface;
      ctx.lineWidth = 2;
      ctx.stroke();

      hitboxes.push({
        type: 'donut', cx, cy, innerR, outerR,
        startAngle: currentAngle, endAngle: currentAngle + sliceAngle,
        label: entry.label, value: entry.value, color: entry.color,
        percent: (entry.value / total * 100)
      });

      currentAngle += sliceAngle;
    });

    // Center total
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(total, cx, cy - 4);
    ctx.fillStyle = theme.textMuted;
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('total', cx, cy + 14);

    // Legend (right side)
    const legendX = width - legendW + 10;
    let legendY = Math.max(10, (height - entries.length * 22) / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    entries.forEach(entry => {
      // Color swatch
      ctx.fillStyle = entry.color;
      this.roundRect(ctx, legendX, legendY + 4, 12, 12, 3);
      ctx.fill();
      // Label
      ctx.fillStyle = theme.text;
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      let label = entry.label;
      const maxW = legendW - 40;
      if (ctx.measureText(label).width > maxW) {
        while (ctx.measureText(label + '…').width > maxW && label.length > 3) {
          label = label.slice(0, -1);
        }
        label += '…';
      }
      ctx.fillText(label, legendX + 18, legendY + 10);
      // Count
      ctx.fillStyle = theme.textMuted;
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(entry.value, legendX + legendW - 20, legendY + 10);
      ctx.textAlign = 'left';
      legendY += 22;
    });

    this._chartData[canvasId] = { hitboxes, type: 'donut', total };
    this.attachChartHover(canvas, canvasId);
  },

  // ==================== Area Chart (timeline) ====================

  drawAreaChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.dataset.height = 250;
    const { ctx, width, height } = this.setupCanvas(canvas);
    const theme = this.chartTheme();

    if (data.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme.textMuted;
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data yet', width / 2, height / 2);
      this._chartData[canvasId] = { hitboxes: [], type: 'area' };
      return;
    }

    const leftPad = 36;
    const rightPad = 20;
    const topPad = 20;
    const botPad = 36;
    const chartW = width - leftPad - rightPad;
    const chartH = height - topPad - botPad;
    const yMax = Math.max(...data, 1);
    const yMaxRounded = Math.ceil(yMax * 1.1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gridlines (horizontal)
    const gridSteps = 4;
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = theme.textMuted;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= gridSteps; i++) {
      const y = topPad + chartH - (chartH * i / gridSteps);
      ctx.beginPath();
      ctx.moveTo(leftPad, y);
      ctx.lineTo(leftPad + chartW, y);
      ctx.stroke();
      const val = Math.round((yMaxRounded * i / gridSteps));
      ctx.fillText(val, leftPad - 6, y);
    }

    // Calculate point positions
    const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW;
    const points = data.map((v, i) => ({
      x: leftPad + i * stepX,
      y: topPad + chartH - (v / yMaxRounded) * chartH,
      value: v,
      label: labels[i]
    }));
    // If only one point, center it
    if (points.length === 1) points[0].x = leftPad + chartW / 2;

    // Area fill (gradient)
    const grad = ctx.createLinearGradient(0, topPad, 0, topPad + chartH);
    grad.addColorStop(0, 'rgba(201, 162, 39, 0.45)');
    grad.addColorStop(1, 'rgba(201, 162, 39, 0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, topPad + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, topPad + chartH);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Dots at points
    const hitboxes = [];
    points.forEach(p => {
      ctx.fillStyle = theme.surface;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 2;
      ctx.stroke();
      hitboxes.push({ type: 'point', x: p.x, y: p.y, r: 10, label: p.label, value: p.value });
    });

    // X-axis labels (thin out if too many)
    ctx.fillStyle = theme.textMuted;
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const maxLabels = Math.floor(chartW / 60);
    const skip = Math.max(1, Math.ceil(points.length / maxLabels));
    points.forEach((p, i) => {
      if (i % skip === 0 || i === points.length - 1) {
        ctx.fillText(p.label, p.x, topPad + chartH + 8);
      }
    });

    this._chartData[canvasId] = { hitboxes, type: 'area' };
    this.attachChartHover(canvas, canvasId);
  },

  // ==================== Chart Hover Detection ====================

  attachChartHover(canvas, canvasId) {
    // Remove old listeners if re-rendering
    if (canvas._chartHoverHandler) {
      canvas.removeEventListener('mousemove', canvas._chartHoverHandler);
      canvas.removeEventListener('mouseleave', canvas._chartLeaveHandler);
    }

    canvas._chartHoverHandler = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const data = this._chartData[canvasId];
      if (!data || !data.hitboxes) return;

      let hit = null;
      for (const hb of data.hitboxes) {
        if (hb.type === 'hbar') {
          if (x >= hb.x && x <= hb.x + hb.w && y >= hb.y && y <= hb.y + hb.h) {
            hit = hb;
            break;
          }
        } else if (hb.type === 'donut') {
          const dx = x - hb.cx;
          const dy = y - hb.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= hb.innerR && dist <= hb.outerR) {
            let ang = Math.atan2(dy, dx);
            // normalise angles to same range
            let start = hb.startAngle, end = hb.endAngle;
            // bring angle to matching revolution
            while (ang < start) ang += Math.PI * 2;
            while (ang > end + Math.PI * 2) ang -= Math.PI * 2;
            if (ang >= start && ang <= end) {
              hit = hb;
              break;
            }
          }
        } else if (hb.type === 'point') {
          if (Math.abs(x - hb.x) <= hb.r && Math.abs(y - hb.y) <= hb.r) {
            hit = hb;
            break;
          }
        }
      }

      if (hit) {
        canvas.style.cursor = 'pointer';
        let html = '';
        if (hit.type === 'hbar') {
          const pct = data.total > 0 ? (hit.value / data.total * 100).toFixed(1) : 0;
          html = `<div style="font-weight:700;margin-bottom:2px;">${this.esc(hit.label)}</div><div style="color:#40916c;font-weight:700;">${hit.value} items · ${pct}%</div>`;
        } else if (hit.type === 'donut') {
          html = `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${hit.color};"></span><span style="font-weight:700;">${this.esc(hit.label)}</span></div><div style="color:${hit.color};font-weight:700;">${hit.value} items · ${hit.percent.toFixed(1)}%</div>`;
        } else if (hit.type === 'point') {
          html = `<div style="font-weight:700;margin-bottom:2px;">${this.esc(hit.label)}</div><div style="color:#c9a227;font-weight:700;">${hit.value} item${hit.value !== 1 ? 's' : ''} added</div>`;
        }
        this.showTooltip(e.clientX, e.clientY, html);

        // Redraw with highlight if donut
        if (hit.type === 'donut' && this._lastHighlight !== hit) {
          this._lastHighlight = hit;
          this.highlightDonutSlice(canvas, canvasId, hit);
        }
      } else {
        canvas.style.cursor = '';
        this.hideTooltip();
        if (this._lastHighlight) {
          this._lastHighlight = null;
          // Redraw the chart fresh
          this.drawDashboardCharts();
        }
      }
    };

    canvas._chartLeaveHandler = () => {
      canvas.style.cursor = '';
      this.hideTooltip();
      if (this._lastHighlight) {
        this._lastHighlight = null;
        this.drawDashboardCharts();
      }
    };

    canvas.addEventListener('mousemove', canvas._chartHoverHandler);
    canvas.addEventListener('mouseleave', canvas._chartLeaveHandler);
  },

  highlightDonutSlice(canvas, canvasId, slice) {
    const ctx = canvas.getContext('2d');
    // Draw a slightly larger outer ring for the highlighted slice
    ctx.save();
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(slice.cx, slice.cy, slice.outerR + 2, slice.startAngle, slice.endAngle);
    ctx.stroke();
    ctx.restore();
  },

  // ==================== Drawing Utilities ====================

  roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  lightenColor(hex, amount) {
    // Lighten a hex colour by a factor (0-1)
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return hex;
    const r = parseInt(m[1], 16);
    const g = parseInt(m[2], 16);
    const b = parseInt(m[3], 16);
    const mix = c => Math.round(c + (255 - c) * amount);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  },

  // ==================== Export / Import ====================

  exportData() {
    window.location.href = '/api/export';
    this.toast('Backup download started');
  },

  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      await this.api('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text
      });
      this.toast('All aboard \u2014 data restored successfully!');
      await this.loadCategories();
      await this.loadAllItems();
      await this.loadStats();
      this.showCatalog();
    } catch (e) { /* toast shown */ }
    event.target.value = '';
  },

  exportCSV() {
    fetch('/api/items')
      .then(r => r.json())
      .then(allItems => {
        const headers = ['Name','Category','Subcategory','Manufacturer','Livery','Purchase Price','Current Value','Place of Purchase','Last Service Date','Goes Well With','Historical Background','Wishlist'];
        const rows = allItems.map(item => [
          `"${(item.name||'').replace(/"/g,'""')}"`,
          `"${this.getCategoryName(item.categoryId)}"`,
          `"${this.getSubcategoryName(item.subcategoryId)}"`,
          `"${(item.manufacturer||'').replace(/"/g,'""')}"`,
          `"${(item.livery||'').replace(/"/g,'""')}"`,
          item.purchasePrice || 0,
          item.currentValue || 0,
          `"${(item.placeOfPurchase||'').replace(/"/g,'""')}"`,
          `"${item.lastServiceDate||''}"`,
          `"${(item.goesWellWith||'').replace(/"/g,'""')}"`,
          `"${(item.historicalBackground||'').replace(/"/g,'""')}"`,
          item.wishlist ? 'yes' : 'no'
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${app.settings.appName.toLowerCase().replace(/\s+/g, '-')}-export.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast('CSV export downloaded');
      });
  },

  // ==================== Wishlist ====================

  async toggleWishlist() {
    this.showWishlistOnly = !this.showWishlistOnly;
    if (this.showWishlistOnly) {
      await this.loadItems('?wishlist=true');
    } else {
      let params = '';
      if (this.currentFilter) {
        if (this.currentFilter.type === 'search') params = `?search=${encodeURIComponent(this.currentFilter.value)}`;
        else if (this.currentFilter.type === 'category') params = `?category=${this.currentFilter.value}`;
        else if (this.currentFilter.type === 'subcategory') params = `?subcategory=${this.currentFilter.value}`;
      }
      await this.loadItems(params);
    }
    this.render();
    this.renderStats();
  },

  // ==================== CSV Import ====================

  async importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const result = await this.api('/api/items/csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text
      });
      this.toast(`${result.message}`);
      if (result.errors && result.errors.length > 0) {
        console.warn('CSV import errors:', result.errors);
      }
      await this.loadAllItems();
      await this.loadStats();
      await this.loadCategories();
      this.showCatalog();
    } catch (e) { /* toast shown */ }
    event.target.value = '';
  },

  // ==================== Styled Modal Dialogs ====================

  /**
   * Show a styled input modal (replaces browser prompt())
   * Returns a Promise that resolves with the input value or null if cancelled
   */
  showInputModal({ title, label, placeholder, value, icon, hint }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="depot-dialog">
          <div class="depot-dialog-header">
            <div class="depot-dialog-mascot">${this.mascotSmall()}</div>
            <div>
              <h3 class="depot-dialog-title">${title || 'Input'}</h3>
              ${hint ? `<p class="depot-dialog-hint">${hint}</p>` : ''}
            </div>
          </div>
          <div class="depot-dialog-body">
            <label class="form-label">${label || 'Name'}</label>
            <input type="text" class="form-input depot-dialog-input" placeholder="${this.esc(placeholder || '')}" value="${this.esc(value || '')}" autofocus>
          </div>
          <div class="depot-dialog-actions">
            <button class="btn btn-outline" data-action="cancel">Cancel</button>
            <button class="btn btn-primary" data-action="confirm">${icon || '✅'} Confirm</button>
          </div>
        </div>
      `;

      const input = overlay.querySelector('.depot-dialog-input');
      const confirm = () => {
        const val = input.value.trim();
        overlay.remove();
        resolve(val || null);
      };
      const cancel = () => { overlay.remove(); resolve(null); };

      overlay.querySelector('[data-action="cancel"]').onclick = cancel;
      overlay.querySelector('[data-action="confirm"]').onclick = confirm;
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') confirm();
        if (e.key === 'Escape') cancel();
      });
      overlay.addEventListener('click', e => { if (e.target === overlay) cancel(); });

      document.body.appendChild(overlay);
      setTimeout(() => input.focus(), 50);
    });
  },

  /**
   * Show a styled confirm modal (replaces browser confirm())
   * Returns a Promise that resolves with true/false
   */
  showConfirmModal({ title, message, confirmText, confirmClass, icon }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="depot-dialog">
          <div class="depot-dialog-header">
            <div class="depot-dialog-mascot">${this.mascotSmall('worried')}</div>
            <div>
              <h3 class="depot-dialog-title">${title || 'Are you sure?'}</h3>
            </div>
          </div>
          <div class="depot-dialog-body">
            <p class="depot-dialog-message">${message}</p>
          </div>
          <div class="depot-dialog-actions">
            <button class="btn btn-outline" data-action="cancel">Keep it</button>
            <button class="btn ${confirmClass || 'btn-danger'}" data-action="confirm">${icon || '🗑️'} ${confirmText || 'Delete'}</button>
          </div>
        </div>
      `;

      overlay.querySelector('[data-action="cancel"]').onclick = () => { overlay.remove(); resolve(false); };
      overlay.querySelector('[data-action="confirm"]').onclick = () => { overlay.remove(); resolve(true); };
      overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
      document.body.appendChild(overlay);
    });
  },

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

  getAllTagsForSidebar() {
    const tagCounts = {};
    this.items.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  },

  getFilterTitle() {
    if (!this.currentFilter) return 'All Items';
    if (this.currentFilter.type === 'search') return `Search: "${this.currentFilter.value}"`;
    if (this.currentFilter.type === 'category') return this.getCategoryName(this.currentFilter.value) || 'Category';
    if (this.currentFilter.type === 'subcategory') return this.getSubcategoryName(this.currentFilter.value) || 'Subcategory';
    if (this.currentFilter.type === 'tag') return `Tag: "${this.currentFilter.value}"`;
    return 'All Items';
  },

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

  // ==================== Mascot (Smokey the Depot Engine) ====================

  /**
   * SVG mascot — a friendly little tank engine face.
   * Moods: 'happy' (default), 'worried', 'thinking'
   * Used in dialogs, empty states, and toasts for personality.
   */
  mascotTiny(mood = 'happy') {
    const eyeL = mood === 'worried' ? 'cy="10"' : 'cy="11"';
    const eyeR = mood === 'worried' ? 'cy="10"' : 'cy="11"';
    const mouth = mood === 'happy'
      ? '<path d="M11 17 Q14 20 17 17" stroke="#333" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
      : mood === 'worried'
        ? '<path d="M11 19 Q14 17 17 19" stroke="#333" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
        : '<line x1="11" y1="18" x2="17" y2="18" stroke="#333" stroke-width="1.2" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 28 28" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="24" height="18" rx="6" fill="#2d6a4f"/>
      <rect x="2" y="4" width="24" height="5" rx="3" fill="#c9a227"/>
      <circle cx="10" ${eyeL} r="2.5" fill="white"/><circle cx="10.3" ${eyeL} r="1.2" fill="#333"/>
      <circle cx="18" ${eyeR} r="2.5" fill="white"/><circle cx="18.3" ${eyeR} r="1.2" fill="#333"/>
      ${mouth}
      <rect x="11" y="1" width="6" height="4" rx="2" fill="#1b4332"/>
      <circle cx="7" cy="24" r="3" fill="#444" stroke="#555" stroke-width="0.8"/><circle cx="7" cy="24" r="1" fill="#c9a227"/>
      <circle cx="21" cy="24" r="3" fill="#444" stroke="#555" stroke-width="0.8"/><circle cx="21" cy="24" r="1" fill="#c9a227"/>
    </svg>`;
  },

  mascotSmall(mood = 'happy') {
    const eyeL = mood === 'worried' ? 'cy="30"' : 'cy="32"';
    const eyeR = mood === 'worried' ? 'cy="30"' : 'cy="32"';
    const brow = mood === 'worried'
      ? '<line x1="20" y1="23" x2="27" y2="25" stroke="#1b4332" stroke-width="2" stroke-linecap="round"/><line x1="48" y1="25" x2="55" y2="23" stroke="#1b4332" stroke-width="2" stroke-linecap="round"/>'
      : '';
    const mouth = mood === 'happy'
      ? '<path d="M28 44 Q37 52 46 44" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>'
      : mood === 'worried'
        ? '<path d="M30 48 Q37 43 44 48" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>'
        : '<line x1="30" y1="46" x2="44" y2="46" stroke="#333" stroke-width="2" stroke-linecap="round"/>';
    const cheeks = mood === 'happy' ? '<circle cx="19" cy="39" r="4" fill="#e8886880"/><circle cx="55" cy="39" r="4" fill="#e8886880"/>' : '';
    return `<svg viewBox="0 0 74 66" width="52" height="46" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="12" width="62" height="40" rx="12" fill="#2d6a4f"/>
      <rect x="6" y="10" width="62" height="10" rx="5" fill="#c9a227"/>
      ${brow}
      <circle cx="27" ${eyeL} r="6" fill="white"/><circle cx="28" ${eyeL} r="3" fill="#333"/>
      <circle cx="47" ${eyeR} r="6" fill="white"/><circle cx="48" ${eyeR} r="3" fill="#333"/>
      ${cheeks}
      ${mouth}
      <rect x="29" y="2" width="16" height="10" rx="4" fill="#1b4332"/>
      <rect x="26" y="0" width="22" height="5" rx="3" fill="#0f2b1f"/>
      <circle cx="18" cy="58" r="6" fill="#444" stroke="#555" stroke-width="1.5"/><circle cx="18" cy="58" r="2" fill="#c9a227"/>
      <circle cx="56" cy="58" r="6" fill="#444" stroke="#555" stroke-width="1.5"/><circle cx="56" cy="58" r="2" fill="#c9a227"/>
      <circle cx="37" cy="58" r="5" fill="#444" stroke="#555" stroke-width="1.5"/><circle cx="37" cy="58" r="1.5" fill="#c9a227"/>
    </svg>`;
  },

  // ==================== Duplicate Detection ====================

  async checkDuplicate() {
    const productCode = document.getElementById('formProductCode').value.trim();
    if (!productCode || productCode.length < 2) return;
    // Don't check against self when editing
    try {
      const data = await this.api('/api/items/check-duplicate?productCode=' + encodeURIComponent(productCode));
      const dupes = data.duplicates.filter(d => !this.editingItem || d.id !== this.editingItem.id);
      if (dupes.length > 0) {
        this.toast(`Heads up! Product code "${productCode}" is already in your collection (${dupes[0].name}). Still good to add another if it's a different model!`, 'error');
      }
    } catch(e) { /* silent */ }
  },

  // ==================== Wishlist Notes ====================

  renderWishlistSpotted(item) {
    if (!item.wishlist) return '';
    const hasNotes = item.wishlistNotes || item.wishlistSpottedAt || item.wishlistSpottedPrice;
    if (!hasNotes) return '';
    return `
      <div class="wishlist-spotted">
        <div class="wishlist-spotted-label">Spotted Info</div>
        ${item.wishlistSpottedAt ? `<div>Where: ${this.esc(item.wishlistSpottedAt)}</div>` : ''}
        ${item.wishlistSpottedPrice ? `<div>Price: ${this.settings.currency}${item.wishlistSpottedPrice.toFixed(2)}</div>` : ''}
        ${item.wishlistNotes ? `<div>Notes: ${this.esc(item.wishlistNotes)}</div>` : ''}
      </div>
    `;
  },

  // ==================== Advanced Search / Filter ====================

  renderFilterPanel() {
    const manufacturers = [...new Set(this.items.map(i => i.manufacturer).filter(Boolean))].sort();
    const conditions = ['mint-boxed', 'mint', 'excellent-boxed', 'excellent', 'good', 'fair', 'poor'];
    const dccStatuses = ['analogue', 'dcc-ready', 'dcc-fitted', 'dcc-sound'];
    const f = this.advancedFilters;

    return `
      <div class="filter-panel">
        <div class="filter-panel-toggle" onclick="app.toggleFilterPanel()">
          🔍 Advanced Filters ${Object.keys(f).filter(k => f[k]).length > 0 ? `<span style="color:var(--gold-primary);">(${Object.keys(f).filter(k => f[k]).length} active)</span>` : ''}
        </div>
        <div class="filter-panel-body ${this.filterPanelOpen ? 'open' : ''}" id="filterPanelBody">
          <div class="filter-row">
            <div class="form-group">
              <label class="form-label">Manufacturer</label>
              <select class="form-select" onchange="app.setFilter('manufacturer', this.value)">
                <option value="">All</option>
                ${manufacturers.map(m => `<option value="${this.esc(m)}" ${f.manufacturer === m ? 'selected' : ''}>${this.esc(m)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Condition</label>
              <select class="form-select" onchange="app.setFilter('condition', this.value)">
                <option value="">All</option>
                ${conditions.map(c => `<option value="${c}" ${f.condition === c ? 'selected' : ''}>${c.replace('-', ' / ')}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">DCC Status</label>
              <select class="form-select" onchange="app.setFilter('dccStatus', this.value)">
                <option value="">All</option>
                ${dccStatuses.map(d => `<option value="${d}" ${f.dccStatus === d ? 'selected' : ''}>${d.replace('-', ' ')}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price Range</label>
              <div style="display:flex;gap:4px;">
                <input type="number" class="form-input" placeholder="Min" style="width:80px" value="${f.priceMin || ''}" onchange="app.setFilter('priceMin', this.value)">
                <input type="number" class="form-input" placeholder="Max" style="width:80px" value="${f.priceMax || ''}" onchange="app.setFilter('priceMax', this.value)">
              </div>
            </div>
          </div>
          <div class="filter-actions">
            <button class="btn btn-primary btn-sm" onclick="app.applyAdvancedFilters()">Apply Filters</button>
            <button class="btn btn-outline btn-sm" onclick="app.clearAdvancedFilters()">Clear All</button>
          </div>
        </div>
      </div>
    `;
  },

  toggleFilterPanel() {
    this.filterPanelOpen = !this.filterPanelOpen;
    const body = document.getElementById('filterPanelBody');
    if (body) body.classList.toggle('open', this.filterPanelOpen);
  },

  setFilter(key, value) {
    if (value) this.advancedFilters[key] = value;
    else delete this.advancedFilters[key];
  },

  applyAdvancedFilters() {
    this.render();
  },

  clearAdvancedFilters() {
    this.advancedFilters = {};
    this.filterPanelOpen = false;
    this.render();
  },

  getFilteredItems() {
    let items = this.sortItems(this.items);
    const f = this.advancedFilters;
    if (f.manufacturer) items = items.filter(i => i.manufacturer === f.manufacturer);
    if (f.condition) items = items.filter(i => i.condition === f.condition);
    if (f.dccStatus) items = items.filter(i => i.dccStatus === f.dccStatus);
    if (f.priceMin) items = items.filter(i => (i.purchasePrice || 0) >= parseFloat(f.priceMin));
    if (f.priceMax) items = items.filter(i => (i.purchasePrice || 0) <= parseFloat(f.priceMax));
    return items;
  },

  // ==================== Collection Timeline ====================

  showTimeline() {
    this.currentView = 'timeline';
    this.setNav('');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
  },

  renderTimelineView() {
    const items = [...this.items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (items.length === 0) {
      return `<div class="timeline-container"><div class="empty-state"><div class="empty-mascot">${this.mascotMedium()}</div><div class="empty-title">No history yet</div><div class="empty-text">Add some items and watch your collection timeline grow!</div></div></div>`;
    }

    // Group by year and month
    const grouped = {};
    items.forEach(item => {
      const d = new Date(item.createdAt);
      const year = d.getFullYear();
      const month = d.toLocaleString('default', { month: 'long' });
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(item);
    });

    let html = '<div class="timeline-container"><h2>Collection Timeline</h2><p style="color:var(--color-text-muted);margin-bottom:24px;">Watch your collection grow over time</p>';
    for (const year of Object.keys(grouped).sort((a, b) => b - a)) {
      html += `<div class="timeline-year">${year}</div>`;
      for (const month of Object.keys(grouped[year])) {
        html += `<div class="timeline-month">${month}</div><div class="timeline-items">`;
        for (const item of grouped[year][month]) {
          const thumb = item.images && item.images.length > 0
            ? `<img src="${item.images[0]}" class="timeline-item-thumb" alt="">`
            : `<div class="timeline-item-thumb" style="display:flex;align-items:center;justify-content:center;">${item.categoryId === 'locomotives' ? '🚂' : '🚃'}</div>`;
          html += `
            <div class="timeline-item" onclick="app.showDetail('${item.id}')" style="cursor:pointer;">
              ${thumb}
              <div class="timeline-item-info">
                <div class="timeline-item-name">${this.esc(item.name)}</div>
                <div class="timeline-item-detail">${this.esc(item.manufacturer || '')} ${item.livery ? '· ' + this.esc(item.livery) : ''}</div>
              </div>
              ${item.purchasePrice ? `<div class="timeline-item-price">${this.settings.currency}${item.purchasePrice.toFixed(2)}</div>` : ''}
            </div>`;
        }
        html += '</div>';
      }
    }
    html += '</div>';
    return html;
  },

  // ==================== Random Spotlight ====================

  renderSpotlight() {
    if (this.items.length === 0) return '';
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    const img = item.images && item.images.length > 0
      ? `<img src="${item.images[0]}" class="spotlight-card-image" alt="">`
      : `<div class="spotlight-card-image-placeholder">${item.categoryId === 'locomotives' ? '🚂' : '🚃'}</div>`;
    return `
      <div class="spotlight-card" onclick="app.showDetail('${item.id}')">
        ${img}
        <div class="spotlight-card-body">
          <div class="spotlight-card-label">Rediscover your collection</div>
          <div class="spotlight-card-name">${this.esc(item.name)}</div>
          <div class="spotlight-card-detail">${this.esc(item.manufacturer || 'Unknown')} ${item.livery ? '· ' + this.esc(item.livery) : ''}</div>
          ${item.historicalBackground ? `<div class="spotlight-card-detail" style="margin-top:4px;font-style:italic;">"${this.esc(item.historicalBackground.substring(0, 100))}${item.historicalBackground.length > 100 ? '...' : ''}"</div>` : ''}
        </div>
      </div>
    `;
  },

  // ==================== Trash / Bin (Soft Delete) ====================

  showTrash() {
    this.currentView = 'trash';
    this.setNav('');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
  },

  renderTrashView() {
    return `
      <div class="trash-container">
        <div class="trash-header">
          <h2>🗑️ Recycle Bin</h2>
          <button class="btn btn-outline btn-sm" onclick="app.showBackup()">← Back to Settings</button>
        </div>
        <p style="color:var(--color-text-muted);margin-bottom:20px;">Items here will be permanently deleted after 30 days. You can restore them any time before that.</p>
        <div id="trashList"><p>Loading...</p></div>
      </div>
    `;
  },

  async loadTrashItems() {
    try {
      const items = await this.api('/api/trash');
      const container = document.getElementById('trashList');
      if (!container) return;

      if (items.length === 0) {
        container.innerHTML = `<div class="trash-empty"><div class="empty-mascot">${this.mascotMedium('happy')}</div><p>The bin is empty — nothing to see here!</p></div>`;
        return;
      }

      container.innerHTML = items.map(item => {
        const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - new Date(item.deletedAt).getTime()) / (1000 * 60 * 60 * 24)));
        return `
          <div class="trash-item">
            <div class="trash-item-info">
              <div class="trash-item-name">${this.esc(item.name)}</div>
              <div class="trash-item-meta">${this.esc(item.manufacturer || '')} · Deleted ${this.formatDate(item.deletedAt)} · <span class="trash-days-left">${daysLeft} days left</span></div>
            </div>
            <div class="trash-item-actions">
              <button class="btn btn-outline btn-sm" onclick="app.restoreItem('${item.id}')">♻️ Restore</button>
              <button class="btn btn-danger btn-sm" onclick="app.permanentlyDelete('${item.id}', '${this.esc(item.name)}')">🗑️ Delete Forever</button>
            </div>
          </div>
        `;
      }).join('');
    } catch(e) { /* toast shown */ }
  },

  async restoreItem(id) {
    try {
      await this.api(`/api/trash/${id}/restore`, { method: 'POST' });
      this.toast('Welcome back! Item restored to the collection.');
      await this.loadAllItems();
      await this.loadStats();
      this.loadTrashItems();
    } catch(e) { /* toast shown */ }
  },

  async permanentlyDelete(id, name) {
    const ok = await this.showConfirmModal({
      title: 'Permanent deletion',
      message: `<strong>${name}</strong> will be gone forever — no coming back from this one!`,
      confirmText: 'Delete forever',
      icon: '💀'
    });
    if (!ok) return;
    try {
      await this.api(`/api/trash/${id}`, { method: 'DELETE' });
      this.toast('Permanently scrapped — gone for good.');
      this.loadTrashItems();
    } catch(e) { /* toast shown */ }
  },

  // ==================== Drag & Drop Image Reorder ====================

  initDragDrop() {
    const container = document.getElementById('uploadPreviews');
    if (!container) return;
    const previews = container.querySelectorAll('.upload-preview');
    previews.forEach((el, i) => {
      el.setAttribute('draggable', 'true');
      el.dataset.index = i;
      el.addEventListener('dragstart', (e) => {
        this.dragSrcIndex = i;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', () => { el.classList.remove('dragging'); });
      el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
      el.addEventListener('dragleave', () => { el.classList.remove('drag-over'); });
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const from = this.dragSrcIndex;
        const to = i;
        if (from === to) return;
        this.reorderImages(from, to);
      });
    });
  },

  reorderImages(fromIndex, toIndex) {
    // Combine existing and pending for a unified list
    const allImages = [...this.existingImages.map(url => ({ type: 'existing', url })), ...this.pendingImages.map(file => ({ type: 'pending', file }))];
    const [moved] = allImages.splice(fromIndex, 1);
    allImages.splice(toIndex, 0, moved);
    this.existingImages = allImages.filter(i => i.type === 'existing').map(i => i.url);
    this.pendingImages = allImages.filter(i => i.type === 'pending').map(i => i.file);
    this.renderUploadPreviews();
    // Re-init drag-drop after re-render
    setTimeout(() => this.initDragDrop(), 50);
  },

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

  // ==================== Data Health Check ====================

  showHealthCheck() {
    this.currentView = 'health';
    this.setNav('');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
  },

  renderHealthView() {
    return `
      <div class="health-container">
        <h2>🏥 Collection Health Check</h2>
        <p style="color:var(--color-text-muted);margin-bottom:24px;">Let's see how complete your records are — the fuller, the better!</p>
        <div id="healthContent"><p>Scanning your collection...</p></div>
      </div>
    `;
  },

  async loadHealthData() {
    try {
      const data = await this.api('/api/health-check');
      const container = document.getElementById('healthContent');
      if (!container) return;

      const barColor = data.avgCompleteness >= 80 ? 'health-good' : data.avgCompleteness >= 50 ? 'health-warn' : 'health-bad';

      let html = `
        <div class="health-summary">
          <div class="health-card">
            <div class="health-card-value">${data.totalItems}</div>
            <div class="health-card-label">Total Items</div>
          </div>
          <div class="health-card">
            <div class="health-card-value" style="color:${data.itemsWithIssues === 0 ? '#66bb6a' : '#ef5350'}">${data.itemsWithIssues}</div>
            <div class="health-card-label">Items with Issues</div>
          </div>
          <div class="health-card">
            <div class="health-card-value">${data.avgCompleteness}%</div>
            <div class="health-card-label">Average Completeness</div>
            <div class="health-bar"><div class="health-bar-fill ${barColor}" style="width:${data.avgCompleteness}%"></div></div>
          </div>
        </div>
      `;

      if (data.issues.length === 0) {
        html += `<div style="text-align:center;padding:40px;"><div class="empty-mascot">${this.mascotMedium('happy')}</div><p style="font-size:1.1rem;font-weight:600;">All clear! Your records are in tip-top shape.</p></div>`;
      } else {
        html += '<h3 style="margin-bottom:12px;">Items needing attention</h3>';
        for (const issue of data.issues) {
          const pctColor = issue.completeness >= 80 ? '#66bb6a' : issue.completeness >= 50 ? '#ffb74d' : '#ef5350';
          html += `
            <div class="health-issue-item" onclick="app.openEditModal('${issue.id}')">
              <div class="health-issue-name">${this.esc(issue.name)}</div>
              <div class="health-issue-missing">Missing: ${issue.missingFields.join(', ')}${issue.serviceOverdue ? ' · 🔧 Service overdue' : ''}</div>
              <div class="health-issue-percent" style="color:${pctColor}">${issue.completeness}%</div>
            </div>
          `;
        }
      }
      container.innerHTML = html;
    } catch(e) { /* toast shown */ }
  },

  // ==================== Maintenance Reminders ====================

  getMaintenanceItems() {
    const interval = this.settings.serviceIntervalDays || 365;
    const now = Date.now();
    return this.items.filter(item => {
      if (!item.lastServiceDate) return true; // never serviced
      const days = Math.floor((now - new Date(item.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24));
      return days > interval * 0.75; // due soon or overdue
    }).sort((a, b) => {
      const daysA = a.lastServiceDate ? Math.floor((now - new Date(a.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24)) : 9999;
      const daysB = b.lastServiceDate ? Math.floor((now - new Date(b.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24)) : 9999;
      return daysB - daysA;
    });
  },

  renderMaintenanceSection() {
    const items = this.getMaintenanceItems();
    if (items.length === 0) return '';
    const interval = this.settings.serviceIntervalDays || 365;
    const now = Date.now();

    let html = `<div class="dashboard-chart-container"><div class="dashboard-chart-title">🔧 Maintenance Due (${items.length} items)</div><div class="maintenance-list">`;
    for (const item of items.slice(0, 10)) {
      const days = item.lastServiceDate ? Math.floor((now - new Date(item.lastServiceDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
      const isOverdue = days !== null && days > interval;
      const cls = isOverdue ? 'overdue' : 'due-soon';

      html += `
        <div class="maintenance-item ${cls}" onclick="app.showDetail('${item.id}')" style="cursor:pointer;">
          <div class="maintenance-item-info">
            <div class="maintenance-item-name">${this.esc(item.name)}</div>
            <div class="maintenance-item-date">${days !== null ? `Last serviced ${days} days ago` : 'Never serviced'}</div>
          </div>
          <span class="service-badge ${isOverdue ? 'service-overdue' : 'service-due-soon'}">${isOverdue ? '🔧 Overdue' : '⚙️ Due soon'}</span>
        </div>
      `;
    }
    html += '</div></div>';
    return html;
  },

  // ==================== Public Share Link ====================

  async toggleShareLink() {
    try {
      const status = await this.api('/api/share/status');
      if (status.enabled) {
        const ok = await this.showConfirmModal({
          title: 'Disable Share Link?',
          message: 'The existing share link will stop working. Anyone with it will no longer see your collection.',
          confirmText: 'Disable',
          confirmClass: 'btn-outline',
          icon: '🔗'
        });
        if (!ok) return;
        await this.api('/api/share/disable', { method: 'POST' });
        this.toast('Share link disabled — collection is private again.');
      } else {
        await this.api('/api/share/enable', { method: 'POST' });
        this.toast('Share link created! Copy it and send to your friends.');
      }
      this.render();
    } catch(e) { /* toast shown */ }
  },

  async renderShareSection() {
    try {
      const status = await this.api('/api/share/status');
      const baseUrl = window.location.origin;
      if (status.enabled) {
        const shareUrl = `${baseUrl}/shared?token=${status.token}`;
        return `
          <div class="share-panel">
            <h3>🔗 Share Link <span style="color:#66bb6a;font-size:0.85rem;">Active</span></h3>
            <p>Anyone with this link can view your collection (read-only, no editing).</p>
            <div class="share-url">
              <input type="text" class="form-input" value="${shareUrl}" readonly onclick="this.select()">
              <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('${shareUrl}');app.toast('Link copied!')">📋 Copy</button>
            </div>
            <button class="btn btn-outline btn-sm" onclick="app.toggleShareLink()" style="margin-top:12px;">Disable Share Link</button>
          </div>
        `;
      }
      return `
        <div class="share-panel">
          <h3>🔗 Share Your Collection</h3>
          <p>Create a read-only link to share your catalogue with fellow enthusiasts — no password required for them.</p>
          <button class="btn btn-primary btn-sm" onclick="app.toggleShareLink()">Create Share Link</button>
        </div>
      `;
    } catch(e) { return ''; }
  },

  // ==================== Print-Friendly Catalogue ====================

  showPrintView() {
    this.currentView = 'print';
    this.setNav('');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
  },

  renderPrintView() {
    const items = this.sortItems(this.items);
    let html = `
      <div class="print-catalogue-view">
        <h1>${this.esc(this.settings.appName)} — Collection Catalogue</h1>
        <div class="print-date">Printed ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · ${items.length} items</div>
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.print()">🖨️ Print This Page</button> <button class="btn btn-outline" onclick="app.showBackup()">← Back</button></div>
        <div class="print-catalogue-grid">
    `;
    for (const item of items) {
      const img = item.images && item.images.length > 0 ? `<img src="${item.images[0]}" alt="">` : '';
      html += `
        <div class="print-catalogue-item">
          ${img}
          <h4>${this.esc(item.name)}</h4>
          <p>${this.esc(item.manufacturer || '')} ${item.livery ? '· ' + this.esc(item.livery) : ''}</p>
          <p>${item.purchasePrice ? this.settings.currency + item.purchasePrice.toFixed(2) : '—'} ${item.currentValue ? '(Value: ' + this.settings.currency + item.currentValue.toFixed(2) + ')' : ''}</p>
          ${item.condition ? `<p>Condition: ${item.condition.replace('-', ' / ')}</p>` : ''}
          ${item.storageLocation ? `<p>Location: ${this.esc(item.storageLocation)}</p>` : ''}
        </div>
      `;
    }
    html += '</div></div>';
    return html;
  },

  // ==================== QR Code Generator ====================

  generateQRCode(text, size = 200) {
    // Simple QR code implementation using Canvas
    // We'll use a basic text-to-QR approach via a data URL
    // For a zero-dependency approach, we generate a visual ID card instead
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Generate a simple visual barcode-style pattern from the text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#1b4332';

    // Create a hash-based pattern
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }

    const gridSize = 21;
    const cellSize = Math.floor(size / (gridSize + 2));
    const offset = Math.floor((size - cellSize * gridSize) / 2);

    // Position detection patterns (corners)
    const drawFinder = (x, y) => {
      ctx.fillRect(offset + x * cellSize, offset + y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(gridSize - 7, 0);
    drawFinder(0, gridSize - 7);

    // Fill data area with hash-derived pattern
    let seed = Math.abs(hash);
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // Skip finder patterns
        if ((row < 8 && col < 8) || (row < 8 && col > gridSize - 9) || (row > gridSize - 9 && col < 8)) continue;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        if (seed % 2 === 0) {
          ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize, cellSize);
        }
      }
    }

    return canvas.toDataURL();
  },

  showQRForItem(itemId) {
    const item = this.items.find(i => i.id === itemId) || this.detailItem;
    if (!item) return;
    const url = `${window.location.origin}/#item/${item.id}`;
    const qrDataUrl = this.generateQRCode(url);

    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="depot-dialog" style="max-width:350px;">
        <div class="depot-dialog-header">
          <div class="depot-dialog-mascot">${this.mascotSmall('happy')}</div>
          <div><h3 class="depot-dialog-title">QR Label</h3></div>
        </div>
        <div class="depot-dialog-body qr-container">
          <img src="${qrDataUrl}" class="qr-canvas" width="200" height="200" alt="QR Code">
          <div style="font-weight:600;margin-top:8px;">${this.esc(item.name)}</div>
          <div style="font-size:0.8rem;color:var(--color-text-muted);">${this.esc(item.productCode || '')} · ${this.esc(item.manufacturer || '')}</div>
          <button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="app.printQR(this)">🖨️ Print Label</button>
        </div>
        <div class="depot-dialog-actions">
          <button class="btn btn-outline" onclick="this.closest('.confirm-overlay').remove()">Close</button>
        </div>
      </div>
    `;
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
  },

  printQR(btn) {
    const qrContainer = btn.closest('.qr-container');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>QR Label</title><style>body{text-align:center;font-family:sans-serif;padding:20px;}img{margin:10px;}</style></head><body>${qrContainer.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  },

  // ==================== Insurance / Valuation Report ====================

  generateInsuranceReport() {
    const items = this.sortItems(this.items);
    const totalValue = items.reduce((sum, i) => sum + (i.currentValue || i.purchasePrice || 0), 0);
    const c = this.settings.currency;

    let html = `
      <html><head><title>${this.settings.appName} — Insurance Valuation Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; max-width: 900px; margin: 0 auto; }
        h1 { border-bottom: 3px solid #1b4332; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.85rem; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background: #1b4332; color: white; }
        tr:nth-child(even) { background: #f8f8f8; }
        .summary { background: #f0f0f0; padding: 16px; border-radius: 8px; margin: 16px 0; }
        .total { font-size: 1.2rem; font-weight: bold; color: #1b4332; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <h1>${this.esc(this.settings.appName)} — Insurance Valuation Report</h1>
      <p>Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div class="summary">
        <p>Total items: <strong>${items.length}</strong></p>
        <p class="total">Total valuation: ${c}${totalValue.toFixed(2)}</p>
      </div>
      <table>
        <thead><tr><th>#</th><th>Item Name</th><th>Manufacturer</th><th>Product Code</th><th>Condition</th><th>Purchase Price</th><th>Current Value</th><th>Storage Location</th></tr></thead>
        <tbody>
    `;
    items.forEach((item, i) => {
      const val = item.currentValue || item.purchasePrice || 0;
      html += `<tr><td>${i + 1}</td><td>${this.esc(item.name)}</td><td>${this.esc(item.manufacturer || '—')}</td><td>${this.esc(item.productCode || '—')}</td><td>${item.condition ? item.condition.replace('-', ' / ') : '—'}</td><td>${item.purchasePrice ? c + item.purchasePrice.toFixed(2) : '—'}</td><td>${val ? c + val.toFixed(2) : '—'}</td><td>${this.esc(item.storageLocation || '—')}</td></tr>`;
    });
    html += `</tbody></table>
      <p style="margin-top:20px;font-size:0.8rem;color:#999;">This report was generated by ${this.esc(this.settings.appName)} for insurance and valuation purposes only.</p>
      </body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    this.toast('Insurance report opened — you can print or save it from there.');
  },

  mascotMedium(mood = 'happy') {
    const mouth = mood === 'happy'
      ? '<path d="M42 68 Q56 80 70 68" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
      : '<path d="M44 74 Q56 66 68 74" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 112 100" width="100" height="90" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <rect x="10" y="20" width="92" height="58" rx="16" fill="#2d6a4f"/>
      <!-- Gold stripe -->
      <rect x="10" y="16" width="92" height="14" rx="7" fill="#c9a227"/>
      <!-- Chimney -->
      <rect x="44" y="2" width="24" height="16" rx="6" fill="#1b4332"/>
      <rect x="40" y="0" width="32" height="7" rx="4" fill="#0f2b1f"/>
      <!-- Steam puffs -->
      <g opacity="0.3" fill="white">
        <circle cx="40" cy="6" r="5"><animate attributeName="cy" values="6;0;6" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite"/></circle>
        <circle cx="72" cy="4" r="4"><animate attributeName="cy" values="4;-2;4" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.25;0;0.25" dur="4s" repeatCount="indefinite"/></circle>
      </g>
      <!-- Eyes -->
      <circle cx="40" cy="48" r="10" fill="white"/>
      <circle cx="41.5" cy="49" r="5" fill="#333"/>
      <circle cx="43" cy="47" r="1.5" fill="white"/>
      <circle cx="72" cy="48" r="10" fill="white"/>
      <circle cx="73.5" cy="49" r="5" fill="#333"/>
      <circle cx="75" cy="47" r="1.5" fill="white"/>
      <!-- Rosy cheeks -->
      <circle cx="28" cy="58" r="6" fill="#e8886850"/>
      <circle cx="84" cy="58" r="6" fill="#e8886850"/>
      ${mouth}
      <!-- Wheels -->
      <circle cx="28" cy="88" r="9" fill="#444" stroke="#555" stroke-width="2"/><circle cx="28" cy="88" r="3" fill="#c9a227"/>
      <circle cx="56" cy="88" r="8" fill="#444" stroke="#555" stroke-width="2"/><circle cx="56" cy="88" r="2.5" fill="#c9a227"/>
      <circle cx="84" cy="88" r="9" fill="#444" stroke="#555" stroke-width="2"/><circle cx="84" cy="88" r="3" fill="#c9a227"/>
      <!-- Headlamp -->
      <circle cx="10" cy="44" r="5" fill="#FFD700" opacity="0.8"/><circle cx="10" cy="44" r="2.5" fill="#FFF8DC"/>
    </svg>`;
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => app.init());
