/**
 * Train Depot - valuation module
 *
 * Extracted from app.js. eBay valuation settings & actions, valuation badges, dashboard, chart drawing utilities.
 *
 * Extends `app` in place via Object.assign. Depends on the core
 * `app` global (declared in app.js) and its base methods/state.
 */
Object.assign(app, {
  // ==================== eBay Valuation actions ====================

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

  // ==================== Valuation Badge / Detail renderers ====================

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

  // ==================== Dashboard + Charts ====================

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

        <div class="dashboard-charts-grid">
          <div class="dashboard-chart-container dashboard-span-2">
            <div class="dashboard-chart-title">By Manufacturer</div>
            <canvas id="chartManufacturer" width="800" height="300"></canvas>
          </div>

          <div class="dashboard-chart-container">
            <div class="dashboard-chart-title">By Condition</div>
            <canvas id="chartCondition" width="400" height="300"></canvas>
          </div>

          <div class="dashboard-chart-container">
            <div class="dashboard-chart-title">By DCC Status</div>
            <canvas id="chartDccStatus" width="400" height="300"></canvas>
          </div>

          <div class="dashboard-list dashboard-span-2">
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

    // Single-month case: bulk imports produce exactly one data point, which
    // renders as a lonely dot and looks broken. Replace with a reassuring
    // message centred on the canvas.
    if (data.length === 1) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme.text;
      ctx.font = 'bold 22px "Georgia", "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(data[0]) + ' items', width / 2, height / 2 - 16);
      ctx.fillStyle = theme.textMuted;
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('first catalogued ' + labels[0], width / 2, height / 2 + 14);
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText('Timeline will fill in as you add items across months', width / 2, height / 2 + 36);
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

});
