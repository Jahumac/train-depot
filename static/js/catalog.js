/**
 * Train Depot - Catalog views module
 *
 * Extracted from app.js. Handles the landing page, catalog browser,
 * sidebar, item cards, empty state, mobile tag bar, advanced filter
 * panel, timeline view, and the random spotlight card.
 *
 * Depends on: `app` global, `app.esc()`, `app.stats`, `app.items`,
 * `app.categories`, `app.settings`, `app.currentFilter`,
 * `app.currentSort`, `app.getCategoryName()`, `app.getSubcategoryName()`,
 * `app.mascotMedium()`, `app.renderValuationBadge()`,
 * `app.sortItems()`, `app.getGreeting()`, `app.render()`,
 * `app.setNav()`, `app.showDetail()`.
 */
Object.assign(app, {
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
        <div class="sidebar-drawer-backdrop" id="sidebarDrawerBackdrop" onclick="app.closeSidebarDrawer()"></div>
        <div class="catalog-layout">
          ${this.renderSidebar()}
          <div class="catalog-main">
            <button class="sidebar-drawer-trigger" onclick="app.openSidebarDrawer()" aria-label="Open categories and filters">
              <span class="stat-icon">📂</span>
              <span>Categories &amp; Tags</span>
            </button>
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
        <button class="sidebar-drawer-close" onclick="app.closeSidebarDrawer()" aria-label="Close filters">×</button>
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
          <div class="catalog-tags-title" onclick="app.toggleSidebarTags()">
            🏷️ Tags
            <span class="catalog-tags-count">${allTags.length}</span>
            <span class="catalog-tags-chevron ${this._sidebarTagsOpen || this.currentFilter?.type === 'tag' ? 'open' : ''}">▸</span>
          </div>
          <div class="catalog-tags-body ${this._sidebarTagsOpen || this.currentFilter?.type === 'tag' ? 'open' : ''}">
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
        </div>

        <div class="sidebar-actions">
          <button class="btn btn-outline btn-sm" onclick="app.addCategory()" style="width:100%;margin-bottom:8px;">📁 Add Category</button>
          <button class="btn btn-outline btn-sm" onclick="app.openAddModal()" style="width:100%">➕ Add New Item</button>
        </div>
      </aside>
    `;
  },

  renderItemCard(item) {
    let img;
    if (item.images && item.images.length > 0) {
      const fp = item.imageFocalPoints && item.imageFocalPoints[item.images[0]];
      const posStyle = fp ? ` style="object-position:${fp.x}% ${fp.y}%"` : '';
      img = `<img src="${item.images[0]}" alt="${this.esc(item.name)}" loading="lazy"${posStyle}>`;
    } else {
      img = `<div class="item-card-placeholder">${this.categorySilhouette(item.categoryId)}</div>`;
    }
    const subcatName = this.getSubcategoryName(item.subcategoryId);
    const overdue = this.daysSinceService(item.lastServiceDate) > (this.settings.serviceIntervalDays || 365);
    const price = item.purchasePrice ? this.settings.currency + item.purchasePrice.toFixed(2) : '—';
    const manufacturer = item.manufacturer ? this.esc(item.manufacturer) : '';
    // Match-hint — if we're viewing a search result, note which field matched
    // so the user can see why an item came up (helps explain unexpected hits
    // from historical-background or tag matches).
    const matchHint = this.currentFilter && this.currentFilter.type === 'search'
      ? this.describeSearchMatch(item, this.currentFilter.value)
      : '';
    return `
      <div class="item-card" onclick="app.showDetail('${item.id}')">
        <div class="item-card-image">
          ${img}
          ${subcatName ? `<span class="item-card-badge">${subcatName}</span>` : ''}
          ${item.wishlist ? '<span class="item-card-wishlist-badge" title="Wishlist">⭐</span>' : ''}
          ${overdue ? '<span class="item-card-service-icon" title="Service overdue">🔧</span>' : ''}
          ${item.runningNumber ? `<span class="item-card-number">${this.esc(item.runningNumber)}</span>` : ''}
        </div>
        <div class="item-card-body">
          <div class="item-card-name">${this.esc(item.name)}</div>
          <div class="item-card-meta">
            <span class="item-card-price">${price}</span>
            ${manufacturer ? `<span class="item-card-manufacturer">${manufacturer}</span>` : ''}
          </div>
          ${matchHint ? `<div class="item-card-match-hint">${matchHint}</div>` : ''}
          ${this.renderValuationBadge(item) ? `<div class="item-card-valuation">${this.renderValuationBadge(item)}</div>` : ''}
          ${item.tags && item.tags.length > 0 ? `
            <div class="item-card-tags">
              ${item.tags.slice(0, 4).map(t => `
                <span class="item-card-tag" onclick="event.stopPropagation();app.showCatalog({type:'tag',value:'${this.esc(t)}'})">#${this.esc(t)}</span>
              `).join('')}
              ${item.tags.length > 4 ? `<span class="item-card-tag-more">+${item.tags.length - 4}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Describe which field on this item matched the given search query.
   * Mirrors the server-side fields in database.searchItems, prioritised so
   * the most specific/identifying match wins. Returns '' if no match found
   * (defensive fallback — server already filtered, but a ranking tie might
   * happen if none of these fields contain the query).
   */
  describeSearchMatch(item, query) {
    if (!query) return '';
    const q = query.toLowerCase();
    const test = (v) => typeof v === 'string' && v.toLowerCase().includes(q);

    if (test(item.name))            return this.buildMatchHint('name', item.name, q);
    if (test(item.productCode))     return this.buildMatchHint('product code', item.productCode, q);
    if (test(item.runningNumber))   return this.buildMatchHint('running number', item.runningNumber, q);
    if (test(item.manufacturer))    return this.buildMatchHint('manufacturer', item.manufacturer, q);
    if (test(item.livery))          return this.buildMatchHint('livery', item.livery, q);
    if (item.tags && item.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q))) {
      const tag = item.tags.find(t => typeof t === 'string' && t.toLowerCase().includes(q));
      return this.buildMatchHint('tag', '#' + tag, q);
    }
    if (test(item.goesWellWith))    return this.buildMatchHint('goes well with', item.goesWellWith, q);
    if (test(item.historicalBackground)) return this.buildMatchHint('history', item.historicalBackground, q);
    return '';
  },

  /** Format a compact "matched in {field}: {snippet}" hint with a ~60-char window. */
  buildMatchHint(fieldLabel, fullText, q) {
    const lowered = fullText.toLowerCase();
    const idx = lowered.indexOf(q);
    const SNIPPET_LEN = 60;
    let snippet;
    if (fullText.length <= SNIPPET_LEN) {
      snippet = fullText;
    } else {
      const start = Math.max(0, idx - 20);
      const end = Math.min(fullText.length, start + SNIPPET_LEN);
      snippet = (start > 0 ? '\u2026' : '') + fullText.slice(start, end) + (end < fullText.length ? '\u2026' : '');
    }
    return `<span class="match-hint-label">matched in ${fieldLabel}:</span> ${this.esc(snippet)}`;
  },

  /** SVG silhouette shown when an item has no photo yet. */
  categorySilhouette(categoryId) {
    if (categoryId === 'locomotives') {
      // Side-view steam loco — boiler, cab, chimney, driving wheels.
      return `<svg class="item-silhouette" viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="currentColor">
          <rect x="16" y="26" width="100" height="28" rx="3"/>
          <rect x="110" y="18" width="34" height="36" rx="2"/>
          <rect x="30" y="8" width="14" height="20" rx="2"/>
          <rect x="26" y="4" width="22" height="6" rx="2"/>
          <rect x="60" y="14" width="10" height="14" rx="1.5"/>
          <rect x="8" y="50" width="140" height="6" rx="2"/>
        </g>
        <g fill="currentColor" opacity="0.9">
          <circle cx="38" cy="60" r="9"/>
          <circle cx="70" cy="60" r="12"/>
          <circle cx="100" cy="60" r="12"/>
          <circle cx="132" cy="60" r="9"/>
        </g>
      </svg>`;
    }
    // Wagon / rolling stock — covered van silhouette.
    return `<svg class="item-silhouette" viewBox="0 0 180 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g fill="currentColor">
        <rect x="20" y="18" width="140" height="36" rx="3"/>
        <path d="M50 18 L50 54 M90 18 L90 54 M130 18 L130 54" stroke="var(--color-bg-card)" stroke-width="2" opacity="0.35"/>
        <rect x="10" y="50" width="160" height="6" rx="2"/>
      </g>
      <g fill="currentColor" opacity="0.9">
        <circle cx="50" cy="62" r="9"/>
        <circle cx="130" cy="62" r="9"/>
      </g>
    </svg>`;
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

  // --- Mobile Tag Bar ---
  renderMobileTagBar() {
    const allTags = this.getAllTagsForSidebar();
    if (allTags.length === 0) return '';
    const activeTag = this.currentFilter?.type === 'tag' ? this.currentFilter.value : null;
    return `
      <div class="mobile-tag-bar">
        <span class="mobile-tag-bar-label">🏷️</span>
        <div class="mobile-tag-bar-scroll">
          ${activeTag ? `<button class="mobile-tag-chip mobile-tag-chip-clear" onclick="app.showCatalog()">✕ Clear</button>` : ''}
          ${allTags.map(tag => `
            <button class="mobile-tag-chip ${activeTag === tag.name ? 'active' : ''}"
                    onclick="app.showCatalog({type:'tag',value:'${this.esc(tag.name)}'})">
              #${this.esc(tag.name)} <span class="mobile-tag-chip-count">${tag.count}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  _sidebarTagsOpen: false,

  toggleSidebarTags() {
    this._sidebarTagsOpen = !this._sidebarTagsOpen;
    // Animate without full re-render
    const body = document.querySelector('.catalog-tags-body');
    const chevron = document.querySelector('.catalog-tags-chevron');
    if (body) body.classList.toggle('open', this._sidebarTagsOpen);
    if (chevron) chevron.classList.toggle('open', this._sidebarTagsOpen);
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

  // --- Advanced Search / Filter ---
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
    const panel = body?.closest('.filter-panel');
    if (body) body.classList.toggle('open', this.filterPanelOpen);
    if (panel) panel.classList.toggle('is-open', this.filterPanelOpen);
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

  // --- Collection Timeline ---
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

  // --- Random Spotlight ---
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
  }
});
