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
    await this.loadSettings();
    await this.loadCategories();
    await this.loadAllItems();
    await this.loadStats();
    this.initTheme();
    this.applyAppName();
    this.showLanding();
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
    this.setNav('catalog');

    let params = '';
    if (filter) {
      if (filter.type === 'search') params = `?search=${encodeURIComponent(filter.value)}`;
      else if (filter.type === 'category') params = `?category=${filter.value}`;
      else if (filter.type === 'subcategory') params = `?subcategory=${filter.value}`;
    }

    await this.loadItems(params);
    await this.loadStats();
    document.getElementById('statsBar').style.display = '';
    this.render();
  },

  async showDetail(id) {
    this.currentView = 'detail';
    try {
      this.detailItem = await this.api(`/api/items/${id}`);
      this.render();
    } catch (e) { /* toast already shown */ }
  },

  showBackup() {
    this.currentView = 'backup';
    this.setNav('backup');
    document.getElementById('statsBar').style.display = 'none';
    this.render();
  },

  // ==================== Rendering ====================

  render() {
    const main = document.getElementById('mainContent');
    switch (this.currentView) {
      case 'landing': main.innerHTML = this.renderLanding(); break;
      case 'catalog': main.innerHTML = this.renderCatalog(); break;
      case 'detail':  main.innerHTML = this.renderDetail();  break;
      case 'backup':  main.innerHTML = this.renderBackupView(); break;
    }
  },

  renderStats() {
    const s = this.stats;
    if (!s) return;
    const bar = document.getElementById('statsContent');
    bar.innerHTML = `
      <span class="stat-tag accent">
        <span class="stat-icon">💷</span>
        Total Spent: <span class="stat-value">${this.settings.currency}${s.totalSpent.toLocaleString('en-GB', {minimumFractionDigits:2})}</span>
      </span>
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
        Total Items: <span class="stat-value">${s.totalItems}</span>
      </span>
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
            <div class="items-header">
              <div>
                <h2 class="items-title">${filterTitle}</h2>
                <span class="items-count">${this.items.length} item${this.items.length !== 1 ? 's' : ''}</span>
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
            ${this.items.length === 0 ? this.renderEmpty() : `
              <div class="items-grid">
                ${this.sortItems(this.items).map(item => this.renderItemCard(item)).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  renderSidebar() {
    const s = this.stats;
    return `
      <aside class="sidebar">
        <div class="sidebar-title">Categories</div>
        <ul class="category-list">
          <li class="subcategory-item ${!this.currentFilter ? 'active' : ''}"
              onclick="app.showCatalog()">
            All Items
            <span class="subcategory-count">${s ? s.totalItems : ''}</span>
          </li>
          ${this.categories.map(cat => `
            <li class="category-group-label" onclick="app.showCatalog({type:'category',value:'${cat.id}'})">
              ${cat.id === 'locomotives' ? '🚂' : '🚃'} ${cat.name}
            </li>
            <ul class="subcategory-list">
              ${cat.subcategories.map(sub => `
                <li class="subcategory-item ${this.currentFilter?.value === sub.id ? 'active' : ''}"
                    onclick="app.showCatalog({type:'subcategory',value:'${sub.id}'})">
                  ${sub.name}
                  <span class="subcategory-count">${s?.bySubcategory?.[sub.id]?.count ?? 0}</span>
                </li>
              `).join('')}
            </ul>
          `).join('')}
        </ul>
        <div class="sidebar-actions">
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
        </div>
        <div class="item-card-body">
          <div class="item-card-name">${this.esc(item.name)}</div>
          <div class="item-card-manufacturer">${this.esc(item.manufacturer || 'Unknown manufacturer')}</div>
          <div class="item-card-meta">
            <span class="item-card-price">${item.purchasePrice ? this.settings.currency + item.purchasePrice.toFixed(2) : '—'}</span>
            ${item.livery ? `<span class="item-card-livery">${this.esc(item.livery)}</span>` : ''}
          </div>
          ${this.daysSinceService(item.lastServiceDate) > (this.settings.serviceIntervalDays || 365) ? '<div class="item-card-service-warn">🔧 Service overdue</div>' : ''}
        </div>
      </div>
    `;
  },

  renderEmpty() {
    return `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <div class="empty-title">No items found</div>
        <div class="empty-text">
          ${this.currentFilter?.type === 'search'
            ? 'Try adjusting your search terms'
            : 'Start building your collection by adding your first item'}
        </div>
        <button class="btn btn-primary" onclick="app.openAddModal()">➕ Add First Item</button>
      </div>
    `;
  },

  // --- Detail View ---
  renderDetail() {
    const item = this.detailItem;
    if (!item) return '<div class="main-content"><p>Item not found</p></div>';

    const mainImg = item.images && item.images.length > 0
      ? `<img src="${item.images[0]}" id="detailMainImg" alt="${this.esc(item.name)}">`
      : `<span class="placeholder-icon">${item.categoryId === 'locomotives' ? '🚂' : '🚃'}</span>`;

    const catName = this.getCategoryName(item.categoryId);
    const subcatName = this.getSubcategoryName(item.subcategoryId);

    return `
      <div class="main-content">
        <div class="item-detail">
          <div class="detail-header">
            <a class="detail-back" onclick="app.showCatalog(app.currentFilter)">← Back to catalog</a>
            <div class="detail-actions">
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
                    <div class="detail-thumb ${i === 0 ? 'active' : ''}" onclick="app.switchImage('${img}', this)">
                      <img src="${img}" alt="Photo ${i+1}">
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            <div class="detail-info">
              <h1 class="detail-name">${this.esc(item.name)}</h1>
              ${subcatName ? `<span class="detail-category-badge">${catName} &mdash; ${subcatName}</span>` : ''}

              <div class="detail-fields">
                <div class="detail-field">
                  <span class="detail-field-label">Purchase Price</span>
                  <span class="detail-field-value price">${item.purchasePrice ? this.settings.currency + item.purchasePrice.toFixed(2) : '—'}</span>
                </div>
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
                  <span class="detail-field-label">Last Service Date</span>
                  <span class="detail-field-value">${item.lastServiceDate ? this.formatDate(item.lastServiceDate) : '—'}</span>
                  ${this.serviceStatusBadge(item.lastServiceDate)}
                </div>
                <div class="detail-field">
                  <span class="detail-field-label">Added to Catalog</span>
                  <span class="detail-field-value">${this.formatDate(item.createdAt)}</span>
                </div>
              </div>

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
      this.toast('Settings saved!');
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
    document.getElementById('formManufacturer').value = item.manufacturer || '';
    document.getElementById('formLivery').value = item.livery || '';
    document.getElementById('formPrice').value = item.purchasePrice || '';
    document.getElementById('formPlace').value = item.placeOfPurchase || '';
    document.getElementById('formServiceDate').value = item.lastServiceDate || '';
    document.getElementById('formGoesWellWith').value = item.goesWellWith || '';
    document.getElementById('formHistory').value = item.historicalBackground || '';

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

      const itemData = {
        name,
        categoryId,
        subcategoryId,
        manufacturer: document.getElementById('formManufacturer').value.trim(),
        livery: document.getElementById('formLivery').value.trim(),
        purchasePrice: document.getElementById('formPrice').value || 0,
        placeOfPurchase: document.getElementById('formPlace').value.trim(),
        lastServiceDate: document.getElementById('formServiceDate').value,
        goesWellWith: document.getElementById('formGoesWellWith').value.trim(),
        historicalBackground: document.getElementById('formHistory').value.trim(),
        images: allImages
      };

      if (this.editingItem) {
        await this.api(`/api/items/${this.editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        this.toast('Item updated successfully!');
      } else {
        await this.api('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        });
        this.toast('Item added to collection!');
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

  confirmDelete(id) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <h3>Delete Item?</h3>
        <p>This action cannot be undone. The item will be permanently removed from your collection.</p>
        <div class="confirm-actions">
          <button class="btn btn-outline" data-action="cancel">Cancel</button>
          <button class="btn btn-danger" data-action="delete">Delete</button>
        </div>
      </div>
    `;
    overlay.querySelector('[data-action="cancel"]').onclick = () => overlay.remove();
    overlay.querySelector('[data-action="delete"]').onclick = () => {
      this.deleteItem(id);
      overlay.remove();
    };
    document.body.appendChild(overlay);
  },

  async deleteItem(id) {
    try {
      await this.api(`/api/items/${id}`, { method: 'DELETE' });
      this.toast('Item deleted');
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
      this.toast('Data restored successfully!');
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
        const headers = ['Name','Category','Subcategory','Manufacturer','Livery','Purchase Price','Place of Purchase','Last Service Date','Goes Well With','Historical Background'];
        const rows = allItems.map(item => [
          `"${(item.name||'').replace(/"/g,'""')}"`,
          `"${this.getCategoryName(item.categoryId)}"`,
          `"${this.getSubcategoryName(item.subcategoryId)}"`,
          `"${(item.manufacturer||'').replace(/"/g,'""')}"`,
          `"${(item.livery||'').replace(/"/g,'""')}"`,
          item.purchasePrice || 0,
          `"${(item.placeOfPurchase||'').replace(/"/g,'""')}"`,
          `"${item.lastServiceDate||''}"`,
          `"${(item.goesWellWith||'').replace(/"/g,'""')}"`,
          `"${(item.historicalBackground||'').replace(/"/g,'""')}"`
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

  getFilterTitle() {
    if (!this.currentFilter) return 'All Items';
    if (this.currentFilter.type === 'search') return `Search: "${this.currentFilter.value}"`;
    if (this.currentFilter.type === 'category') return this.getCategoryName(this.currentFilter.value) || 'Category';
    if (this.currentFilter.type === 'subcategory') return this.getSubcategoryName(this.currentFilter.value) || 'Subcategory';
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
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span> ${this.esc(message)}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => app.init());
