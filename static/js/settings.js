/**
 * Train Depot - settings module
 *
 * Extracted from app.js. Backup/Settings view, import/export, CSV, trash, data health, share link, print, QR code, insurance report.
 *
 * Extends `app` in place via Object.assign. Depends on the core
 * `app` global (declared in app.js) and its base methods/state.
 */
Object.assign(app, {
  // ==================== Backup & Settings View + saveSettings ====================

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
              <h3>📦 Full Backup (with photos)</h3>
              <p>Download a complete ZIP archive containing all catalogue data <strong>and every uploaded photo</strong>. Use this for offsite or long-term backup.</p>
              <button class="btn btn-primary" onclick="app.exportFullBackup()">Download Full Backup (.zip)</button>
            </div>

            <div class="backup-panel">
              <h3>📥 Restore Full Backup (with photos)</h3>
              <p>Restore a ZIP produced by <em>Full Backup</em> above — catalogue data and every photo will be put back in place. <strong>Warning:</strong> this replaces all current data and any photos with matching filenames.</p>
              <input type="file" id="importFullFile" accept=".zip" style="display:none" onchange="app.importFullBackup(event)">
              <button class="btn btn-outline" onclick="document.getElementById('importFullFile').click()">Choose ZIP File</button>
            </div>

            <div class="backup-panel">
              <h3>📤 Export Catalogue (data only)</h3>
              <p>Download a JSON file of all item data. Smaller than the full backup, but does not include photo files — use the Full Backup above if you want those too.</p>
              <button class="btn btn-outline" onclick="app.exportData()">Download JSON Backup</button>
            </div>

            <div class="backup-panel">
              <h3>📥 Import JSON (data only)</h3>
              <p>Restore from a JSON-only backup file. <strong>Warning:</strong> this will replace all current data. Photos are not affected.</p>
              <input type="file" id="importFile" accept=".json" style="display:none" onchange="app.importData(event)">
              <button class="btn btn-outline" onclick="document.getElementById('importFile').click()">Choose JSON Backup File</button>
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

  // ==================== Export / Import / CSV ====================

  // ==================== Export / Import ====================

  exportData() {
    window.location.href = '/api/export';
    this.toast('Backup download started');
  },

  exportFullBackup() {
    window.location.href = '/api/export/full';
    this.toast('Full backup (with photos) packaging \u2014 this may take a moment');
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

  async importFullBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    const ok = await this.showConfirmModal({
      title: 'Restore full backup?',
      message: `<strong>${this.esc(file.name)}</strong> will replace all catalogue data and overwrite any photos with matching filenames. This can\u2019t be undone \u2014 make sure you have a recent backup first.`,
      confirmText: 'Restore backup',
      confirmClass: 'btn-primary',
      icon: '📦'
    });
    if (!ok) { event.target.value = ''; return; }

    const form = new FormData();
    form.append('file', file, file.name);
    this.toast('Unpacking backup \u2014 this may take a moment\u2026');

    try {
      const res = await fetch('/api/import/full', { method: 'POST', body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Restore failed');
      this.toast(`All aboard \u2014 restored with ${json.photos || 0} photo${json.photos === 1 ? '' : 's'}!`);
      // Reload so service worker + stale state are flushed end-to-end
      setTimeout(() => window.location.reload(), 400);
    } catch (e) {
      this.toast('Restore failed: ' + e.message, 'error');
    }
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
        this.toast(`${result.errors.length} row${result.errors.length === 1 ? '' : 's'} skipped — check the data and try again`, 'warning');
      }
      await this.loadAllItems();
      await this.loadStats();
      await this.loadCategories();
      this.showCatalog();
    } catch (e) { /* toast shown */ }
    event.target.value = '';
  },

  // Styled modal dialogs (showInputModal / showConfirmModal) live in modals.js

  // ==================== Trash / Bin (soft delete) ====================

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

  // ==================== Data Health Check + Maintenance Reminders ====================

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

});
